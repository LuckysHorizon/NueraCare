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
        label: Optional[str] = None,
    ) -> Dict[str, str]:
        report_id = str(uuid.uuid4())
        upload_date = datetime.utcnow().isoformat() + "Z"
        print(f"🔍 store_report called: user_id={user_id}, can_use_sanity={self._can_use_sanity()}")

        record = {
            "report_id": report_id,
            "user_id": user_id,
            "file_url": file_url or "",
            "extracted_text": extracted_text,
            "upload_date": upload_date,
            "report_type": report_type or "",
            "label": label or "",
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
                "label": label,
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
                print(f"📝 Saving report to Sanity: report_id={report_id}, user_id={user_id}")
                with httpx.Client(timeout=10.0) as client:
                    response = client.post(self._mutation_url(), json=payload, headers=headers)
                    response.raise_for_status()
                print(f"✓ Report saved to Sanity successfully")
            except Exception as e:
                print(f"❌ Failed to save to Sanity: {type(e).__name__}: {str(e)}")

        self._store[report_id] = record
        return record

    def get_report(self, report_id: str, user_id: str) -> Optional[Dict[str, str]]:
        print(f"🔍 get_report called: report_id={report_id}, user_id={user_id}")
        
        record = self._store.get(report_id)
        if record and record.get("user_id") == user_id:
            print(f"✓ Found in memory store")
            return record

        if not self._can_use_sanity():
            print(f"⚠️ Sanity not configured, cannot query")
            return None

        # Use simpler query syntax - just query by reportId first
        query = f'*[_type == "medicalReport" && reportId == "{report_id}" && userId == "{user_id}"][0]'
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        print(f"📊 Querying Sanity: {query}")

        try:
            # Construct the full URL manually
            import urllib.parse
            encoded_query = urllib.parse.quote(query)
            url = f"{self._query_url()}?query={encoded_query}"
            
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json()
                print(f"✓ Query successful, response: {result}")
                data = result.get("result")
        except Exception as e:
            print(f"❌ Sanity query failed: {type(e).__name__}: {str(e)}")
            return None

        if not data:
            print(f"⚠️ No document found in Sanity")
            return None

        mapped = {
            "report_id": data.get("reportId", ""),
            "user_id": data.get("userId", ""),
            "file_url": data.get("fileUrl", ""),
            "extracted_text": data.get("extractedText", ""),
            "upload_date": data.get("uploadDate", ""),
            "report_type": data.get("reportType", ""),
            "label": data.get("label", ""),
        }
        self._store[report_id] = mapped
        print(f"✓ Mapped data from Sanity and cached")
        return mapped

    def get_user_reports(self, user_id: str) -> list:
        """Fetch all reports for a user from Sanity."""
        if not self._can_use_sanity():
            return []

        query = f'*[_type == "medicalReport" && userId == "{user_id}"] | order(uploadDate desc) {{_id, reportId, userId, label, reportType, uploadDate, extractedText, fileUrl, summary, summaryGeneratedAt}}'
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        print(f"📊 Querying user reports: userId={user_id}")

        try:
            import urllib.parse
            encoded_query = urllib.parse.quote(query)
            url = f"{self._query_url()}?query={encoded_query}"
            
            print(f"🔍 Encoded query: {encoded_query}")
            
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json()
                reports = result.get("result", [])
                print(f"✓ Found {len(reports)} reports for user")
                if reports:
                    print(f"📄 Sample report data: {reports[0]}")
                return reports
        except Exception as e:
            print(f"❌ Failed to fetch reports: {type(e).__name__}: {str(e)}")
            return []

    def save_chat(self, report_id: str, user_id: str, messages: list, summary: str = "") -> bool:
        """Save chat conversation to Sanity."""
        if not self._can_use_sanity():
            return False

        import urllib.parse
        # Convert messages to Sanity format
        sanity_messages = [
            {
                "role": msg.get("role", ""),
                "text": msg.get("text", ""),
                "timestamp": msg.get("timestamp", datetime.utcnow().isoformat() + "Z"),
            }
            for msg in messages
        ]

        doc = {
            "_type": "chatConversation",
            "reportId": report_id,
            "userId": user_id,
            "messages": sanity_messages,
            "summary": summary,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z",
        }

        payload = {"mutations": [{"create": doc}]}
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        try:
            print(f"💾 Saving chat to Sanity: report_id={report_id}")
            with httpx.Client(timeout=10.0) as client:
                response = client.post(self._mutation_url(), json=payload, headers=headers)
                response.raise_for_status()
            print(f"✓ Chat saved to Sanity successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to save chat: {type(e).__name__}: {str(e)}")
            return False

    def get_chat_history(self, report_id: str, user_id: str) -> Optional[Dict]:
        """Fetch chat history for a report."""
        if not self._can_use_sanity():
            return None

        query = f'*[_type == "chatConversation" && reportId == "{report_id}" && userId == "{user_id}"][0]'
        
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            import urllib.parse
            encoded_query = urllib.parse.quote(query)
            url = f"{self._query_url()}?query={encoded_query}"
            
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json().get("result")
                if result:
                    print(f"✓ Found chat history for report")
                return result
        except Exception as e:
            print(f"⚠️ Failed to fetch chat history: {type(e).__name__}")
            return None

    def update_report_summary(self, report_id: str, user_id: str, summary: str) -> bool:
        """Update the AI-generated summary for a report."""
        if not self._can_use_sanity():
            return False

        try:
            import urllib.parse
            # First, get the document _id
            query = f'*[_type == "medicalReport" && reportId == "{report_id}" && userId == "{user_id}"][0]{{_id}}'
            encoded_query = urllib.parse.quote(query)
            url = f"{self._query_url()}?query={encoded_query}"
            
            headers = {"Authorization": f"Bearer {self.token}"}
            
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, headers=headers)
                response.raise_for_status()
                result = response.json().get("result")
                
                if not result or not result.get("_id"):
                    print(f"⚠️ Report not found for summary update")
                    return False
                
                doc_id = result["_id"]
                
                # Update the document with summary
                patch = {
                    "mutations": [
                        {
                            "patch": {
                                "id": doc_id,
                                "set": {
                                    "summary": summary,
                                    "summaryGeneratedAt": datetime.utcnow().isoformat() + "Z"
                                }
                            }
                        }
                    ]
                }
                
                response = client.post(self._mutation_url(), json=patch, headers=headers)
                response.raise_for_status()
                print(f"✓ Summary updated in Sanity for report {report_id}")
                return True
                
        except Exception as e:
            print(f"❌ Failed to update summary: {type(e).__name__}: {str(e)}")
            return False
