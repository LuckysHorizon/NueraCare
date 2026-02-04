"""
Hospitals API Router
Endpoints for searching and retrieving hospital information
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import logging

from services.google_places_service import GooglePlacesService

logger = logging.getLogger(__name__)

router = APIRouter()

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
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters (default 5km)"),
    limit: int = Query(20, description="Maximum number of results (default 20)"),
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
        
        # Search hospitals
        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=limit,
        )
        
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
    query: str = Query(..., description="Hospital name or speciality"),
    latitude: Optional[float] = Query(None, description="User latitude"),
    longitude: Optional[float] = Query(None, description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters"),
    limit: int = Query(20, description="Maximum number of results"),
) -> NearbyHospitalsResponse:
    """
    Search hospitals by name or speciality near a location
    """
    
    try:
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    # Default to Hyderabad if no coordinates provided
    if latitude is None or longitude is None:
        latitude = 17.3850
        longitude = 78.4867
    
    try:
        # For now, use nearby search and filter by query
        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=limit * 2,
        )
        
        # Filter by query
        filtered = [
            h for h in hospitals
            if query.lower() in h["name"].lower()
        ]
        
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
    latitude: float = Query(17.3850, description="User latitude"),
    longitude: float = Query(78.4867, description="User longitude"),
    radius: int = Query(10000, description="Search radius"),
    limit: int = Query(5, description="Number of top hospitals to return"),
) -> List[HospitalResponse]:
    """
    Get top-rated hospitals near a location
    """
    
    try:
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    try:
        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=50,
        )
        
        return hospitals[:limit]
        
    except Exception as e:
        logger.error(f"Error getting top hospitals: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hospitals/emergency", response_model=List[HospitalResponse])
async def get_emergency_hospitals(
    latitude: float = Query(17.3850, description="User latitude"),
    longitude: float = Query(78.4867, description="User longitude"),
    radius: int = Query(5000, description="Search radius"),
    limit: int = Query(10, description="Number of results"),
) -> List[HospitalResponse]:
    """
    Get hospitals with emergency services nearby
    """
    
    try:
        google_places = get_google_places_service()
    except ValueError:
        raise HTTPException(status_code=500, detail="Hospital search service unavailable")
    
    try:
        hospitals = google_places.search_hospitals_nearby(
            latitude=latitude,
            longitude=longitude,
            radius=radius,
            max_results=limit * 2,
        )
        
        # Filter by hospitals that are open now
        emergency_hospitals = [
            h for h in hospitals
            if h.get("openNow", True)
        ]
        
        return emergency_hospitals[:limit]
        
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
