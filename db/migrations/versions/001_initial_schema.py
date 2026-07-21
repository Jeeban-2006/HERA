"""Initial schema — all tables

Revision ID: 001
Revises: 
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table('users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('dob', sa.Date, nullable=True),
        sa.Column('avatar_url', sa.Text, nullable=True),
        sa.Column('google_id', sa.String(255), nullable=True, unique=True),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )

    # ── user_health_profile ────────────────────────────────────────────────
    op.create_table('user_health_profile',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True),
        sa.Column('cycle_length', sa.Integer, default=28),
        sa.Column('last_period_date', sa.Date, nullable=True),
        sa.Column('health_goals', JSONB, default=list),
        sa.Column('onboarding_complete', sa.Boolean, default=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )

    # ── pcod_analyses ──────────────────────────────────────────────────────
    op.create_table('pcod_analyses',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('symptoms', JSONB, nullable=False),
        sa.Column('lifestyle_data', JSONB, nullable=False),
        sa.Column('lab_values', JSONB, default=dict),
        sa.Column('subtype', sa.String(50), nullable=True),
        sa.Column('risk_score', sa.Float, nullable=True),
        sa.Column('confidence', sa.Float, nullable=True),
        sa.Column('recommendations', JSONB, default=list),
        sa.Column('driver_breakdown', JSONB, default=dict),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )
    op.create_index('idx_pcod_user_created', 'pcod_analyses', ['user_id', 'created_at'])

    # ── mood_logs ──────────────────────────────────────────────────────────
    op.create_table('mood_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('mood_score', sa.Integer, nullable=False),     # 1–10
        sa.Column('mood_state', sa.String(50), nullable=True),
        sa.Column('energy_level', sa.Integer, nullable=True),    # 1–10
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('cycle_day', sa.Integer, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.UniqueConstraint('user_id', 'date', name='uq_mood_user_date'),
    )
    op.create_index('idx_mood_user_date', 'mood_logs', ['user_id', sa.text('date DESC')])

    # ── safety_routes ──────────────────────────────────────────────────────
    op.create_table('safety_routes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('origin_name', sa.String(500), nullable=True),
        sa.Column('destination_name', sa.String(500), nullable=True),
        sa.Column('origin_lat', sa.Float, nullable=False),
        sa.Column('origin_lng', sa.Float, nullable=False),
        sa.Column('destination_lat', sa.Float, nullable=False),
        sa.Column('destination_lng', sa.Float, nullable=False),
        sa.Column('route_geojson', JSONB, nullable=True),
        sa.Column('safety_score', sa.Float, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )

    # ── emergency_contacts ─────────────────────────────────────────────────
    op.create_table('emergency_contacts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('notify_sms', sa.Boolean, default=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )

    # ── sos_events ─────────────────────────────────────────────────────────
    op.create_table('sos_events',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE')),
        sa.Column('location_lat', sa.Float, nullable=False),
        sa.Column('location_lng', sa.Float, nullable=False),
        sa.Column('triggered_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('acknowledged_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('contacts_notified', JSONB, default=list),
        sa.Column('resolved', sa.Boolean, default=False),
    )


def downgrade() -> None:
    op.drop_table('sos_events')
    op.drop_table('emergency_contacts')
    op.drop_table('safety_routes')
    op.drop_table('mood_logs')
    op.drop_table('pcod_analyses')
    op.drop_table('user_health_profile')
    op.drop_table('users')
