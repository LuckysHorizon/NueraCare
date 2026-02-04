# 🚀 NueraCare Quick Start Guide

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Groq API key ([get one here](https://console.groq.com))
- Sanity project ([create one here](https://www.sanity.io))

---

## 🔧 Backend Setup (FastAPI)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Create Environment File
Create `.env` file:
```env
GROQ_API_KEY=gsk_your_groq_key_here
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token
GROQ_MODEL=llama-3.1-8b-instant
```

### 4. Verify Configuration
```bash
python check_config.py
```

### 5. Start Backend Server
```bash
uvicorn main:app --reload
```

✅ Backend running at: `http://127.0.0.1:8000`  
📚 API docs at: `http://127.0.0.1:8000/docs`

---

## 📱 Frontend Setup (React Native + Expo)

### 1. Navigate to App Directory
```bash
cd nueracare-expo-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `.env.local`:
```env
EXPO_PUBLIC_SANITY_PROJECT_ID=your_project_id
EXPO_PUBLIC_SANITY_DATASET=production
EXPO_PUBLIC_SANITY_TOKEN=your_token
EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

### 4. Generate Sanity Types
```bash
cd sanity
npm run sanity:typegen
cd ..
```

### 5. Start Expo Development Server
```bash
npx expo start
```

### 6. Run on Device/Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app (on physical device)

---

## 🧪 Testing the Integration

### Test Backend Health
```bash
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "ok"}
```

### Test Chat Endpoint (Example)
```bash
curl -X POST http://127.0.0.1:8000/api/chat-with-report \
  -H "Content-Type: application/json" \
  -d '{
    "report_id": "test-report-123",
    "user_id": "test-user-456",
    "message": "What does this report mean?",
    "mode": "normal",
    "voice_mode": false
  }'
```

---

## 📂 Project Structure

```
NueraCare/
├── backend/                    # FastAPI backend
│   ├── main.py                # Entry point
│   ├── check_config.py        # Configuration validator
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment config (create this)
│   ├── routers/               # API endpoints
│   ├── services/              # Business logic
│   ├── models/                # Pydantic schemas
│   └── utils/                 # Helper functions
│
├── nueracare-expo-app/        # React Native frontend
│   ├── app/                   # App screens
│   │   ├── (tabs)/           # Tab navigation
│   │   │   └── chat.tsx      # Chat interface
│   │   └── (auth)/           # Authentication
│   ├── services/              # API clients
│   │   ├── backend.ts        # Backend API client
│   │   └── sanity.ts         # Sanity CMS client
│   ├── sanity/                # Sanity schemas
│   └── .env.local            # Environment config (create this)
│
└── docs/                      # Documentation
    ├── BACKEND_AUDIT_REPORT.md
    └── [other docs]
```

---

## 🎯 Key Features to Test

### 1. Upload Medical Report
- Navigate to Reports tab
- Upload a PDF or image file
- Verify text extraction
- Check parsed values

### 2. Chat with AI
- Navigate to Chat tab
- Enter user ID and report ID
- Try these prompts:
  - "Explain this report simply"
  - "What does the out-of-range value mean?"
  - "Is this common?"

### 3. Voice Mode
- Toggle "Voice mode" on
- Send a question
- Observe shorter, clearer responses

### 4. Explain Simpler Mode
- Toggle "Explain simpler" on
- Send a question with medical terms
- Observe jargon-free explanations

---

## 🐛 Troubleshooting

### Backend Issues

**Import errors (httpx, fastapi, etc.)**
```bash
pip install -r requirements.txt
```

**GROQ_API_KEY not set**
```bash
# Create .env file in backend directory
# Add: GROQ_API_KEY=gsk_your_key_here
```

**Port 8000 already in use**
```bash
uvicorn main:app --reload --port 8001
# Update EXPO_PUBLIC_BACKEND_URL in frontend .env.local
```

### Frontend Issues

**Module not found errors**
```bash
npm install
# or
npm install --legacy-peer-deps
```

**Sanity type errors**
```bash
cd sanity
npm run sanity:typegen
cd ..
```

**Cannot connect to backend**
- Ensure backend is running: `http://127.0.0.1:8000/health`
- Check `EXPO_PUBLIC_BACKEND_URL` in `.env.local`
- For physical device, use your computer's IP address (not localhost)

---

## 📱 Running on Physical Device

### Find Your Computer's IP Address

**Windows**:
```bash
ipconfig
# Look for IPv4 Address under your active network
```

**Mac/Linux**:
```bash
ifconfig | grep "inet "
```

### Update Frontend Config
In `.env.local`:
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XX:8000
```
(Replace `192.168.1.XX` with your actual IP)

---

## 📊 Monitoring & Logs

### Backend Logs
- Console output shows all requests
- AI responses logged to `backend/logs/ai_responses.jsonl`

### Frontend Logs
- Metro bundler console shows errors
- App console (in Expo Go or emulator)

---

## 🎉 You're All Set!

- Backend API: `http://127.0.0.1:8000`
- API Docs: `http://127.0.0.1:8000/docs`
- Frontend: Expo development server

For detailed API documentation, see `backend/README.md`  
For audit report, see `docs/BACKEND_AUDIT_REPORT.md`

---

## 📞 Support

- Check logs in `backend/logs/`
- Review error messages in console
- Consult `BACKEND_AUDIT_REPORT.md` for architecture details

**Happy Coding! 🚀**
