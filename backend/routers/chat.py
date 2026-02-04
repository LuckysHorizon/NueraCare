from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.schemas import ChatRequest, ChatResponse
from services.groq_service import GroqService
from services.parser_service import parse_report_text
from services.sanity_service import SanityService
from utils.safety import default_disclaimer, safe_refusal
from utils.response_logger import log_response

router = APIRouter(tags=["chat"])
report_service = SanityService()
groq_service = GroqService()


@router.post("/chat-with-report", response_model=ChatResponse)
async def chat_with_report(payload: ChatRequest):
    """Chat with AI about an uploaded medical report with gentle, non-diagnostic explanations."""
    
    # Validate inputs
    if not payload.report_id or not payload.report_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Report ID is required."
        )
    
    if not payload.user_id or not payload.user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="User ID is required."
        )
    
    if not payload.message or not payload.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )
    
    # Validate mode
    valid_modes = ["normal", "explain_simple"]
    if payload.mode and payload.mode not in valid_modes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode. Must be one of: {', '.join(valid_modes)}"
        )
    
    try:
        record = report_service.get_report(payload.report_id, payload.user_id)
        if not record:
            raise HTTPException(
                status_code=404,
                detail="Report not found. Please check report ID and user ID are correct."
            )

        extracted_text = record.get("extracted_text") or ""
        if not extracted_text.strip():
            return ChatResponse(
                report_id=payload.report_id,
                user_id=payload.user_id,
                response="Some parts of this report are hard to read. I'll explain what I can see clearly. A doctor can review the full report.",
                used_model=None,
                disclaimers=[default_disclaimer()],
            )

        parsed_values = [item.model_dump() for item in parse_report_text(extracted_text)]

        if not parsed_values:
            return ChatResponse(
                report_id=payload.report_id,
                user_id=payload.user_id,
                response=safe_refusal(),
                used_model=None,
                disclaimers=[default_disclaimer()],
            )

        explain_simple = payload.mode == "explain_simple"

        result = groq_service.generate_response(
            message=payload.message,
            extracted_text=extracted_text,
            parsed_values=parsed_values,
            voice_mode=bool(payload.voice_mode),
            explain_simple=explain_simple,
        )

        disclaimers = [default_disclaimer()]
        response_text = result["response"] or safe_refusal()
        
        log_response(
            {
                "report_id": payload.report_id,
                "user_id": payload.user_id,
                "mode": payload.mode,
                "voice_mode": bool(payload.voice_mode),
                "used_model": result.get("model"),
                "message": payload.message,
                "response": response_text,
            }
        )

        return ChatResponse(
            report_id=payload.report_id,
            user_id=payload.user_id,
            response=response_text,
            used_model=result.get("model"),
            disclaimers=disclaimers,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )
