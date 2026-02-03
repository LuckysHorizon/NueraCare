NUERACARE – TEAM TODO (Hackathon Execution)

Goal: Build NueraCare (React Native + Expo) with a clean, team-friendly architecture and an easily deployable FastAPI backend.

1) Project Setup (Day 0)
- [ ] Create top-level folders: nueracare-app/, backend/
- [ ] Add .env templates for both frontend and backend
- [ ] Add root README with quickstart and architecture summary
- [ ] Define API base URL contract (dev/staging/prod)

2) Mobile (React Native + Expo) – UI & Accessibility
Owner: UI & Accessibility
- [ ] Set up Expo + Expo Router structure (app/, components/, services/, store/, theme/)
- [ ] Build Home Dashboard with accessibility-first layout
- [ ] Implement Report Upload flow (upload → analyzing → result)
- [ ] Build Report Chat screen (context-aware UI)
- [ ] Build Nearby Hospitals screen (map + list)
- [ ] Add Accessibility Settings (text size, contrast, voice mode)

3) Backend (FastAPI) – Core APIs
Owner: Backend APIs
- [ ] Create FastAPI app entry (backend/main.py)
- [ ] Add routers: report, chat, hospital, task, notification, voice
- [ ] Add models (Pydantic) for request/response validation
- [ ] Implement health check endpoint (/health)
- [ ] Add CORS config + env-driven settings

4) AI & Medical Logic
Owner: AI & ML
- [ ] Implement OCR pipeline (service/ocr.py)
- [ ] Implement rules engine (service/risk_engine.py)
- [ ] Implement LLM wrapper (service/llm.py)
- [ ] Add safe prompt templates (utils/prompts.py)
- [ ] Implement soft-tone filter (service/soft_tone.py)

5) Voice, Calls, Notifications
Owner: Voice & Integrations
- [ ] Implement Expo push logic (notifications/expo_push.py)
- [ ] Add scheduler for tasks & reminders (notifications/scheduler.py)
- [ ] Implement Twilio IVR flows (voice/ivr_flows.py)
- [ ] Create call scheduler (voice/call_scheduler.py)

6) Deployment (Backend – Clean & Easy)
Owner: Backend APIs
- [ ] Add requirements.txt with pinned versions
- [ ] Add Procfile or startup command (Render/Railway compatible)
- [ ] Add .env.example with required keys
- [ ] Ensure stateless design (no file storage on server)
- [ ] Verify one-command deploy (uvicorn main:app --host 0.0.0.0 --port $PORT)

7) QA & Demo Readiness
- [ ] Sample test data (report images + PDFs)
- [ ] Demo script: upload → analyze → chat → hospital search
- [ ] Accessibility checklist (large text, contrast, voice)

Team Ownership Rules (No Conflicts)
- UI & Accessibility: nueracare-app/app, nueracare-app/components, nueracare-app/theme
- AI & ML: backend/services, backend/utils/prompts.py
- Backend APIs: backend/routers, backend/models
- Voice & Notifications: backend/voice, backend/notifications
