"""Prometheus metrics endpoint and instrumentation for HERA API Gateway.

Exposes /metrics in Prometheus text format.
Tracks:
  - HTTP request counts and latencies
  - ML inference latencies (PCOD, Mood, Safety)
  - SOS events triggered
  - Active users (approximated by auth tokens issued)
"""

import time
import logging
from fastapi import APIRouter, Request, Response
from prometheus_client import (
    Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST,
    CollectorRegistry, multiprocess
)
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# ── Metrics ──────────────────────────────────────────────────────────────────

http_requests_total = Counter(
    "hera_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

http_request_duration_seconds = Histogram(
    "hera_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

ml_inference_duration_seconds = Histogram(
    "hera_ml_inference_duration_seconds",
    "ML microservice inference duration",
    ["service"],  # "pcod", "mood", "safety"
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0]
)

sos_events_total = Counter(
    "hera_sos_events_total",
    "Total SOS events triggered"
)

pcod_analyses_total = Counter(
    "hera_pcod_analyses_total",
    "Total PCOD analyses run",
    ["subtype"]
)

mood_logs_total = Counter(
    "hera_mood_logs_total",
    "Total mood log entries created"
)

auth_tokens_issued_total = Counter(
    "hera_auth_tokens_issued_total",
    "Total JWT tokens issued (register + login)"
)

active_errors_total = Counter(
    "hera_errors_total",
    "Total unhandled errors",
    ["endpoint"]
)


# ── Middleware ────────────────────────────────────────────────────────────────

class PrometheusMiddleware(BaseHTTPMiddleware):
    """Record request count and latency for every HTTP request."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip metrics endpoint itself to avoid cardinality explosion
        if request.url.path == "/metrics":
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start

        # Normalize path (replace UUIDs with {id} to avoid cardinality explosion)
        import re
        endpoint = re.sub(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            "{id}",
            request.url.path
        )

        http_requests_total.labels(
            method=request.method,
            endpoint=endpoint,
            status_code=str(response.status_code)
        ).inc()

        http_request_duration_seconds.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)

        return response


# ── Router ────────────────────────────────────────────────────────────────────

metrics_router = APIRouter()


@metrics_router.get("/metrics", include_in_schema=False)
async def metrics():
    """Prometheus metrics scrape endpoint."""
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)
