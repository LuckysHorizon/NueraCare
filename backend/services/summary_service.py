"""
Summary Service with Caching and Rate Limiting
Generates AI summaries for medical reports with intelligent caching to save API credits.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict

import httpx

from utils.safety import build_system_prompt


class SummaryCache:
    """In-memory cache for summaries with TTL (Time To Live)."""
    
    def __init__(self, ttl_hours: int = 24):
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_hours = ttl_hours
    
    def get(self, report_id: str) -> Optional[str]:
        """Get cached summary if available and not expired."""
        if report_id not in self.cache:
            return None
        
        cached_data = self.cache[report_id]
        cached_time = cached_data.get("timestamp")
        
        if not cached_time:
            return None
        
        # Check if cache has expired
        if datetime.now() - cached_time > timedelta(hours=self.ttl_hours):
            del self.cache[report_id]
            return None
        
        return cached_data.get("summary")
    
    def set(self, report_id: str, summary: str) -> None:
        """Store summary in cache with current timestamp."""
        self.cache[report_id] = {
            "summary": summary,
            "timestamp": datetime.now()
        }
    
    def clear(self) -> None:
        """Clear all cached summaries."""
        self.cache.clear()


class RateLimiter:
    """Token bucket rate limiter for API calls."""
    
    def __init__(self, max_calls: int = 10, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self.calls: defaultdict = defaultdict(list)
    
    def is_allowed(self, user_id: str) -> bool:
        """Check if user is allowed to make API call."""
        now = time.time()
        user_calls = self.calls[user_id]
        
        # Remove calls outside the window
        user_calls[:] = [call_time for call_time in user_calls if now - call_time < self.window_seconds]
        
        # Check if under limit
        if len(user_calls) < self.max_calls:
            user_calls.append(now)
            return True
        
        return False
    
    def get_wait_time(self, user_id: str) -> int:
        """Get seconds to wait before next allowed call."""
        if not self.calls[user_id]:
            return 0
        
        oldest_call = min(self.calls[user_id])
        wait_time = self.window_seconds - (time.time() - oldest_call)
        return max(0, int(wait_time))


class SummaryService:
    """Service for generating and managing medical report summaries."""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self.cache = SummaryCache(ttl_hours=24)  # Cache for 24 hours
        self.rate_limiter = RateLimiter(max_calls=10, window_seconds=60)  # 10 calls per minute
    
    def _can_call_api(self) -> bool:
        """Check if API key is available."""
        return bool(self.api_key)
    
    def _build_summary_prompt(self, extracted_text: str, parsed_values: List[Dict[str, Any]]) -> str:
        """Build prompt for generating report summary."""
        
        # Format parsed values
        formatted_values = "\n".join(
            f"  • {item.get('test_name', 'Unknown')}: "
            f"{item.get('value', 'N/A')} {item.get('unit', '')} "
            f"(Range: {item.get('reference_range', 'N/A')}) - {item.get('classification', '')}"
            for item in parsed_values[:15]
        )
        
        return f"""Analyze this medical report and provide a concise, easy-to-understand summary.

=== REPORT DATA ===
{extracted_text[:2000]}

=== PARSED TEST RESULTS ===
{formatted_values if formatted_values else "(No parsed values)"}

=== INSTRUCTIONS ===
Generate a brief summary (3-5 sentences) that:
1. Identifies the type of medical report
2. Highlights key findings (normal or abnormal values)
3. Uses simple, non-technical language
4. Avoids making diagnoses
5. Encourages consultation with healthcare provider

Keep it friendly, informative, and reassuring."""
    
    async def generate_summary(
        self,
        report_id: str,
        user_id: str,
        extracted_text: str,
        parsed_values: List[Dict[str, Any]],
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """
        Generate summary for a medical report with caching and rate limiting.
        
        Args:
            report_id: Unique report identifier
            user_id: User identifier for rate limiting
            extracted_text: Raw text extracted from report
            parsed_values: Parsed medical values
            force_regenerate: If True, bypass cache and regenerate
        
        Returns:
            Dict with summary, cached status, and metadata
        """
        
        # Check cache first (unless force regenerate)
        if not force_regenerate:
            cached_summary = self.cache.get(report_id)
            if cached_summary:
                return {
                    "summary": cached_summary,
                    "cached": True,
                    "generated_at": datetime.now().isoformat(),
                    "source": "cache"
                }
        
        # Check rate limit
        if not self.rate_limiter.is_allowed(user_id):
            wait_time = self.rate_limiter.get_wait_time(user_id)
            return {
                "summary": None,
                "error": f"Rate limit exceeded. Please wait {wait_time} seconds.",
                "cached": False,
                "wait_time": wait_time
            }
        
        # Check if API is available
        if not self._can_call_api():
            return {
                "summary": "Summary generation is currently unavailable. Please try again later.",
                "cached": False,
                "error": "API key not configured"
            }
        
        # Generate new summary
        try:
            summary_prompt = self._build_summary_prompt(extracted_text, parsed_values)
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a medical assistant that creates simple, friendly summaries of medical reports. Use clear language and avoid technical jargon."
                    },
                    {
                        "role": "user",
                        "content": summary_prompt
                    }
                ],
                "temperature": 0.3,  # Lower temperature for more consistent summaries
                "max_tokens": 300,  # Limit tokens for concise summaries
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                
                if response.status_code != 200:
                    return {
                        "summary": None,
                        "cached": False,
                        "error": f"API error: {response.status_code}"
                    }
                
                data = response.json()
                summary = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                if summary:
                    # Cache the summary
                    self.cache.set(report_id, summary)
                    
                    return {
                        "summary": summary.strip(),
                        "cached": False,
                        "generated_at": datetime.now().isoformat(),
                        "source": "api",
                        "model": self.model,
                        "tokens_used": data.get("usage", {}).get("total_tokens", 0)
                    }
                
                return {
                    "summary": None,
                    "cached": False,
                    "error": "Empty response from API"
                }
                
        except Exception as e:
            return {
                "summary": None,
                "cached": False,
                "error": f"Failed to generate summary: {str(e)}"
            }
