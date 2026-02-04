# NueraCare Backend API

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   Create a `.env` file with:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   SANITY_PROJECT_ID=your_project_id
   SANITY_DATASET=production
   SANITY_API_TOKEN=your_sanity_token
   GROQ_MODEL=llama-3.1-8b-instant
   ```

3. **Verify Configuration**:
   ```bash
   python check_config.py
   ```

4. **Start Server**:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API server is running.

**Response**:
```json
{
  "status": "ok"
}
```

---

### 2. Upload Medical Report
**POST** `/api/upload-report`

Upload and process a medical report (PDF, image, or text file).

**Request** (multipart/form-data):
- `user_id` (string, required): User identifier
- `report_type` (string, optional): Type of report (blood-test, xray, etc.)
- `file` (file, required): Medical report file (max 10MB)

**Response**:
```json
{
  "report_id": "uuid",
  "user_id": "user123",
  "file_url": "path/to/file",
  "extracted_text": "Report content...",
  "parsed_values": [
    {
      "test_name": "Hemoglobin",
      "value": "14.2",
      "unit": "g/dL",
      "reference_range": "12.0-16.0",
      "classification": "This looks within the usual range."
    }
  ],
  "report_type": "blood-test",
  "upload_date": "2024-02-04T10:30:00Z"
}
```

**Errors**:
- `400`: Invalid input (missing file, empty user_id)
- `413`: File too large (>10MB)
- `500`: Server error during processing

---

### 3. Chat with Report
**POST** `/api/chat-with-report`

Get AI-powered explanations about an uploaded medical report.

**Request**:
```json
{
  "report_id": "uuid",
  "user_id": "user123",
  "message": "What does my hemoglobin level mean?",
  "mode": "normal",
  "voice_mode": false
}
```

**Parameters**:
- `report_id` (string, required): Report identifier from upload
- `user_id` (string, required): User identifier
- `message` (string, required): Question about the report
- `mode` (string, optional): "normal" or "explain_simple" (default: "normal")
- `voice_mode` (boolean, optional): Enable voice-optimized responses (default: false)

**Response**:
```json
{
  "report_id": "uuid",
  "user_id": "user123",
  "response": "Your hemoglobin level of 14.2 g/dL is within the normal range of 12.0-16.0. This means your blood is carrying oxygen well. It's always good to discuss your results with your doctor who knows your complete health history.",
  "used_model": "llama-3.1-8b-instant",
  "disclaimers": [
    "This explanation is for understanding only. A doctor can give medical advice."
  ]
}
```

**Errors**:
- `400`: Invalid input (missing IDs, empty message, invalid mode)
- `404`: Report not found
- `500`: Failed to generate response

---

### 4. Voice Chat with Report
**POST** `/api/voice-chat`

Same as chat endpoint but optimized for voice output (shorter, clearer responses).

**Request**: Same as `/api/chat-with-report`

**Note**: Automatically sets `voice_mode=true` for optimized responses.

---

### 5. Parse Report
**POST** `/api/parse-report`

Extract structured data from an already uploaded report.

**Request**:
```json
{
  "report_id": "uuid",
  "user_id": "user123"
}
```

**Response**:
```json
{
  "report_id": "uuid",
  "user_id": "user123",
  "extracted_text": "Full report text...",
  "parsed_values": [
    {
      "test_name": "Glucose",
      "value": "95",
      "unit": "mg/dL",
      "reference_range": "70-100",
      "classification": "This looks within the usual range."
    }
  ]
}
```

---

## AI Safety Guidelines

The Groq AI integration follows strict medical safety rules:

1. ❌ **NEVER diagnose** medical conditions
2. ❌ **NEVER recommend** treatments or medications
3. ❌ **NEVER make** emergency medical decisions
4. ✅ **ALWAYS** use calm, reassuring language
5. ✅ **ALWAYS** encourage consulting healthcare providers
6. ✅ **ONLY** explain what the report shows

## Architecture

```
backend/
├── main.py                 # FastAPI app entry point
├── check_config.py         # Environment validation tool
├── requirements.txt        # Python dependencies
├── .env                    # Environment configuration (create this)
├── models/
│   └── schemas.py          # Pydantic models
├── routers/
│   ├── reports.py          # Upload & parse endpoints
│   ├── chat.py             # Chat endpoint
│   └── voice.py            # Voice chat endpoint
├── services/
│   ├── groq_service.py     # Groq AI integration
│   ├── sanity_service.py   # Sanity CMS integration
│   ├── ocr_service.py      # PDF/image text extraction
│   └── parser_service.py   # Report parsing logic
└── utils/
    ├── safety.py           # Medical safety prompts
    └── response_logger.py  # Response logging
```

## Development

- **Port**: 8000 (default)
- **Reload**: Enabled in development mode
- **CORS**: Enabled for all origins (configure for production)
- **Logs**: AI responses logged to `logs/ai_responses.jsonl`

## Error Handling

All endpoints return structured error responses:

```json
{
  "detail": "Descriptive error message"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `413`: Payload Too Large
- `500`: Internal Server Error
