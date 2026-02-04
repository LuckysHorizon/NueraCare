from __future__ import annotations

import io
from typing import List


def _decode_text(data: bytes) -> str:
    try:
        return data.decode("utf-8", errors="ignore")
    except Exception:
        return ""


def _extract_pdf_text(data: bytes) -> str:
    try:
        import pdfplumber
    except Exception:
        return ""

    try:
        texts: List[str] = []
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                if text:
                    texts.append(text)
        return "\n".join(texts).strip()
    except Exception:
        return ""


def _extract_image_text(data: bytes) -> str:
    try:
        from PIL import Image
        import pytesseract
    except Exception:
        return ""

    try:
        image = Image.open(io.BytesIO(data))
        return pytesseract.image_to_string(image)
    except Exception:
        return ""


def extract_text_from_file(filename: str, content_type: str, data: bytes) -> str:
    lowered = filename.lower()

    if content_type.startswith("text/") or lowered.endswith(".txt"):
        return _decode_text(data)

    if lowered.endswith(".pdf") or content_type == "application/pdf":
        text = _extract_pdf_text(data)
        if text:
            return text

    if content_type.startswith("image/") or lowered.endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff")):
        text = _extract_image_text(data)
        if text:
            return text

    return "Some parts of this report are hard to read."
