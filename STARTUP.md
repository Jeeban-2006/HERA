# 🚀 HERA Platform — Local Development & Startup Guide

This guide documents **every step** required to boot, test, and verify the full HERA platform stack locally.

> **Current State:** All 8 layers implemented. Gateway on `:8000`, ML microservices on `:8001–8003`, frontend on `:3000`.

---

## 🧰 Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Python** | 3.11+ | https://python.org |
| **Poetry** | Latest | `pip install poetry` |
| **Node.js** | 18+ | https://nodejs.org |
| **pnpm** | Latest | `npm install -g pnpm` |
| **Git** | Latest | https://git-scm.com |

---

## Step 1 — Clone & Install

```powershell
git clone https://github.com/Jeeban-2006/HERA.git
cd HERA
```

---

## Step 2 — Start PostgreSQL & Redis (Docker)

```powershell
docker compose up -d postgres redis
```

This starts:
- **PostgreSQL 16** on port `5433`
- **Redis 7** on port `6379`

Verify:
```powershell
docker compose ps
# Both should show: running
```

---

## Step 3 — Configure Environment Variables

### API Gateway — `services/api-gateway/.env`
```env
DATABASE_URL=postgresql+asyncpg://hera_user:dev_password_change_me@localhost:5433/hera_dev
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=hera-dev-secret-key-change-in-production-min-32-chars
FERNET_SECRET_KEY=FeNIOQw6SCIs8oVkohOgynkvCaSPheUWd9zhiVE4E9E=
SENTRY_DSN=   # Leave blank for local dev
```

### Frontend — `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key_here    # Get free at console.groq.com
```

> Get a free Groq API key at https://console.groq.com — powers the HERA AI companion.

---

## Step 4 — Start the API Gateway

```powershell
cd services/api-gateway
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO: 🚀 HERA API Gateway starting up...
INFO: ✅ Database tables verified (including audit_logs)
INFO: Application startup complete.
```

Verify: http://localhost:8000/health → `{"status": "healthy"}`

> ⚠️ Keep this terminal open — it logs all incoming API requests.

---

## Step 5 — Start the Frontend

```powershell
cd apps/web
pnpm install
pnpm dev
```

Open **http://localhost:3000** — you will see the cinematic 3D landing page with the scroll particle effect.

---

## Step 6 — Start ML Microservices (for AI features)

### Option A — All at once via Docker (recommended)
```powershell
docker compose up -d pcod-service mood-service safety-service
```

### Option B — Manually (for Python development)
```powershell
# Terminal A — PCOD
cd services/pcod-service
poetry run uvicorn app.main:app --reload --port 8001

# Terminal B — Mood
cd services/mood-service
poetry run uvicorn app.main:app --reload --port 8002

# Terminal C — Safety
cd services/safety-service
poetry run uvicorn app.main:app --reload --port 8003
```

---

## Step 7 — End-to-End Testing Checklist

### ✅ Landing Page
- Open http://localhost:3000
- Scroll slowly → particles should morph through 6 shapes (cloud → silhouette → rings → neural net → wave → orb)
- Move your mouse → camera parallax effect

### ✅ Auth Flow
1. Go to http://localhost:3000/register
2. Create account → redirects to `/dashboard`
3. Hard-refresh (`Ctrl+Shift+R`) → still logged in

### ✅ HERA AI Companion
1. Go to **Dashboard → PCOD Analyzer**
2. Run an analysis → results appear
3. Click **"Talk to HERA AI"** button
4. Ask a health question → AI responds using Groq/Llama 3.1

### ✅ PCOD Analyzer
1. Select 5+ symptoms, set stress > 7, sleep < 6
2. Click **Run Analysis** → risk score + driver breakdown appear

### ✅ Mood Tracker
1. Select mood state → **Log Today's Mood**
2. Success toast appears
3. Re-logging same day → shows "Already Logged" (409)

### ✅ Safety Routes (Leaflet Maps)
1. Enter origin + destination → **Find Safe Route**
2. Two route cards appear (Safest / Fastest) with safety scores
3. Map renders using OpenStreetMap (no API key needed)
4. SOS button → triggers alert (check gateway logs for `🚨 SOS ALERT`)

### ✅ Monitoring
- http://localhost:8000/metrics → Prometheus metrics
- http://localhost:8000/docs → Swagger UI

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---|---|
| `Connect call failed ('127.0.0.1', 5433)` | `docker compose up -d postgres redis` |
| Port `8000` already in use | `netstat -ano \| findstr 8000` then kill the PID |
| `Network Error` on frontend | Start the API gateway first |
| HERA AI not responding | Check `GROQ_API_KEY` in `apps/web/.env.local` |
| Map not rendering | Leaflet renders automatically — no key needed. Check browser console for JS errors |
| `ModuleNotFoundError` | `poetry install` in the relevant service directory |
| Blank Safety page | Hard refresh with `Ctrl+Shift+R` |

---

## 🔑 Generating a Fernet Encryption Key

```powershell
cd services/api-gateway
poetry run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Use this for `FERNET_SECRET_KEY`. Rotate every 90 days in production.

---

## 📊 Port Reference

| Service | Port | URL |
|---|---|---|
| **Next.js Frontend** | 3000 | http://localhost:3000 |
| **API Gateway** | 8000 | http://localhost:8000 |
| **PCOD ML Service** | 8001 | http://localhost:8001 |
| **Mood Service** | 8002 | http://localhost:8002 |
| **Safety Service** | 8003 | http://localhost:8003 |
| **PostgreSQL** | 5433 | `postgresql://hera_user@localhost:5433/hera_dev` |
| **Redis** | 6379 | `redis://localhost:6379` |
| **Swagger Docs** | 8000 | http://localhost:8000/docs |
| **Prometheus Metrics** | 8000 | http://localhost:8000/metrics |
