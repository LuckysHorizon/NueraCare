from __future__ import annotations

import os
import uuid
from datetime import datetime
from typing import Dict, Optional

import httpx


class SanityService:
    def __init__(self) -> None:
        self.project_id = os.getenv("SANITY_PROJECT_ID")
        self.dataset = os.getenv("SANITY_DATASET")
        self.token = os.getenv("SANITY_API_TOKEN")
        self._store: Dict[str, Dict[str, str]] = {}

    def _can_use_sanity(self) -> bool:
        return bool(self.project_id and self.dataset and self.token)

    def _mutation_url(self) -> str:
        return f"https://{self.project_id}.api.sanity.io/v2023-10-18/data/mutate/{self.dataset}"

    def _query_url(self) -> str:
        return f"https://{self.project_id}.api.sanity.io/v2023-10-18/data/query/{self.dataset}"

    def store_report(
        self,
        user_id: str,
        file_url: Optional[str],
        extracted_text: str,
        report_type: Optional[str],
    ) -> Dict[str, str]:
        report_id = str(uuid.uuid4())
        upload_date = datetime.utcnow().isoformat() + "Z"

        record = {
            "report_id": report_id,
            "user_id": user_id,
            "file_url": file_url or "",
            "extracted_text": extracted_text,
            "upload_date": upload_date,
            "report_type": report_type or "",
        }

        if self._can_use_sanity():
            existing_id: Optional[str] = None
            try:
                query = (
                    "*[_type == 'medicalReport' && reportId == $reportId && userId == $userId][0]{_id}"
                )
                params = {"query": query, "$reportId": report_id, "$userId": user_id}
                headers = {"Authorization": f"Bearer {self.token}"}
                with httpx.Client(timeout=10.0) as client:
                    response = client.get(self._query_url(), params=params, headers=headers)
                    response.raise_for_status()
                    existing_id = response.json().get("result", {}).get("_id")
            except Exception:
                existing_id = None

            doc = {
                "_type": "medicalReport",
                "reportId": report_id,
                "userId": user_id,
                "fileUrl": file_url,
                "extractedText": extracted_text,
                "uploadDate": upload_date,
                "reportType": report_type,
            }
            if existing_id:
                doc["_id"] = existing_id
                payload = {"mutations": [{"createOrReplace": doc}]}
            else:
                payload = {"mutations": [{"create": doc}]}
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
            try:
                with httpx.Client(timeout=10.0) as client:
                    client.post(self._mutation_url(), json=payload, headers=headers)
            except Exception:
                pass

        self._store[report_id] = record
        return record

    def get_report(self, report_id: str, user_id: str) -> Optional[Dict[str, str]]:
        record = self._store.get(report_id)
        if record and record.get("user_id") == user_id:
            return record

        if not self._can_use_sanity():
            return None

        query = (
            "*[_type == 'medicalReport' && reportId == $reportId && userId == $userId][0]"
            "{reportId, userId, fileUrl, extractedText, uploadDate, reportType}"
        )
        params = {"query": query, "$reportId": report_id, "$userId": user_id}
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(self._query_url(), params=params, headers=headers)
                response.raise_for_status()
                data = response.json().get("result")
        except Exception:
            return None

        if not data:
            return None

        mapped = {
            "report_id": data.get("reportId", ""),
            "user_id": data.get("userId", ""),
            "file_url": data.get("fileUrl", ""),
            "extracted_text": data.get("extractedText", ""),
            "upload_date": data.get("uploadDate", ""),
            "report_type": data.get("reportType", ""),
        }
        self._store[report_id] = mapped
        return mapped
