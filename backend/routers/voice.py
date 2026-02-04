from __future__ import annotations

from fastapi import APIRouter

from models.schemas import VoiceChatRequest, ChatResponse
from routers.chat import chat_with_report

router = APIRouter(tags=["voice"])


@router.post("/voice-chat", response_model=ChatResponse)
async def voice_chat(payload: VoiceChatRequest):
    payload.voice_mode = True
    return await chat_with_report(payload)
