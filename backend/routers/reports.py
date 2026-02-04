from __future__ import annotations

import os
import uuid
from datetime import datetime

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import ParseReportRequest, ParseReportResponse, UploadReportResponse
from services.ocr_service import extract_text_from_file
from services.parser_service import parse_report_text
from services.sanity_service import SanityService

router = APIRouter(tags=["reports"])
service = SanityService()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


@router.post("/upload-report", response_model=UploadReportResponse)
async def upload_report(
    user_id: str = Form(...),
    report_type: str = Form(None),
    label: str = Form(None),
    file: UploadFile = File(...),
):
    """Upload and process a medical report (PDF, image, or text file)."""
    
    # Validate user_id
    if not user_id or not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="User ID is required and cannot be empty."
        )
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is missing."
        )
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_size = 0
    
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        data = await file.read()
        file_size = len(data)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is 10MB. Your file is {file_size / 1024 / 1024:.2f}MB."
            )
        
        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="File is empty. Please upload a valid medical report."
            )
        
        with open(file_path, "wb") as f:
            f.write(data)

        extracted_text = extract_text_from_file(file.filename, file.content_type or "", data)
        
        if not extracted_text or extracted_text.strip() == "Some parts of this report are hard to read.":
            # Still save but warn user
            parsed_values = []
        else:
            parsed_values = parse_report_text(extracted_text)

        record = service.store_report(
            user_id=user_id.strip(),
            file_url=file_path,
            extracted_text=extracted_text,
            report_type=report_type,
            label=label.strip() if label else None,
        )

        return UploadReportResponse(
            report_id=record["report_id"],
            user_id=user_id.strip(),
            file_url=record["file_url"],
            extracted_text=extracted_text,
            parsed_values=parsed_values,
            report_type=record["report_type"],
            upload_date=record["upload_date"],
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process uploaded file: {str(e)}"
        )


@router.post("/parse-report", response_model=ParseReportResponse)
async def parse_report(payload: ParseReportRequest):
    """Parse and extract structured data from an already uploaded medical report."""
    
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
    
    try:
        record = service.get_report(payload.report_id, payload.user_id)
        if not record:
            raise HTTPException(
                status_code=404,
                detail=f"Report not found. Please check report ID and user ID are correct."
            )

        parsed_values = parse_report_text(record["extracted_text"])

        return ParseReportResponse(
            report_id=payload.report_id,
            user_id=payload.user_id,
            extracted_text=record["extracted_text"],
            parsed_values=parsed_values,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse report: {str(e)}"
        )


@router.get("/user-reports/{user_id}")
async def get_user_reports(user_id: str):
    """Fetch all reports for a user."""
    if not user_id or not user_id.strip():
        raise HTTPException(status_code=400, detail="User ID is required.")
    
    try:
        reports = service.get_user_reports(user_id.strip())
        return {
            "user_id": user_id,
            "reports": reports,
            "total": len(reports),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch reports: {str(e)}"
        )

