from contextlib import asynccontextmanager
from pathlib import Path
import json
from fastapi import FastAPI, Request
from app.ml.predictor import PCODPredictor
from app.routers import analyze
from loguru import logger

MODEL_DIR = Path(__file__).parent.parent / "ml_training" / "models"
CONFIG_PATH = Path(__file__).parent.parent / "config" / "recommendations_config.json"

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading PCOD model...")
    try:
        app.state.predictor = PCODPredictor(MODEL_DIR)
        logger.info("✅ Model loaded successfully")
    except FileNotFoundError:
        logger.warning("⚠️ Model files not found — run train_model.py first")
        app.state.predictor = None

    try:
        with open(CONFIG_PATH) as f:
            app.state.recommendations = json.load(f)
        logger.info("✅ Recommendations config loaded")
    except FileNotFoundError:
        logger.warning("⚠️ Recommendations config not found")
        app.state.recommendations = {}
        
    yield
    logger.info("Shutting down PCOD service")

app = FastAPI(title="HERA PCOD Service", version="1.0.0", lifespan=lifespan)
app.include_router(analyze.router, tags=["PCOD"])

@app.get("/health")
async def health(request: Request):
    model_ready = request.app.state.predictor is not None
    return {"status": "ok" if model_ready else "degraded",
            "service": "pcod-service",
            "model_loaded": model_ready}
