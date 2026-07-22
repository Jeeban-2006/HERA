"""Period tracker tables

Revision ID: 002
Revises: 001
Create Date: 2026-07-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy import text
import uuid

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── period_logs ─────────────────────────────────────────────────────────
    op.create_table('period_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('start_date', sa.Date, nullable=False),
        sa.Column('end_date', sa.Date, nullable=True),
        sa.Column('cycle_length', sa.Integer, nullable=True),
        sa.Column('period_length', sa.Integer, nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=text('NOW()')),
    )
    op.create_index('idx_period_user_start', 'period_logs',
                    ['user_id', sa.text('start_date DESC')])
    op.create_unique_constraint('uq_period_user_start',
                                'period_logs', ['user_id', 'start_date'])

    # ── period_symptoms ──────────────────────────────────────────────────────
    op.create_table('period_symptoms',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('period_log_id', UUID(as_uuid=True),
                  sa.ForeignKey('period_logs.id', ondelete='CASCADE'), nullable=True),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('flow_intensity', sa.String(20), nullable=True),
        sa.Column('symptoms', JSONB, server_default='[]'),
        sa.Column('pain_level', sa.Integer, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                  server_default=text('NOW()')),
    )
    op.create_unique_constraint('uq_symptom_user_date',
                                'period_symptoms', ['user_id', 'date'])


def downgrade() -> None:
    op.drop_table('period_symptoms')
    op.drop_table('period_logs')
