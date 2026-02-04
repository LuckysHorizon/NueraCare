from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from routers.reports import router as reports_router
from routers.chat import router as chat_router
from routers.voice import router as voice_router

app = FastAPI(title="NueraCare Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reports_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(voice_router, prefix="/api")


@app.get("/health")
def health_check():
    return {"status": "ok"}
