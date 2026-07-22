<div align="center">

# 🌸 HERA — AI Women's Health Intelligence Platform

**HERA** is a production-grade, full-stack AI-powered women's health platform built as a microservices monorepo.  
It provides PCOD/PCOS subtype analysis, mood-cycle hormone correlation tracking, AI-powered safe routing, an HERA AI companion chat powered by Groq/Llama 3.1, and a cinematic interactive landing experience — all in one unified platform.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=flat-square&logo=three.js)](https://threejs.org)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.1-orange?style=flat-square)](https://groq.com)

> *"Your body has a story. HERA helps you understand it."*

</div>

---

## ✨ What's New (v2)

- 🎨 **Cinematic Landing Page** — scroll-driven 3D particle universe (Three.js WebGL) that morphs through 6 shapes as you scroll. Mouse parallax included.
- 🤖 **HERA AI Companion** — In-dashboard AI chat powered by Groq (Llama 3.1-70b), pre-prompted as a women's health specialist.
- 🗺️ **Leaflet Maps** — Replaced Mapbox with OpenStreetMap/Leaflet (zero API cost, zero limits).
- ✨ **Auto-animating Journey & Testimonials** — Health journey timeline and testimonial carousel with automatic cycling.
- 🔒 **India DPDP Act Compliance** — Full right to erasure and data portability endpoints.

---

## 📐 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│       apps/web  (Next.js 14 + TypeScript + Three.js)                │
└───────────────────────────┬──────────────────────────────────────────┘
                            │  HTTPS / REST + JWT
┌───────────────────────────▼──────────────────────────────────────────┐
│                    LAYER 2 — API GATEWAY  (Port 8000)               │
│           services/api-gateway  (FastAPI + SQLAlchemy)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌─────────┐  │
│  │ JWT Auth │ │Rate Limit│ │ CSP/HSTS │ │Prometheus │ │  Sentry │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ └─────────┘  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (ORM only)  +  Redis (rate limits)                │  │
│  │  Fernet field-level encryption on lab values & health data    │  │
│  │  Audit log table — every health data access is recorded       │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────┬──────────────────┬──────────────────┬───────────────────────┘
         │                  │                  │
  ┌──────▼──────┐   ┌───────▼──────┐   ┌──────▼───────┐
  │ PCOD Service│   │ Mood Service │   │Safety Service│
  │  Port 8001  │   │  Port 8002   │   │  Port 8003   │
  │  (FastAPI)  │   │  (FastAPI)   │   │  (FastAPI)   │
  └──────┬──────┘   └───────┬──────┘   └──────┬───────┘
         │                  │                  │
  XGBoost ML           scipy/numpy      networkx graph
  classifier         correlation        Dijkstra + A*
  + synthetic        + Groq AI          safe routing
  dataset            Llama 3.1
```

---

## 🗂️ Monorepo Structure

```
HERA/
├── apps/
│   └── web/                              # Next.js 14 frontend (TypeScript)
│       ├── public/assets/               # AI-generated visual assets
│       └── src/
│           ├── app/
│           │   ├── page.tsx             # Landing: 3D scroll particles + storytelling
│           │   ├── page.backup.tsx      # Original landing (backup)
│           │   ├── about/page.tsx       # About HERA + creator
│           │   ├── login/ register/     # Auth pages
│           │   ├── api/chat/route.ts    # HERA AI companion (Groq/Llama 3.1)
│           │   └── dashboard/
│           │       ├── page.tsx         # Main dashboard
│           │       ├── pcod/page.tsx    # PCOD Analyzer
│           │       ├── mood/page.tsx    # Mood + Cycle Tracker
│           │       ├── safety/page.tsx  # Safety Routes + SOS (Leaflet maps)
│           │       └── architecture/   # System architecture visualizer
│           ├── components/
│           │   ├── animations/          # ParticleField, GlowingBadge, ScrollIndicator
│           │   ├── landing/             # ScrollParticles (Three.js WebGL)
│           │   ├── global/              # Navbar, Footer, ToastProvider
│           │   ├── pcod/                # PCOD UI + HERA AI Chat
│           │   ├── mood/                # MoodDial, CycleWheel, MoodChart
│           │   ├── safety/              # RouteMap (Leaflet), RouteSidebar, SOSPanel
│           │   └── ui/                  # GlassCard, GlowButton
│           ├── types/                   # pcod.types, mood.types, safety.types
│           ├── lib/
│           │   ├── api/                 # Typed API clients + transformers
│           │   └── mock-data/           # Dev offline fallback data
│           ├── hooks/                   # usePCOD, useMood, useSafety, useAuth
│           └── state/auth.store.ts      # Zustand auth store
│
├── services/
│   ├── api-gateway/                     # Central API Gateway (FastAPI)
│   ├── pcod-service/                    # XGBoost ML (Port 8001)
│   ├── mood-service/                    # scipy correlation + AI (Port 8002)
│   └── safety-service/                  # NetworkX routing (Port 8003)
│
├── docker-compose.yml
├── README.md                            ← You are here
├── STARTUP.md                           ← Local development guide
├── IMPLEMENTATION.md                    ← Deep technical notes
└── DEPLOY.md                            ← Free deployment guide (Vercel + Railway)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Framer Motion, Three.js WebGL, GSAP, Lenis, Recharts, Zustand |
| **3D / Visual** | Three.js, WebGL — scroll-driven particle morphing (6 shapes), mouse parallax |
| **AI Companion** | Groq API — Llama 3.1-70b-versatile, streaming, women's health system prompt |
| **Maps** | Leaflet + OpenStreetMap (free, no API key required) |
| **API Gateway** | FastAPI, SQLAlchemy async, PostgreSQL 16, Redis, JWT HS256, slowapi |
| **Security** | Fernet encryption, CSP/HSTS headers, bleach XSS sanitizer, Sentry, Prometheus |
| **PCOD Service** | FastAPI, XGBoost, scikit-learn, pandas |
| **Mood Service** | FastAPI, scipy, numpy, Groq/Llama AI insights |
| **Safety Service** | FastAPI, NetworkX (Dijkstra + A*) |
| **Database** | PostgreSQL 16, Redis 7, Alembic migrations |
| **Infrastructure** | Docker Compose, deployable on Vercel + Railway (free tier) |

---

## 🚀 Quick Start (Local)

> Full step-by-step guide with troubleshooting: [STARTUP.md](./STARTUP.md)

```powershell
# 1. Clone the repository
git clone https://github.com/Jeeban-2006/HERA.git
cd HERA

# 2. Start PostgreSQL + Redis
docker compose up -d postgres redis

# 3. Start API Gateway
cd services/api-gateway
poetry install
poetry run uvicorn app.main:app --reload --port 8000

# 4. Start frontend (new terminal)
cd apps/web
pnpm install && pnpm dev

# 5. Open browser → http://localhost:3000
```

---

## 🌐 Free Deployment

> Full step-by-step guide: [DEPLOY.md](./DEPLOY.md)

| Service | Platform | Free Tier |
|---|---|---|
| **Frontend** (Next.js) | Vercel | ✅ Free forever |
| **API Gateway** | Railway | ✅ $5 free credit/month |
| **PostgreSQL** | Railway | ✅ 1GB free |
| **Redis** | Railway | ✅ 25MB free |
| **ML Services** | Railway | ✅ On same plan |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user | 5/min per IP |
| `POST` | `/auth/login` | Login + JWT tokens | 10/min per IP |
| `POST` | `/pcod/analyze` | Run PCOD ML analysis | 5/min per user |
| `GET` | `/pcod/history` | Past analyses | — |
| `POST` | `/period/start` | Log new period start | — |
| `GET` | `/period/history` | Get cycle predictions & history | — |
| `POST` | `/mood/log` | Log today's mood | 20/min per user |
| `GET` | `/mood/correlation` | AI pattern analysis | — |
| `POST` | `/safety/route` | Safe route calculation | 5/min |
| `POST` | `/safety/sos` | SOS emergency alert | **UNLIMITED** |
| `GET` | `/users/me/data/export` | Full data export (DPDP) | — |
| `DELETE` | `/users/me/data` | Erase all health data (DPDP) | — |
| `GET` | `/metrics` | Prometheus scrape endpoint | Internal |
| `GET` | `/health` | Service health check | — |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (min 32 chars) |
| `FERNET_SECRET_KEY` | ✅ | Field-level encryption key (base64) |
| `NEXT_PUBLIC_API_URL` | ✅ | Frontend → Gateway URL |
| `GROQ_API_KEY` | ✅ | Powers HERA AI companion chat |
| `SENTRY_DSN` | Recommended | Error tracking from sentry.io |
| `ANTHROPIC_API_KEY` | Optional | Alternative AI for mood insights |
| `TWILIO_ACCOUNT_SID` | Optional | SMS on SOS trigger |

---

## 🔒 Security

| Control | Implementation |
|---|---|
| **Encryption at Rest** | Fernet on all lab values before DB write |
| **Encryption in Transit** | TLS 1.3 (configure at load balancer) |
| **Key Rotation** | Every 90 days — `MultiFernet` handles seamlessly |
| **XSS Prevention** | `bleach` sanitizes all user text inputs |
| **SQL Injection** | SQLAlchemy ORM exclusively — zero raw SQL |
| **Rate Limiting** | slowapi — per-user JWT keying |
| **Audit Logging** | Every health data access written to `audit_logs` |

---

## 🏛️ India DPDP Act Compliance

| Requirement | Implementation |
|---|---|
| **Explicit Consent** | Consent checkbox on `/register` |
| **Right to Erasure** | `DELETE /users/me/data` |
| **Data Portability** | `GET /users/me/data/export` |
| **Audit Trail** | `audit_logs` table — timestamp, user, IP, action |

---

## 📊 Build Status

| # | Layer | Status |
|---|---|---|
| 0 | Infrastructure (Docker, PostgreSQL, Redis) | ✅ Complete |
| 1 | Frontend (Next.js, 3D landing, components) | ✅ Complete |
| 2 | API Gateway (FastAPI, JWT, all routers) | ✅ Complete |
| 3 | PCOD ML Service (XGBoost) | ✅ Complete |
| 4 | Mood Service (correlation + AI) | ✅ Complete |
| 5 | Safety Service (NetworkX routing) | ✅ Complete |
| 6 | HERA AI Companion (Groq/Llama 3.1) | ✅ Complete |
| 7 | Production Security (encryption, DPDP) | ✅ Complete |
| 8 | Period Tracker (Prediction engine & UI) | ✅ Complete |

---

## 👨‍💻 Creator

Built by **Jeeban Krushna Sahu** — Full-Stack Engineer & AI enthusiast.  
HERA was built to bridge the gap in women's healthcare using modern AI and data engineering.

[![GitHub](https://img.shields.io/badge/GitHub-Jeeban--2006-181717?style=flat-square&logo=github)](https://github.com/Jeeban-2006)
