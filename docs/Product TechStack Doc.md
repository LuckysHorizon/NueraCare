PRODUCT TECH STACK DOCUMENTATION
NueraCare – Intelligent Healthcare & Accessibility App
1️⃣ Document Purpose

This document describes the complete technical stack used to build NueraCare, a mobile healthcare application focused on:

Medical report understanding

AI-powered guidance

Voice-based accessibility

Real-time healthcare discovery

Elderly & inclusive healthcare access

The stack is designed to be:

✅ Hackathon-ready (24 hours)

✅ Fully compatible

✅ Scalable beyond MVP

✅ Healthcare-safe and ethical

2️⃣ System Architecture Overview
High-Level Architecture
Mobile App (React Native + Expo)
        ↓
Authentication Layer (Clerk)
        ↓
Core Backend API (FastAPI - Python)
        ↓
AI / ML / Rules Engine
        ↓
External Services (Maps, Voice, Notifications)
        ↓
Database (Sanity + Local Storage)

3️⃣ Frontend Technology Stack
3.1 Mobile Framework

React Native + Expo (Managed Workflow)

Why Chosen

Rapid development for hackathons

Single codebase for Android & iOS

Built-in support for:

Camera (report upload)

Microphone (voice input)

Speech output

Push notifications

OTA updates without rebuild

Responsibilities

UI rendering

User interactions

Voice input/output

File uploads

Displaying backend responses

3.2 Navigation

Expo Router

Why

File-based routing

Clean folder structure

Faster onboarding for team members

Used For

Screen navigation

Nested flows (Home → Report → Chat)

Deep linking support

3.3 UI & Styling

NativeWind (Tailwind for React Native)

Why

Fast UI iteration

Consistent design system

Easy accessibility scaling (text size, spacing)

React Native Reanimated

Smooth animations

Optional micro-interactions

Reduced motion support

4️⃣ Authentication Layer
Clerk Authentication
Why Chosen

Secure & production-grade

Phone OTP support (India-friendly)

Email & social login

Seamless Expo compatibility

Responsibilities

User identity management

Session handling

Token issuance

Backend never handles passwords directly (security best practice).

5️⃣ Backend Technology Stack (CORE LOGIC)
5.1 Backend Framework
🥇 FastAPI (Python)
Why FastAPI

Best ecosystem for ML & AI

Extremely fast development

Async support

Auto-generated API docs

Easy scalability

Core Responsibilities

Business logic

Medical report analysis

AI orchestration

Notification decision logic

Voice call triggering

Hospital ranking logic

5.2 Backend Structure (Logical)
backend/
├── main.py
├── routers/
│   ├── report.py
│   ├── chat.py
│   ├── hospital.py
│   ├── notification.py
│   ├── voice.py
├── services/
│   ├── ocr.py
│   ├── llm.py
│   ├── risk_engine.py
│   ├── soft_tone.py
├── utils/
│   ├── validators.py
│   ├── prompts.py

6️⃣ AI & Machine Learning Stack
6.1 OCR (Medical Report Text Extraction)

Google ML Kit OCR

High accuracy for medical reports

Handles scanned PDFs & images

Mobile-optimized

Alternative (Backend):

Tesseract OCR (Python)

6.2 LLM (Language Model)

Groq API (Mixtral / LLaMA models)

Why

Ultra-fast response time

Low latency demos

Simple REST API

Ideal for hackathons

Usage

Medical report explanation

Patient-friendly summaries

Chatbot responses

6.3 AI Safety Strategy (CRITICAL)

NueraCare uses a Hybrid AI Approach:

Rule-Based Medical Logic (Deterministic)
                +
LLM Explanation (Human-Friendly)

Why This Matters

Prevents hallucination

Avoids diagnosis

Ensures ethical responses

Improves judge confidence

7️⃣ Voice & Accessibility Stack
7.1 Speech-to-Text

Expo Speech API (frontend)

Optional: Whisper API (backend)

Used for:

Voice commands

Chatbot input

Accessibility mode

7.2 Text-to-Speech

Expo Speech

Reads reports aloud

Adjustable speed & pitch

Elderly-friendly

7.3 Automated Voice Calls

Twilio Voice API

Used For

Task completion confirmation

Medicine reminders

Elderly follow-ups

IVR Example

“Press 1 if completed, Press 2 if not”

8️⃣ Maps & Location Stack
8.1 Maps

Google Maps SDK

8.2 Places & Search

Google Places API

Used For

Nearby hospitals

Doctor specialization lookup

Emergency centers

Distance ranking

9️⃣ Notifications Stack
Push Notifications

Expo Push Notifications

Notification Logic

Decision logic → FastAPI

Delivery → Expo

Used for:

Health tasks

Exercise reminders

Report follow-ups

10️⃣ Database & Storage
10.1 Primary Database

Sanity (NoSQL CMS)

Stores

User profiles

Health history

Report metadata

Health tips & exercises

Why Sanity

Schema-based

Flexible NoSQL

Real-time updates

10.2 Local Storage

Expo SecureStore → Auth tokens

AsyncStorage → Cached health data

🔐 11️⃣ Security & Healthcare Compliance
Implemented Safeguards

HTTPS everywhere

No medical diagnosis

Soft-tone explanations

Explicit disclaimers

Consent before storing reports

No sensitive data in push previews

☁️ 12️⃣ Deployment Stack
Backend Hosting

Railway

Render

Fly.io

Why

One-click deployment

Free tier support

Fast iteration

13️⃣ Compatibility Matrix
Component	Compatible
Expo ↔ Clerk	✅
Expo ↔ FastAPI	✅
FastAPI ↔ Groq	✅
FastAPI ↔ Sanity	✅
Expo ↔ Twilio	✅
Maps ↔ Expo	✅
14️⃣ Out-of-Scope (Hackathon)

Live doctor consultations

Insurance integration

Wearables

Diagnosis or prescriptions

15️⃣ Final Technical Justification

NueraCare uses a modern, healthcare-safe, AI-driven tech stack that balances speed, scalability, accessibility, and ethics.
Each technology was chosen to maximize real-world impact within hackathon constraints, while remaining production-ready.