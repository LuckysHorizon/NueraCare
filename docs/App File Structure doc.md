AROGYAPULSE – COMPLETE FILE STRUCTURE
🟢 1️⃣ FRONTEND (React Native + Expo)

Owner: Mobile UI & Accessibility Team Member
Rule: UI + UX only (NO business logic)

arogyapulse-app/
│
├── app/                         ← Expo Router
│   ├── _layout.tsx              ← Root layout
│   │
│   ├── (auth)/                  ← Authentication flow
│   │   ├── login.tsx
│   │   ├── otp.tsx
│   │
│   ├── (tabs)/                  ← Bottom tab navigation
│   │   ├── home.tsx             ← Dashboard
│   │   ├── reports.tsx          ← Reports list
│   │   ├── chat.tsx             ← AI Chatbot
│   │   ├── hospitals.tsx        ← Nearby hospitals
│   │   ├── profile.tsx
│   │
│   ├── report/                  ← Report flow
│   │   ├── upload.tsx           ← Upload PDF/Image
│   │   ├── analyzing.tsx        ← Loading state
│   │   ├── result.tsx           ← Analysis output
│   │
│   ├── accessibility/           ← Accessibility settings
│   │   ├── settings.tsx
│   │   ├── voice-mode.tsx
│   │
│   ├── tasks/
│   │   ├── today.tsx            ← Today’s tasks
│   │   ├── history.tsx
│
│   └── emergency/
│       └── profile.tsx          ← Emergency info

🔹 Supporting Frontend Folders
components/
│
├── cards/
│   ├── HealthSnapshotCard.tsx
│   ├── HealthTipCard.tsx
│   ├── TaskCard.tsx
│
├── report/
│   ├── ReportSummary.tsx
│   ├── RiskIndicator.tsx
│
├── chat/
│   ├── ChatBubble.tsx
│   ├── VoiceInputButton.tsx
│
├── accessibility/
│   ├── LargeTextWrapper.tsx
│   ├── HighContrastView.tsx
│
├── common/
│   ├── Button.tsx
│   ├── Loader.tsx
│   ├── ErrorState.tsx

🔹 Frontend Services (API Calls Only)
services/
│
├── api.ts                       ← Axios / fetch wrapper
├── auth.service.ts
├── report.service.ts
├── chat.service.ts
├── hospital.service.ts
├── task.service.ts
├── voice.service.ts
├── notification.service.ts

🔹 State Management
store/
│
├── userStore.ts
├── healthStore.ts
├── reportStore.ts
├── accessibilityStore.ts

🔹 Styling & Theme
theme/
│
├── colors.ts
├── fonts.ts
├── spacing.ts
├── typography.ts

🔹 Utilities
utils/
│
├── permissions.ts               ← Camera, mic, location
├── validators.ts
├── constants.ts

🟢 2️⃣ BACKEND (FastAPI – CORE LOGIC)

Owners:

AI & Medical Logic

Backend APIs

Voice & Notifications

Rule: ALL logic stays here.

backend/
│
├── main.py                      ← FastAPI entry point
├── requirements.txt
├── .env

🔹 API Routers (Clear Feature Ownership)
backend/routers/
│
├── auth.py                      ← Token validation
├── report.py                    ← Report upload & analysis
├── chat.py                      ← Report-based chatbot
├── hospital.py                  ← Nearby hospitals & doctors
├── task.py                      ← Health tasks
├── notification.py              ← Push logic
├── voice.py                     ← Voice call triggers

🔹 Core Services (BUSINESS LOGIC)
backend/services/
│
├── ocr.py                       ← OCR logic
├── llm.py                       ← Groq / LLM wrapper
├── risk_engine.py               ← Medical rules
├── soft_tone.py                 ← Gentle language filter
├── report_parser.py             ← Extract values
├── hospital_ranker.py           ← Sort & filter hospitals

🔹 Voice & IVR Logic
backend/voice/
│
├── twilio_client.py
├── ivr_flows.py
├── call_scheduler.py

🔹 Notifications Engine
backend/notifications/
│
├── expo_push.py
├── scheduler.py
├── templates.py

🔹 Database Models (Sanity / Pydantic)
backend/models/
│
├── user.py
├── report.py
├── task.py
├── notification.py

🔹 Utilities & Safety
backend/utils/
│
├── prompts.py                   ← Safe LLM prompts
├── validators.py                ← Input validation
├── constants.py
├── logger.py

🟢 3️⃣ OWNERSHIP MAP (VERY IMPORTANT)
Team Member	Folder Ownership
UI & Accessibility	/app, /components, /theme
AI & ML	/backend/services, /backend/utils/prompts.py
Backend APIs	/backend/routers, /backend/models
Voice & Notifications	/backend/voice, /backend/notifications

👉 NO overlapping ownership = NO conflicts

🟢 4️⃣ Golden Rules (PRINT THIS)

❌ No AI calls from frontend

❌ No medical logic in React Native

✅ FastAPI controls ALL decisions

✅ One feature = one folder

✅ Keep demos stable, not fancy

🏆 Why This File Structure Wins Hackathons

✔ Easy to explain

✔ Easy to debug

✔ Parallel development

✔ Clean architecture

✔ Looks production-ready

Judges will notice this maturity.