PRODUCT REQUIREMENTS DOCUMENT (PRD)
App Name
NueraCare

“A gentle, intelligent healthcare companion that understands, explains, and follows up.”

1️⃣ Product Overview
Product Type

Mobile Healthcare & Accessibility Application
(Built using React Native + Expo)

Target Platform

Android (primary – India focused)

iOS (secondary)

Target Users

General patients

Elderly users

Visually impaired users

Chronic disease patients

Caregivers & family members

2️⃣ Overall App Motive (VERY IMPORTANT)
🎯 Core Motive

To bridge the gap between medical data and patient understanding using AI, voice, and accessibility-first design.

❌ Problem Today

Patients don’t understand medical reports

Hospitals are hard to discover in emergencies

Health tasks are forgotten

Elderly users struggle with apps

Healthcare apps focus on data, not people

✅ NueraCare Solves This By:

Explaining reports softly & clearly

Following up using voice & calls

Guiding users to nearby healthcare

Supporting accessibility by default

3️⃣ Key Value Proposition

“NueraCare doesn’t just show health data —
it understands, explains, and checks back on the patient.”

4️⃣ Core Features (Detailed)
🏠 4.1 Home Dashboard
Description

Personalized health dashboard showing what matters today.

Features

Health snapshot (manual inputs)

Today’s health tip (AI-generated)

Assigned health task/exercise

Pending task alerts

Quick hospital access button

Enhancements

Adaptive card order (elderly → tasks first)

One-tap voice reading of dashboard

🧠 4.2 Medical Report Analyzer (CORE FEATURE)
Description

Users upload any medical report and receive a safe, simplified explanation.

Supported Inputs

PDF reports

Image reports (camera / gallery)

Processing Flow

OCR extracts report text

ML + rules detect key values

LLM generates explanation

Risk level classified

Voice + chat enabled

Output Sections

Simple Explanation

Important Observations

What This Means for You

Suggested Next Steps (Non-diagnostic)

Critical Handling (Unique)

Soft-tone language

No panic words

No diagnosis claims

Doctor recommendation phrased gently

💬 4.3 Report-Based AI Chatbot
Description

Users can chat with AI only about their uploaded report.

Capabilities

Context-aware responses

Follow-up questions supported

“Explain simpler” mode

Voice input + output

Safety Rules

No medical diagnosis

No emergency decisions

Always suggests consulting a doctor

🎙️ 4.4 Voice Assistant & Voice Mode
Description

Full voice support for accessibility and elderly users.

Features

Read report summary aloud

Voice commands:

“Explain my report”

“Find nearby hospital”

“Repeat slowly”

Enhancements

Adjustable speech speed

High clarity voice tone

📞 4.5 Automated Voice Call Bot (Unique Feature)
Description

Automated phone calls to check task completion.

Example Flow

“Hello, this is NueraCare.
Did you complete today’s exercise?
Press 1 for Yes, Press 2 for No.”

Purpose

Elderly task adherence

Medicine reminders

Exercise follow-ups

Backend Actions

Logs response

Reschedules if incomplete

Notifies caregiver (optional)

🗺️ 4.6 Nearby Hospitals & Doctors Search
Description

Location-based healthcare discovery with real-time data.

Features

Nearby hospitals

Best doctors by specialization

Emergency filtering

Distance-based ranking

Enhancements

“Best for your condition” suggestion

Google Maps navigation

🔔 4.7 Smart Notifications System
Description

Non-spammy, context-aware reminders.

Examples

“You usually exercise now”

“Yesterday’s task was skipped”

“Time to review your report”

Enhancements

AI-adjusted timing

Snooze intelligence

♿ 4.8 Accessibility & Inclusive Design (CORE PILLAR)
Accessibility Features

Large text mode

High contrast UI

Reduced animation mode

Full voice navigation

Haptic feedback

Cognitive Load Reduction

One task per screen

Minimal text

Icons + voice guidance

👨‍👩‍👧 4.9 Caregiver Mode (Optional Enhancement)
Features

View patient tasks

Receive alerts on missed tasks

Emergency contact access

5️⃣ Micro-Enhancements (Judge-Winning Details)

Health score meter (non-medical)

Report timeline history

Before vs after comparison

Emergency profile

Offline report access

Explain-again button

Multi-language support (India-first)

6️⃣ Technical Requirements (High Level)
Frontend

React Native + Expo

Advanced UI animations

Voice & accessibility APIs

Backend

FastAPI (Python)

ML + rules engine

LLM orchestration

Notification & call scheduler

AI Stack

OCR for reports

Rule-based medical checks

LLM for explanation

Voice processing

7️⃣ Non-Functional Requirements
Performance

Report analysis < 5 seconds

Chat response < 2 seconds

Security

HTTPS only

No diagnosis

No permanent report storage without consent

Scalability

Stateless backend

API-based architecture

8️⃣ Out of Scope (For Hackathon)

Live doctor consultation

Insurance integration

Wearable device syncing

Medical diagnosis

9️⃣ Success Metrics (Hackathon View)

Report explanation clarity

Voice feature usability

Accessibility effectiveness

Demo stability

Judge understanding in <2 minutes

🔚 Final Product Vision

NueraCare is not just a healthcare app.
It is a patient companion that:

Understands medical data

Explains it gently

Follows up responsibly

Supports everyone, especially the underserved