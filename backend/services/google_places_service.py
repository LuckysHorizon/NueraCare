"""
Google Places API Service for Hospital Search
Handles nearby hospital search, place details, and distance calculations
"""

import os
import math
import requests
from typing import Optional, Dict, List, Any
from datetime import datetime

GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place"


def get_api_key() -> str:
    """Get Google Places API key from environment"""
    return os.getenv("GOOGLE_PLACES_API_KEY", "")


class HaversineCalculator:
    """Calculate distance between two coordinates using Haversine formula"""

    @staticmethod
    def distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance in kilometers between two points
        Args:
            lat1, lon1: User location
            lat2, lon2: Place location
        Returns:
            Distance in kilometers
        """
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c


class GooglePlacesService:
    """Service for Google Places API interactions"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or get_api_key()
        if not self.api_key:
            raise ValueError("GOOGLE_PLACES_API_KEY not set in environment variables")
        self.base_url = GOOGLE_PLACES_BASE_URL

    def nearby_search(
        self,
        latitude: float,
        longitude: float,
        radius: int = 5000,
        keyword: str = "hospital",
        page_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search for hospitals near a location using Nearby Search
        
        Args:
            latitude: User latitude
            longitude: User longitude
            radius: Search radius in meters (default 5km)
            keyword: Search keyword (default "hospital")
            page_token: Token for pagination
            
        Returns:
            Dict with results, next_page_token, and status
        """
        url = f"{self.base_url}/nearbysearch/json"
        
        params = {
            "location": f"{latitude},{longitude}",
            "radius": radius,
            "type": "hospital",
            "key": self.api_key,
        }

        if page_token:
            params["page_token"] = page_token

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                print(f"Google Places API error: {data.get('status')}")
                return {"results": [], "next_page_token": None, "status": data.get("status")}

            return {
                "results": data.get("results", []),
                "next_page_token": data.get("next_page_token"),
                "status": data.get("status"),
            }
        except requests.RequestException as e:
            print(f"Error calling Google Places API: {e}")
            return {"results": [], "next_page_token": None, "status": "ERROR", "error": str(e)}

    def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific place
        
        Args:
            place_id: Google Place ID
            
        Returns:
            Dict with place details
        """
        url = f"{self.base_url}/details/json"
        
        params = {
            "place_id": place_id,
            "fields": "formatted_phone_number,opening_hours,website,url,type,reviews",
            "key": self.api_key,
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data.get("status") != "OK":
                return {"status": data.get("status")}

            return {
                "status": "OK",
                "result": data.get("result", {}),
            }
        except requests.RequestException as e:
            print(f"Error getting place details: {e}")
            return {"status": "ERROR", "error": str(e)}

    def parse_hospital_result(
        self,
        result: Dict[str, Any],
        user_lat: float,
        user_lon: float,
    ) -> Dict[str, Any]:
        """
        Parse Google Places result into standardized hospital object
        
        Args:
            result: Raw Google Places result
            user_lat, user_lon: User location for distance calculation
            
        Returns:
            Standardized hospital dict
        """
        try:
            location = result.get("geometry", {}).get("location", {})
            lat = location.get("lat", 0)
            lon = location.get("lng", 0)
            
            # Calculate distance
            distance = HaversineCalculator.distance(user_lat, user_lon, lat, lon)
            
            # Extract rating and reviews
            rating = result.get("rating", 0)
            review_count = result.get("user_ratings_total", 0)
            
            # Check opening hours
            opening_hours = result.get("opening_hours", {})
            open_now = opening_hours.get("open_now", True)
            
            hospital = {
                "placeId": result.get("place_id", ""),
                "name": result.get("name", ""),
                "rating": rating,
                "reviewCount": review_count,
                "address": result.get("vicinity", ""),
                "distance": round(distance, 1),
                "latitude": lat,
                "longitude": lon,
                "openNow": open_now,
                "types": result.get("types", []),
                "photo": result.get("photos", [{}])[0].get("photo_reference") if result.get("photos") else None,
            }
            
            return hospital
        except Exception as e:
            print(f"Error parsing hospital result: {e}")
            return {}

    def search_hospitals_nearby(
        self,
        latitude: float,
        longitude: float,
        radius: int = 5000,
        max_results: int = 20,
    ) -> List[Dict[str, Any]]:
        """
        Complete workflow: search nearby hospitals and parse results
        
        Args:
            latitude: User latitude
            longitude: User longitude
            radius: Search radius in meters
            max_results: Maximum number of results to return
            
        Returns:
            List of standardized hospital objects
        """
        hospitals = []
        page_token = None
        
        while len(hospitals) < max_results:
            search_result = self.nearby_search(
                latitude=latitude,
                longitude=longitude,
                radius=radius,
                page_token=page_token,
            )
            
            if search_result.get("status") != "OK":
                break
            
            # Parse results
            for result in search_result.get("results", []):
                if len(hospitals) >= max_results:
                    break
                    
                hospital = self.parse_hospital_result(result, latitude, longitude)
                if hospital:
                    hospitals.append(hospital)
            
            # Check for next page
            page_token = search_result.get("next_page_token")
            if not page_token:
                break
            
            # Small delay to avoid API throttling
            import time
            time.sleep(2)
        
        # Sort by rating and distance
        hospitals.sort(key=lambda x: (-x.get("rating", 0), x.get("distance", float('inf'))))
        
        return hospitals[:max_results]
