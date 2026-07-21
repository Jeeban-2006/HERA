from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers import analyze
from app.config import settings
from loguru import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🌙 HERA Mood Service starting...")
    logger.info(f"   LLM insights: {'enabled' if settings.ANTHROPIC_API_KEY else 'static fallback mode'}")
    yield
    logger.info("Shutting down Mood Service")

app = FastAPI(title="HERA Mood Service", version="1.0.0", lifespan=lifespan)
app.include_router(analyze.router, tags=["Mood"])

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "service": "mood-service",
        "llm_enabled": bool(settings.ANTHROPIC_API_KEY)
    }
