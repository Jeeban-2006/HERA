"""HERA Safety Service — FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from loguru import logger

from app.routers import routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🛡️ HERA Safety Service starting on port 8003…")
    logger.info("   Graph-based routing: Dijkstra (fastest) + A* (safest)")
    logger.info("   Deterministic risk heatmap: seeded from bbox hash")
    yield
    logger.info("Safety Service shutting down.")


app = FastAPI(title="HERA Safety Service", version="1.0.0", lifespan=lifespan)
app.include_router(routes.router, tags=["Safety"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "safety-service"}
