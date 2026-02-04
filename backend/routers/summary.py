"""
Summary Router - Endpoints for generating and retrieving report summaries
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.sanity_service import SanityService
from services.summary_service import SummaryService
from services.parser_service import parse_report_text


class SummaryRequest(BaseModel):
    report_id: str
    user_id: str
    force_regenerate: bool = False


class SummaryResponse(BaseModel):
    report_id: str
    summary: Optional[str]
    cached: bool
    generated_at: Optional[str]
    source: Optional[str] = None
    error: Optional[str] = None
    wait_time: Optional[int] = None


router = APIRouter(tags=["summary"])
sanity_service = SanityService()
summary_service = SummaryService()


@router.post("/generate-summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    """
    Generate or retrieve cached summary for a medical report.
    
    - Checks Sanity DB for existing summary first
    - Uses in-memory cache for recent summaries
    - Applies rate limiting (10 calls/minute per user)
    - Caches generated summaries for 24 hours
    """
    try:
        # Validate inputs
        if not request.report_id or not request.report_id.strip():
            raise HTTPException(status_code=400, detail="Report ID is required")
        
        if not request.user_id or not request.user_id.strip():
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Get report from Sanity
        report = sanity_service.get_report(request.report_id, request.user_id)
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Check if summary exists in Sanity DB (unless force regenerate)
        if not request.force_regenerate:
            # Fetch full report with summary field
            import urllib.parse
            query = f'*[_type == "medicalReport" && reportId == "{request.report_id}" && userId == "{request.user_id}"][0]{{summary, summaryGeneratedAt}}'
            
            if sanity_service._can_use_sanity():
                try:
                    encoded_query = urllib.parse.quote(query)
                    url = f"{sanity_service._query_url()}?query={encoded_query}"
                    headers = {"Authorization": f"Bearer {sanity_service.token}"}
                    
                    import httpx
                    with httpx.Client(timeout=10.0) as client:
                        response = client.get(url, headers=headers)
                        response.raise_for_status()
                        result = response.json().get("result")
                        
                        if result and result.get("summary"):
                            print(f"✓ Found existing summary in Sanity DB")
                            return SummaryResponse(
                                report_id=request.report_id,
                                summary=result["summary"],
                                cached=True,
                                generated_at=result.get("summaryGeneratedAt"),
                                source="sanity_db"
                            )
                except Exception as e:
                    print(f"⚠️ Failed to check Sanity for summary: {e}")
        
        # Get extracted text
        extracted_text = report.get("extracted_text", "")
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Report has no extracted text to summarize"
            )
        
        # Parse report values
        parsed_values = [item.model_dump() for item in parse_report_text(extracted_text)]
        
        # Generate summary with caching and rate limiting
        result = await summary_service.generate_summary(
            report_id=request.report_id,
            user_id=request.user_id,
            extracted_text=extracted_text,
            parsed_values=parsed_values,
            force_regenerate=request.force_regenerate
        )
        
        # Check for errors
        if result.get("error"):
            if "Rate limit" in result.get("error", ""):
                return SummaryResponse(
                    report_id=request.report_id,
                    summary=None,
                    cached=False,
                    generated_at=None,
                    error=result["error"],
                    wait_time=result.get("wait_time")
                )
            else:
                raise HTTPException(status_code=500, detail=result["error"])
        
        # Save summary to Sanity if it was freshly generated
        summary_text = result.get("summary")
        if summary_text and not result.get("cached"):
            sanity_service.update_report_summary(
                request.report_id,
                request.user_id,
                summary_text
            )
        
        return SummaryResponse(
            report_id=request.report_id,
            summary=summary_text,
            cached=result.get("cached", False),
            generated_at=result.get("generated_at"),
            source=result.get("source")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )


@router.get("/report-summary/{report_id}")
async def get_report_summary(report_id: str, user_id: str):
    """
    Get existing summary for a report from Sanity DB.
    Returns None if no summary exists yet.
    """
    try:
        if not report_id or not user_id:
            raise HTTPException(status_code=400, detail="Report ID and User ID are required")
        
        # Query Sanity for summary
        import urllib.parse
        query = f'*[_type == "medicalReport" && reportId == "{report_id}" && userId == "{user_id}"][0]{{summary, summaryGeneratedAt}}'
        
        if not sanity_service._can_use_sanity():
            return {"summary": None, "message": "Sanity not configured"}
        
        encoded_query = urllib.parse.quote(query)
        url = f"{sanity_service._query_url()}?query={encoded_query}"
        headers = {"Authorization": f"Bearer {sanity_service.token}"}
        
        import httpx
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            result = response.json().get("result")
            
            if not result:
                raise HTTPException(status_code=404, detail="Report not found")
            
            return {
                "report_id": report_id,
                "summary": result.get("summary"),
                "generated_at": result.get("summaryGeneratedAt")
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")
