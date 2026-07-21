"""Rate limiting configuration using slowapi (wrapper around limits/AIOREDIS).

Limits (per HERA Layer 7 spec):
  /auth/register   : 5  req/min per IP
  /auth/login      : 10 req/min per IP
  /pcod/analyze    : 5  req/min per user (ML is expensive)
  /mood/log        : 20 req/min per user
  /safety/sos      : unlimited — NEVER rate-limit safety-critical SOS
  Everything else  : 60 req/min per IP (general API limit)
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request


def _get_user_or_ip(request: Request) -> str:
    """Key function: use user_id if authenticated, otherwise fall back to IP.
    This prevents a single malicious user from burning rate limits for an IP
    shared across a NAT (e.g., corporate network).
    """
    # JWT sub is injected by get_current_user dependency via request.state
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return str(user_id)
    return get_remote_address(request)


# Global limiter instance — imported and attached to app in main.py
limiter = Limiter(key_func=_get_user_or_ip, default_limits=["60/minute"])
