"""
Dev seed — populates DB with realistic test data.
Run: python db/seeds/dev_seed.py
"""
import asyncio, uuid, bcrypt
from datetime import date, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import random, os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://hera:hera_dev@localhost:5432/hera_db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed():
    async with AsyncSessionLocal() as db:
        # ── Test User ──────────────────────────────────────────────────────
        user_id = uuid.uuid4()
        hashed = bcrypt.hashpw(b"Test@1234", bcrypt.gensalt()).decode()

        await db.execute("""
            INSERT INTO users (id, email, password_hash, name, dob)
            VALUES (:id, :email, :pw, :name, :dob)
            ON CONFLICT (email) DO NOTHING
        """, {"id": str(user_id), "email": "demo@hera.ai",
              "pw": hashed, "name": "Priya Demo", "dob": date(1996, 4, 15)})

        await db.execute("""
            INSERT INTO user_health_profile (id, user_id, cycle_length, last_period_date, onboarding_complete)
            VALUES (:id, :uid, 28, :lpd, true)
            ON CONFLICT (user_id) DO NOTHING
        """, {"id": str(uuid.uuid4()), "uid": str(user_id),
              "lpd": date.today() - timedelta(days=14)})

        # ── 45 days of mood logs ───────────────────────────────────────────
        mood_states = ["Calm", "Anxious", "Energized", "Tired", "Irritable", "Radiant", "Focused", "Sad"]
        for i in range(45):
            log_date = date.today() - timedelta(days=44 - i)
            cycle_day = ((i + 14) % 28) + 1
            # Simulate luteal dip (days 20-28)
            base = 7 if cycle_day < 20 else 4
            score = max(1, min(10, base + random.randint(-2, 2)))
            await db.execute("""
                INSERT INTO mood_logs (id, user_id, date, mood_score, mood_state, energy_level, cycle_day)
                VALUES (:id, :uid, :date, :score, :state, :energy, :cd)
                ON CONFLICT (user_id, date) DO NOTHING
            """, {"id": str(uuid.uuid4()), "uid": str(user_id),
                  "date": log_date, "score": score,
                  "state": random.choice(mood_states),
                  "energy": max(1, min(10, score + random.randint(-1, 1))),
                  "cd": cycle_day})

        # ── Emergency contacts ────────────────────────────────────────────
        for contact in [
            {"name": "Aarav Sharma", "phone": "+919876543210", "email": "aarav@example.com"},
            {"name": "Meera Patel", "phone": "+919812345678", "email": "meera@example.com"},
        ]:
            await db.execute("""
                INSERT INTO emergency_contacts (id, user_id, name, phone, email, notify_sms)
                VALUES (:id, :uid, :name, :phone, :email, true)
            """, {"id": str(uuid.uuid4()), "uid": str(user_id), **contact})

        await db.commit()
        print("✅ Seed complete — demo@hera.ai / Test@1234")

asyncio.run(seed())
