from typing import List, Optional
from pydantic import BaseModel, Field


class ParsedValue(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    classification: str


class UploadReportResponse(BaseModel):
    report_id: str
    user_id: str
    file_url: Optional[str] = None
    extracted_text: str
    parsed_values: List[ParsedValue]
    report_type: Optional[str] = None
    upload_date: str


class ParseReportRequest(BaseModel):
    report_id: str
    user_id: str


class ParseReportResponse(BaseModel):
    report_id: str
    user_id: str
    extracted_text: str
    parsed_values: List[ParsedValue]


class ChatRequest(BaseModel):
    report_id: str
    user_id: str
    message: str = Field(..., min_length=1)
    mode: Optional[str] = Field(default="normal", description="normal | explain_simple")
    voice_mode: Optional[bool] = False


class ChatResponse(BaseModel):
    report_id: str
    user_id: str
    response: str
    used_model: Optional[str] = None
    disclaimers: Optional[List[str]] = None


class VoiceChatRequest(ChatRequest):
    pass


class ErrorResponse(BaseModel):
    detail: str
