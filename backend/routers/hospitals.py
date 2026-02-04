"""
Hospitals API Router
Endpoints for searching and retrieving hospital information
"""

from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel
import logging
import time
import hashlib

from services.google_places_service import GooglePlacesService

logger = logging.getLogger(__name__)

router = APIRouter()

# Simple in-memory cache and rate limiting
CACHE_TTL_SECONDS = 120
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 60

_cache: Dict[str, Tuple[float, Any]] = {}
_rate_limits: Dict[str, Tuple[int, float]] = {}

# Global service instance (initialized on first use)
_google_places_service: Optional[GooglePlacesService] = None


def get_google_places_service() -> GooglePlacesService:
    """Get or initialize Google Places service (lazy loading)"""
    global _google_places_service
    if _google_places_service is None:
        try:
            _google_places_service = GooglePlacesService()
        except ValueError as e:
            logger.warning(f"Google Places API not configured: {e}")
            raise
    return _google_places_service


def _make_cache_key(prefix: str, params: Dict[str, Any]) -> str:
    raw = prefix + "|" + "|".join(f"{k}={params[k]}" for k in sorted(params))
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()


def _get_cached(key: str) -> Optional[Any]:
    item = _cache.get(key)
    if not item:
        return None
    ts, value = item
    if time.time() - ts > CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return value


def _set_cache(key: str, value: Any) -> None:
    _cache[key] = (time.time(), value)


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    count, reset_at = _rate_limits.get(client_ip, (0, now + RATE_LIMIT_WINDOW_SECONDS))
    if now > reset_at:
        count, reset_at = 0, now + RATE_LIMIT_WINDOW_SECONDS
    count += 1
    _rate_limits[client_ip] = (count, reset_at)
    if count > RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again shortly.")


def _filter_hospitals(hospitals: List[Dict[str, Any]], min_rating: float) -> List[Dict[str, Any]]:
    filtered = [h for h in hospitals if "hospital" in [t.lower() for t in h.get("types", [])]]
    if min_rating > 0:
        filtered = [h for h in filtered if h.get("rating", 0) >= min_rating]
    return filtered


# Response Models
class HospitalResponse(BaseModel):
    placeId: str
    name: str
    rating: float
    reviewCount: int
    address: str
    phone: Optional[str] = None
    distance: float
    latitude: float
    longitude: float
    openNow: Optional[bool] = None
    types: List[str] = []


class NearbyHospitalsResponse(BaseModel):
    hospitals: List[HospitalResponse]
    total: int
    latitude: float
    longitude: float
    radius: int


@router.get("/hospitals/nearby", response_model=NearbyHospitalsResponse)
async def search_nearby_hospitals(
    request: Request,
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters (default 5km)"),
    limit: int = Query(20, description="Maximum number of results (default 20)"),
    min_rating: float = Query(0, description="Minimum rating filter (0-5)"),
) -> NearbyHospitalsResponse:
    """
    Search for hospitals near a location
    
    Args:
        latitude: User's latitude coordinate
        longitude: User's longitude coordinate
        radius: Search radius in meters (default: 5000m = 5km)
        limit: Maximum number of hospitals to return (default: 20)
        
    Returns:
        List of hospitals with distance, rating, and details
        
    Example:
        GET /api/hospitals/nearby?latitude=17.3850&longitude=78.4867&radius=5000&limit=20
    """
    
    try:
        _check_rate_limit(request.client.host if request.client else "unknown")
        google_places = get_google_places_service()
    except ValueError as e:
        logger.error(f"Google Places API not configured: {e}")
        raise HTTPException(
            status_code=500,
            detail="Hospital search service is not available. Please configure GOOGLE_PLACES_API_KEY."
        )
    
    try:
        # Validate coordinates
        if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
            raise HTTPException(
                status_code=400,
                detail="Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
            )
        
        # Validate radius (100m to 50km)
        if radius < 100 or radius > 50000:
            raise HTTPException(
                status_code=400,
                detail="Radius must be between 100 and 50000 meters."
            )
        
        # Validate limit
        if limit < 1 or limit > 50:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 50."
            )
        
        logger.info(f"🏥 Searching hospitals at ({latitude}, {longitude}), radius: {radius}m")
        
        cache_key = _make_cache_key(
            "nearby",
            {
                "lat": round(latitude, 5),
                "lon": round(longitude, 5),
                "radius": radius,
                "limit": limit,
                "min_rating": min_rating,
            },
        )
        cached = _get_cached(cache_key)
        if cached is not None:
            hospitals = cached
        else:
            # Search hospitals
            hospitals = google_places.search_hospitals_nearby(
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                max_results=limit * 2,
            )
            hospitals = _filter_hospitals(hospitals, min_rating)[:limit]
            _set_cache(cache_key, hospitals)
        
        logger.info(f"✅ Found {len(hospitals)} hospitals")
        
        return NearbyHospitalsResponse(
            hospitals=hospitals,
            total=len(hospitals),
            latitude=latitude,
            longitude=longitude,
            radius=radius,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error searching hospitals: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error searching hospitals: {str(e)}"
        )


@router.get("/hospitals/search", response_model=NearbyHospitalsResponse)
async def search_hospitals(
    request: Request,
    query: str = Query(..., description="Hospital name or speciality"),
    latitude: Optional[float] = Query(None, description="User latitude"),
    longitude: Optional[float] = Query(None, description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    limit: int = Query(20, description="Maximum number of results"),
    min_rating: float = Query(0, description="Minimum rating filter (0-5)"),
) -> NearbyHospitalsResponse:
    """
    Search hospitals by name or speciality near a location
    """
    
    try:
        _check_rate_limit(request.client.host if request.client else "unknown")
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    # Default to Hyderabad if no coordinates provided
    if latitude is None or longitude is None:
        latitude = 17.3850
        longitude = 78.4867
    
    try:
        cache_key = _make_cache_key(
            "search",
            {
                "q": query.lower().strip(),
                "lat": round(latitude, 5),
                "lon": round(longitude, 5),
                "radius": radius,
                "limit": limit,
                "min_rating": min_rating,
            },
        )
        cached = _get_cached(cache_key)
        if cached is not None:
            filtered = cached
        else:
            hospitals = google_places.search_hospitals_nearby(
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                max_results=limit * 3,
            )
            hospitals = _filter_hospitals(hospitals, min_rating)
            query_lower = query.lower()
            filtered = [
                h for h in hospitals
                if query_lower in h.get("name", "").lower() or query_lower in h.get("address", "").lower()
            ]
            _set_cache(cache_key, filtered)
        
        return NearbyHospitalsResponse(
            hospitals=filtered[:limit],
            total=len(filtered),
            latitude=latitude,
            longitude=longitude,
            radius=radius,
        )
        
    except Exception as e:
        logger.error(f"Error searching hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hospitals/top", response_model=List[HospitalResponse])
async def get_top_hospitals(
    request: Request,
    latitude: float = Query(17.3850, description="User latitude"),
    longitude: float = Query(78.4867, description="User longitude"),
    radius: int = Query(10000, description="Search radius"),
    limit: int = Query(5, description="Number of top hospitals to return"),
    min_rating: float = Query(0, description="Minimum rating filter (0-5)"),
) -> List[HospitalResponse]:
    """
    Get top-rated hospitals near a location
    """
    
    try:
        _check_rate_limit(request.client.host if request.client else "unknown")
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    try:
        cache_key = _make_cache_key(
            "top",
            {
                "lat": round(latitude, 5),
                "lon": round(longitude, 5),
                "radius": radius,
                "limit": limit,
                "min_rating": min_rating,
            },
        )
        cached = _get_cached(cache_key)
        if cached is not None:
            return cached

        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=50,
        )
        hospitals = _filter_hospitals(hospitals, min_rating)[:limit]
        _set_cache(cache_key, hospitals)
        return hospitals
        
    except Exception as e:
        logger.error(f"Error getting top hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hospitals/emergency", response_model=List[HospitalResponse])
async def get_emergency_hospitals(
    request: Request,
    latitude: float = Query(17.3850, description="User latitude"),
    longitude: float = Query(78.4867, description="User longitude"),
    radius: int = Query(5000, description="Search radius"),
    limit: int = Query(10, description="Number of results"),
    min_rating: float = Query(0, description="Minimum rating filter (0-5)"),
) -> List[HospitalResponse]:
    """
    Get hospitals with emergency services nearby
    """
    
    try:
        _check_rate_limit(request.client.host if request.client else "unknown")
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    try:
        cache_key = _make_cache_key(
            "emergency",
            {
                "lat": round(latitude, 5),
                "lon": round(longitude, 5),
                "radius": radius,
                "limit": limit,
                "min_rating": min_rating,
            },
        )
        cached = _get_cached(cache_key)
        if cached is not None:
            return cached

        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=limit * 3,
        )
        hospitals = _filter_hospitals(hospitals, min_rating)
        
        # Filter by hospitals that are open now
        emergency_hospitals = [
            h for h in hospitals
            if h.get("openNow", True)
        ]
        emergency_hospitals = emergency_hospitals[:limit]
        _set_cache(cache_key, emergency_hospitals)
        return emergency_hospitals
        
    except Exception as e:
        logger.error(f"Error getting emergency hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hospitals/health-check")
async def hospitals_health_check() -> dict:
    """
    Health check for hospitals API
    
    Returns:
        Status of hospital search service
    """
    try:
        google_places = get_google_places_service()
        return {
            "status": "healthy",
            "service": "Google Places API",
            "message": "Hospital search service is operational"
        }
    except ValueError as e:
        logger.warning(f"Google Places API not configured: {e}")
        return {
            "status": "unavailable",
            "message": "Google Places API key not configured"
        }


@router.get("/hospitals/details")
async def hospital_details(
    request: Request,
    place_id: str = Query(..., description="Google Place ID"),
) -> dict:
    """Get phone number and details for a hospital."""
    try:
        _check_rate_limit(request.client.host if request.client else "unknown")
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")

    cache_key = _make_cache_key("details", {"place_id": place_id})
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    details = google_places.get_place_details(place_id)
    if details.get("status") != "OK":
        raise HTTPException(status_code=404, detail="Place details not found")

    result = details.get("result", {})
    payload = {
        "placeId": place_id,
        "phone": result.get("formatted_phone_number"),
        "openingHours": result.get("opening_hours", {}).get("weekday_text", []),
        "website": result.get("website"),
        "url": result.get("url"),
    }
    _set_cache(cache_key, payload)
    return payload
