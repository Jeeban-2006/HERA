"""Audit logging service — records all access to sensitive health data.

Every read/write to PCODAnalysis, MoodLog, or health profile data triggers
an audit log entry containing: who accessed, what resource, when, and from
which IP. This satisfies India DPDP Act traceability requirements.
"""

import uuid
import logging
from datetime import datetime
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base

logger = logging.getLogger(__name__)


class AuditLog(Base):
    """Immutable audit log for all sensitive data access."""
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    accessor_user_id: Mapped[str] = mapped_column(String(36), nullable=True, index=True)  # who made the request
    target_user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)   # whose data was accessed
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)                # "pcod_analysis", "mood_log", etc.
    resource_id: Mapped[str] = mapped_column(String(36), nullable=True)
    action: Mapped[str] = mapped_column(String(20), nullable=False)                       # "read", "write", "delete", "export"
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str] = mapped_column(String(500), nullable=True)
    extra: Mapped[dict] = mapped_column(JSON, default=dict)


async def write_audit_log(
    db: AsyncSession,
    *,
    accessor_user_id: str | None,
    target_user_id: str,
    resource_type: str,
    action: str,
    resource_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    extra: dict | None = None,
) -> None:
    """Write an audit log entry. Never raises — failures are logged but not propagated."""
    try:
        entry = AuditLog(
            id=uuid.uuid4(),
            accessor_user_id=str(accessor_user_id) if accessor_user_id else None,
            target_user_id=str(target_user_id),
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            extra=extra or {},
        )
        db.add(entry)
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to write audit log: {e}")
