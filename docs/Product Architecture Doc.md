PRODUCT ARCHITECTURE DOCUMENT
ArogyaPulse – Hackathon Architecture (Team of 4)
1️⃣ Architecture Goals (Hackathon-First)

This architecture is designed to:

✅ Be easy to understand in 5 minutes (judges + teammates)

✅ Allow parallel development

✅ Avoid merge conflicts

✅ Support AI + voice + maps + notifications

✅ Be production-logical, not toy-level

2️⃣ High-Level Architecture Style
🧠 Frontend–Backend Separation (Brain–Body Model)
┌──────────────────────────┐
│ React Native (Expo App)  │  ← UI / Voice / UX
└─────────────▲────────────┘
              │ REST APIs
┌─────────────┴────────────┐
│ FastAPI Backend (Python) │  ← Logic / AI / Rules
└─────────────▲────────────┘
              │
┌─────────────┴────────────┐
│ External Services        │
│ (AI, Maps, Voice, DB)   │
└──────────────────────────┘

Mental Model (Remember This)

React Native = Body

FastAPI = Brain

External APIs = Senses

3️⃣ Component Responsibility Matrix (VERY IMPORTANT)
Layer	Responsibility	What NOT To Do
React Native	UI, navigation, voice, file upload	❌ No medical logic
FastAPI	All business + AI logic	❌ No UI
AI Layer	Explain, summarize	❌ No diagnosis
DB	Store metadata only	❌ No raw reports
External APIs	Maps, calls, notifications	❌ No core logic
4️⃣ Team-Based Architecture Split (TEAM OF 4)

This is non-negotiable if you want speed.

👨‍💻 TEAM MEMBER 1 – Mobile UI & Accessibility

Owns:

React Native UI

Home dashboard

Accessibility modes

Animations

Touches ONLY:

/app
/components
/theme


❌ Does NOT touch backend
❌ Does NOT touch AI logic

👨‍💻 TEAM MEMBER 2 – AI & Medical Logic

Owns:

Report analyzer

OCR

Medical rule engine

LLM prompts

Touches ONLY:

/backend/services
/backend/utils


❌ No frontend
❌ No maps / voice

👨‍💻 TEAM MEMBER 3 – Backend APIs & Data

Owns:

FastAPI routes

Sanity integration

Hospital search logic

Notification scheduling

Touches ONLY:

/backend/routers
/backend/models

👨‍💻 TEAM MEMBER 4 – Voice, Calls & Integrations

Owns:

Voice assistant logic

Twilio IVR

Push notifications

Scheduling logic

Touches ONLY:

/backend/voice
/backend/notifications

5️⃣ Frontend (React Native + Expo) File Structure
app/
├── (auth)/
│   ├── login.tsx
│   ├── otp.tsx
│
├── (tabs)/
│   ├── home.tsx
│   ├── reports.tsx
│   ├── chat.tsx
│   ├── hospitals.tsx
│   ├── profile.tsx
│
├── report/
│   ├── upload.tsx
│   ├── result.tsx
│
├── accessibility/
│   ├── settings.tsx
│
├── _layout.tsx

Supporting Folders
components/
├── cards/
├── buttons/
├── modals/
├── voice/
├── accessibility/

services/
├── api.ts          ← API calls
├── voice.ts
├── notifications.ts

store/
├── userStore.ts
├── healthStore.ts

theme/
├── colors.ts
├── fonts.ts
├── spacing.ts


🟢 Rule: UI only.
🟢 Rule: No logic beyond display.

6️⃣ Backend (FastAPI) File Structure
backend/
├── main.py
│
├── routers/
│   ├── report.py        ← upload, analyze
│   ├── chat.py          ← report chatbot
│   ├── hospital.py      ← nearby hospitals
│   ├── task.py          ← health tasks
│   ├── notification.py  ← push logic
│   ├── voice.py         ← call triggers
│
├── services/
│   ├── ocr.py
│   ├── llm.py
│   ├── risk_engine.py
│   ├── soft_tone.py
│
├── voice/
│   ├── twilio.py
│   ├── ivr_flows.py
│
├── notifications/
│   ├── scheduler.py
│   ├── expo_push.py
│
├── models/
│   ├── user.py
│   ├── report.py
│   ├── task.py
│
├── utils/
│   ├── prompts.py
│   ├── validators.py
│   ├── constants.py


🟢 Each folder = clear ownership
🟢 Easy debugging
🟢 Judge-friendly explanation

7️⃣ API Communication Pattern (Simple & Safe)
React Native
   ↓
/report/analyze
   ↓
OCR → Rules → LLM
   ↓
JSON Response
   ↓
UI + Voice Output


Same pattern for:

Chat

Hospitals

Notifications

Voice calls

8️⃣ Data Flow (CRITICAL FOR HEALTHCARE)
User Uploads Report
   ↓
OCR (text only)
   ↓
Rule-based checks
   ↓
LLM explanation
   ↓
Soft-tone filter
   ↓
Response to UI


❌ No diagnosis
❌ No panic language
❌ No raw report storage

9️⃣ Architecture Rules (PRINT THIS)

❌ No AI calls from frontend

❌ No business logic in UI

✅ Backend owns decisions

✅ Frontend renders only

✅ One feature = one owner

🔟 How You Explain This to Judges (1 Line)

“We use a clean frontend–backend architecture where the mobile app handles accessibility and UX, while a FastAPI backend safely manages medical logic, AI reasoning, and voice workflows.”

That’s professional.

🏁 Final Result

With this architecture:

✔ No confusion

✔ Parallel development

✔ Fast debugging

✔ Clean demo

✔ Strong technical story