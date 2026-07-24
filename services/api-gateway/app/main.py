"""FastAPI application factory with database initialization."""

import logging
import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, pcod, mood, safety, period
from app.routers.compliance import router as compliance_router
from app.middleware.rate_limit import limiter
from app.middleware.security import SecurityHeadersMiddleware
from app.monitoring import PrometheusMiddleware, metrics_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hera.gateway")

# ── Sentry Initialization (error tracking) ───────────────────────────────────
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.2,          # 20% of transactions traced
        profiles_sample_rate=0.1,        # 10% CPU profiling
        send_default_pii=False,          # Never send PII to Sentry
    )
    logger.info("✅ Sentry error tracking initialized")
else:
    logger.warning("⚠️  SENTRY_DSN not set — error tracking disabled")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    logger.info("🚀 HERA API Gateway starting up...")
    logger.info(f"   Environment: {settings.ENVIRONMENT}")
    logger.info(f"   Database: {settings.DATABASE_URL.split('@')[-1]}")
    logger.info(f"   Encryption: {'ENABLED' if settings.FERNET_SECRET_KEY else 'DEV-EPHEMERAL'}")
    logger.info(f"   Sentry: {'ENABLED' if settings.SENTRY_DSN else 'DISABLED'}")

    # Create tables if they don't exist (dev only)
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables verified (including audit_logs)")

    yield

    await engine.dispose()
    logger.info("🛑 HERA API Gateway shutting down...")


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="HERA API Gateway",
        description="AI Women's Health Platform — API Gateway Service",
        version="1.0.0",
        lifespan=lifespan,
        # Disable docs in production — API surface is a security risk
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    )

    # ── Middleware (order matters — outermost applied last) ───────────────────

    # 1. Prometheus request instrumentation (innermost — captures all timing)
    app.add_middleware(PrometheusMiddleware)

    # 2. Security headers (CSP, HSTS, X-Frame-Options, etc.)
    app.add_middleware(SecurityHeadersMiddleware)

    # 3. CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Global exception handler ──────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
        if settings.SENTRY_DSN:
            sentry_sdk.capture_exception(exc)
        return JSONResponse(
            status_code=500,
            content={
                "error": "internal_server_error",
                "message": "Something went wrong. Our team has been notified.",
            },
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(auth.router,        prefix="/auth",    tags=["Auth"])
    app.include_router(users.router,       prefix="/users",   tags=["Users"])
    app.include_router(pcod.router,        prefix="/pcod",    tags=["PCOD"])
    app.include_router(mood.router,        prefix="/mood",    tags=["Mood"])
    app.include_router(period.router,      prefix="/period",  tags=["Period Tracker"])
    app.include_router(safety.router,      prefix="/safety",  tags=["Safety"])
    app.include_router(compliance_router,  prefix="/users",   tags=["DPDP Compliance"])
    app.include_router(metrics_router)     # /metrics — Prometheus scrape endpoint

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["System"])
    async def health():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "service": "api-gateway",
            "version": "1.0.0",
            "environment": settings.ENVIRONMENT,
            "encryption": "enabled" if settings.FERNET_SECRET_KEY else "ephemeral",
            "sentry": "enabled" if settings.SENTRY_DSN else "disabled",
        }

    return app


# Create app instance
app = create_app()
