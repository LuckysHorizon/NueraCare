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
                print(f"✓ Groq API response received")
        except Exception as e:
            print(f"❌ Groq API failed: {type(e).__name__}: {str(e)}")
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
        
        print(f"📝 Raw Groq response (first 200 chars): {content[:200]}")

        if not content:
            return {
                "response": build_fallback_response(parsed_values),
                "model": None,
            }

        # Clean up the response: remove excessive newlines and format nicely
        # Replace multiple newlines with double newlines (for paragraph breaks)
        lines = content.split('\n')
        cleaned_lines = []
        prev_empty = False
        skip_table = False
        
        for line in lines:
            line = line.strip()
            
            # Skip markdown table lines (those with | or ---)
            if line.startswith('|') or line.startswith('---') or line == '':
                skip_table = True
                if not prev_empty:
                    cleaned_lines.append('')  # Add paragraph break
                prev_empty = True
                continue
            
            # If we encounter normal text again after table, resume
            if skip_table and line and not line.startswith('|'):
                skip_table = False
            
            if not line:
                if not prev_empty:
                    cleaned_lines.append('')  # Single empty line for paragraph break
                prev_empty = True
            else:
                cleaned_lines.append(line)
                prev_empty = False
        
        # Rejoin and limit to reasonable length
        cleaned_response = '\n'.join(cleaned_lines).strip()
        
        # Remove excessive blank lines
        while '\n\n\n' in cleaned_response:
            cleaned_response = cleaned_response.replace('\n\n\n', '\n\n')
        
        if len(cleaned_response) > 1500:
            cleaned_response = cleaned_response[:1500] + '...'

        print(f"✓ Response cleaned and formatted")
        return {"response": cleaned_response, "model": self.model}
