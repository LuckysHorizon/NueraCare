from __future__ import annotations

import os
from typing import Any, Dict, List, Optional

import httpx

from utils.safety import build_system_prompt, build_fallback_response


class GroqService:
    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    def _can_call(self) -> bool:
        return bool(self.api_key)
    
    def _build_user_prompt(self, extracted_text: str, parsed_values: List[Dict[str, Any]], user_message: str) -> str:
        """Build a well-structured user prompt for Groq AI with medical context."""
        
        # Format parsed values in a clear, readable way
        formatted_values = "\n".join(
            f"  • {item.get('test_name', 'Unknown Test')}: "
            f"{item.get('value', 'N/A')} {item.get('unit', '')}"
            f" (Range: {item.get('reference_range', 'Not specified')})"
            f" - {item.get('classification', '')}"
            for item in parsed_values[:10]  # Limit to first 10 for token efficiency
        )
        
        prompt_parts = [
            "=== MEDICAL REPORT DATA ===",
            "",
            "Raw Report Text (extracted from uploaded document):",
            f"{extracted_text[:1500]}...",  # Limit extracted text to prevent token overflow
            "",
            "Parsed Test Results:",
            formatted_values if formatted_values else "  (No values parsed from report)",
            "",
            "=== PATIENT'S QUESTION ===",
            f"{user_message}",
            "",
            "=== INSTRUCTIONS ===",
            "- Base your answer ONLY on the medical report data provided above",
            "- If the report doesn't contain information to answer the question, say so gently",
            "- Never invent or assume medical information not in the report",
            "- Remember: EXPLAIN, don't DIAGNOSE",
            "- Always end with encouragement to discuss with their healthcare provider",
        ]
        
        return "\n".join(prompt_parts)

    def generate_response(
        self,
        message: str,
        extracted_text: str,
        parsed_values: List[Dict[str, Any]],
        voice_mode: bool,
        explain_simple: bool,
    ) -> Dict[str, Optional[str]]:
        if not self._can_call():
            return {
                "response": build_fallback_response(parsed_values),
                "model": None,
            }

        system_prompt = build_system_prompt(voice_mode, explain_simple)
        
        # Build structured user prompt with clear sections
        user_prompt = self._build_user_prompt(
            extracted_text=extracted_text,
            parsed_values=parsed_values,
            user_message=message
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 600,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=15.0) as client:
                response = client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
        except Exception:
            return {
                "response": build_fallback_response(parsed_values),
                "model": None,
            }

        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        if not content:
            return {
                "response": build_fallback_response(parsed_values),
                "model": None,
            }

        return {"response": content, "model": self.model}
