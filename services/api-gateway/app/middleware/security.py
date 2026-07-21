"""Security headers, CSP, and input sanitization middleware."""

from fastapi import Request
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import bleach
import re
import logging

logger = logging.getLogger(__name__)

# Allowed HTML tags for any user-input text fields (essentially no tags)
ALLOWED_TAGS: list[str] = []
ALLOWED_ATTRS: dict = {}

# Content-Security-Policy — strict, denying inline scripts/styles
CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self'; "
    "frame-ancestors 'none'; "
    "form-action 'self';"
)


def sanitize_string(value: str) -> str:
    """Strip all HTML tags from a user-provided string to prevent XSS."""
    if not isinstance(value, str):
        return value
    cleaned = bleach.clean(value, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)
    return cleaned.strip()


def sanitize_dict(data: dict, fields: list[str]) -> dict:
    """Sanitize specific string fields in a dict."""
    result = dict(data)
    for field in fields:
        if field in result and isinstance(result[field], str):
            result[field] = sanitize_string(result[field])
    return result


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS protection (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        # Enforce HTTPS
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # Permissions policy
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        # Content Security Policy
        response.headers["Content-Security-Policy"] = CSP
        # Remove server fingerprint headers (MutableHeaders has no .pop())
        try:
            del response.headers["server"]
        except KeyError:
            pass
        try:
            del response.headers["x-powered-by"]
        except KeyError:
            pass

        return response
