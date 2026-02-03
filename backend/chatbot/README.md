# Report-Based Chatbot Module (NueraCare)

Owner: Report Chatbot teammate

Purpose: Isolated FastAPI module for the report-context chatbot (upload context -> safe answers).

Suggested file layout:
- router.py: FastAPI router for /chat endpoints
- service.py: Core chatbot logic
- schemas.py: Pydantic request/response models
- prompts.py: Safe prompt templates
- dependencies.py: Auth/session/report context wiring
- tests/: unit tests for logic
