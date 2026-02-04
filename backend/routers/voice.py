from __future__ import annotations

import os
import tempfile
import assemblyai as aai
from fastapi import APIRouter, File, UploadFile, HTTPException

from models.schemas import VoiceChatRequest, ChatResponse
from routers.chat import chat_with_report

router = APIRouter(tags=["voice"])

# Configure AssemblyAI
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY", "")


@router.post("/voice-chat", response_model=ChatResponse)
async def voice_chat(payload: VoiceChatRequest):
    payload.voice_mode = True
    return await chat_with_report(payload)


@router.post("/transcribe-audio")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Transcribe audio file to text using AssemblyAI Python SDK
    """
    temp_file_path = None
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        # Configure transcription for optimal speed (skip language detection)
        config = aai.TranscriptionConfig(
            speech_model=aai.SpeechModel.best,  # Automatically selects best available model
            language_code="en",  # Skip auto-detection for faster processing
            punctuate=True,
            format_text=True,
        )
        
        # Transcribe audio
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(temp_file_path)
        
        # Check for errors
        if transcript.status == aai.TranscriptStatus.error:
            raise RuntimeError(f"Transcription failed: {transcript.error}")
        
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        return {
            "success": True,
            "transcription": transcript.text or ""
        }

    except Exception as e:
        print(f"Transcription error: {str(e)}")
        
        # Clean up temp file if it exists
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to transcribe audio: {str(e)}"
        )
