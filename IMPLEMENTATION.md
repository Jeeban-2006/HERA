# HERA — Implementation Guide

> Complete technical reference for every layer of the HERA platform. Updated through **Layer 7 (Production Security)**.

---

## Table of Contents

1. [Layer 0 — Infrastructure](#layer-0--infrastructure)
2. [Layer 1 — Frontend Foundation](#layer-1--frontend-foundation)
3. [Layer 1b — Frontend ↔ Backend Integration](#layer-1b--frontend--backend-integration)
4. [Layer 2 — API Gateway](#layer-2--api-gateway)
5. [Layer 3 — PCOD ML Service](#layer-3--pcod-ml-service)
6. [Layer 4 — Mood Service](#layer-4--mood-service)
7. [Layer 5 — Safety Service](#layer-5--safety-service)
8. [Layer 7 — Production Security](#layer-7--production-security)
9. [Data Flow Reference](#data-flow-reference)
10. [API Contract Reference](#api-contract-reference)

---

## Layer 0 — Infrastructure

### Docker Compose Services

| Service | Image | Port | Data Volume |
|---|---|---|---|
| `postgres` | postgres:16 | 5433 → 5432 | `postgres_data:/var/lib/postgresql/data` |
| `redis` | redis:7-alpine | 6379 | None (ephemeral) |
| `api-gateway` | Custom (Python 3.11) | 8000 | — |
| `pcod-service` | Custom (Python 3.11) | 8001 | — |
| `mood-service` | Custom (Python 3.11) | 8002 | — |
| `safety-service` | Custom (Python 3.11) | 8003 | — |

> **Note:** PostgreSQL runs on host port **5433** (not 5432) to avoid conflicts with any locally installed Windows PostgreSQL instances.

### Database Schema

All tables created via `Base.metadata.create_all` on gateway startup (dev) or Alembic migrations (production).

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Auth accounts | id, email, password_hash, name, dob |
| `user_health_profile` | Cycle & health data | user_id, cycle_length, last_period_date |
| `pcod_analyses` | PCOD results | user_id, subtype, risk_score, lab_values (encrypted) |
| `mood_logs` | Daily mood entries | user_id, date, mood_score, mood_state, cycle_day |
| `emergency_contacts` | SOS contacts | user_id, name, phone, notify_sms |
| `sos_events` | SOS history | user_id, location_lat/lng, triggered_at, contacts_notified |
| `audit_logs` | Health data access log | accessor_user_id, target_user_id, resource_type, action, ip_address |

---

## Layer 1 — Frontend Foundation

### Technology Choices

- **Next.js 14 App Router** — Server components for SEO, client components for interactivity
- **Framer Motion** — All scroll animations, transitions, and micro-interactions
- **Recharts** — Mood trend charts and PCOD driver breakdown radar
- **Mapbox GL / react-map-gl** — Interactive safety route map
- **Zustand + persist middleware** — Global auth state with localStorage hydration
- **React Query (@tanstack/query)** — All server state, caching, and background refetching

### Design System

The entire UI uses a custom dark-mode design system defined in `globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--bio-teal` | `#00FFD1` | Primary brand color, CTAs |
| `--bio-coral` | `#FF5F7E` | Alerts, PCOD highlights |
| `--bio-gold` | `#FFD166` | Mood tracker accents |
| `--bio-violet` | `#9B5DE5` | Safety route accents |
| `--void` | `#050810` | Background |
| `--surface` | `#0D1117` | Card backgrounds |

### Landing Page Architecture

The redesigned landing page (`app/page.tsx`) is built as a **scroll-driven storytelling experience**:

1. **Hero Section** — Animated gradient orbs (CSS radial-gradient, no blur — GPU-safe), headline text
2. **Problem Section** — Split-screen: "Healthcare wasn't built for her" + Data Void visualization
3. **Pillars Section** — Alternating full-width sections for PCOD, Mood, Safety with AI-generated assets
4. **CTA Section** — Full-screen gradient with glowing "Get Started Free" button

---

## Layer 1b — Frontend ↔ Backend Integration

### API Layer Structure

```
src/lib/api/
├── auth.api.ts          # register, login, refresh, getHealthProfile
├── pcod.api.ts          # analyze, getHistory
├── mood.api.ts          # logMood, getLogs, getCorrelation
├── safety.api.ts        # findRoute, triggerSOS, getContacts
└── transformers.ts      # snake_case → camelCase adapters (CRITICAL)
```

### The Transformer Pattern

The API Gateway (FastAPI) serializes Pydantic models as **snake_case** by default. The frontend types use **camelCase**. `transformers.ts` bridges this gap:

```typescript
// Gateway sends: { safest_route: { safety_score: 8.4, icon_name: "ShieldCheck" } }
// Frontend gets: { safestRoute: { safetyScore: 8.4, iconName: "ShieldCheck" } }

export function transformRouteResponse(raw: any): RouteResult {
  return {
    safestRoute: {
      ...raw.safest_route,
      safetyScore: raw.safest_route?.safety_score,
      signals: raw.safest_route?.signals?.map((s: any) => ({
        ...s,
        iconName: s.icon_name ?? s.iconName
      }))
    },
    // ...
  };
}
```

### Auth Hydration Fix

The Navbar's "Sign In" vs "Logout" state was showing incorrectly on first load. Fixed by deriving `isAuthenticated` from `hasHydrated && !!accessToken`:

```typescript
// Before (buggy — renders before hydration):
const { isAuthenticated } = useAuthStore();

// After (correct — waits for localStorage to hydrate):
const { accessToken, hasHydrated } = useAuthStore();
const isAuthenticated = hasHydrated && !!accessToken;
```

---

## Layer 2 — API Gateway

### Request Lifecycle

```
Browser Request
  → CORSMiddleware (origin check)
  → SecurityHeadersMiddleware (CSP, HSTS, X-Frame-Options)
  → PrometheusMiddleware (timing + request count)
  → Rate Limiter (per-user JWT keying)
  → FastAPI Router
  → Dependency: get_current_user (JWT decode → User ORM)
  → Dependency: get_db (AsyncSession)
  → Service function (business logic)
    → [Optional] ML microservice HTTP call
    → SQLAlchemy ORM (no raw SQL)
    → [Optional] write_audit_log()
    → [Optional] Prometheus counter.inc()
  → Pydantic response_model validation
  → JSON Response (snake_case)
```

### JWT Strategy

- **Access token:** 15-minute expiry (`ACCESS_TOKEN_EXPIRE_MINUTES=15`)
- **Refresh token:** 30-day expiry, stored in Zustand localStorage
- **Algorithm:** HS256 with `JWT_SECRET` from environment
- **No token blacklist:** Logout is client-side only in Layer 7 (blocklist planned for Layer 8)

### Fallback Strategy

Every ML service call wraps in try/except. If the microservice is down or times out, the gateway falls back to rule-based logic:

| Service | Fallback |
|---|---|
| PCOD | Rule-based scoring: `len(symptoms) * 4.5 + stress/sleep/exercise penalties` |
| Mood | Returns `{"error": "insufficient_data"}` if < 7 logs, else static averages |
| Safety | Returns hardcoded Mumbai `MOCK_SAFEST_ROUTE` / `MOCK_FASTEST_ROUTE` with real coordinates |

---

## Layer 3 — PCOD ML Service

### Model Architecture

- **Algorithm:** XGBoost multi-class classifier
- **Training data:** 3,000 synthetic records (`ml_training/generate_dataset.py`)
- **Features:** 16 symptom flags + 4 lifestyle metrics + lab value ratios
- **Output classes:** `insulin_resistant`, `inflammatory`, `adrenal`, `post_pill`
- **Metrics:** ~92% accuracy on held-out 600-record test set

### Feature Engineering

Lab values are normalized to standard ranges before inference:
- `insulin / 10` (normalize µIU/mL)
- `testosterone / 10` (normalize pg/mL)
- `lh_fsh_ratio` computed from raw values
- `amh / 3.5` (normalize ng/mL)

### Symptom Order (Source of Truth)

`ml/constants.py::SYMPTOM_ORDER` — a 16-item list that defines the exact column order for XGBoost input. Any new symptom must be appended here, retrained, and redeployed atomically.

---

## Layer 4 — Mood Service

### Correlation Algorithm

1. Fetch last N days of mood logs from gateway payload
2. Assign each log a `cycle_phase` (menstrual/follicular/ovulation/luteal) using `cycle_utils.py`
3. Compute **Pearson correlation** between `cycle_day` and `mood_score` (scipy)
4. Detect PMS risk: luteal phase with mood_score < 5 on ≥ 3 days
5. Identify peak energy window: follicular phase average energy
6. If `ANTHROPIC_API_KEY` is set: generate natural language insights via Claude 3.5 Sonnet
7. Return `CorrelationResult` (proxied to gateway, transformers handle snake→camel)

### Insufficient Data Gate

If the user has fewer than 7 mood logs, the service returns:
```json
{"error": "insufficient_data", "logs_available": 3}
```
The frontend catches this and renders a progress bar UI instead of an error.

---

## Layer 5 — Safety Service

### Route Scoring Algorithm

1. Build a geographic grid graph around the origin→destination bounding box
2. Weight each edge using the **risk heatmap** (deterministic based on time-of-day + area type)
3. Run **Dijkstra** for the safest path (minimize risk weight)
4. Run **A\*** for the fastest path (minimize distance)
5. Compute safety signals for each route (police station proximity, CCTV, lighting, foot traffic)
6. Return `safestRoute` and `fastestRoute` in camelCase JSON

### camelCase Output

The safety service intentionally returns camelCase (`safetyScore`, `iconName`, `safestRoute`) because it was designed before the gateway transformer pattern was established. The gateway's `safety_service.py` contains `_route_option_from_camel()` to bridge this to Pydantic snake_case models before returning to the frontend.

---

## Layer 7 — Production Security

### Field-Level Encryption

Sensitive health data (lab values: insulin, testosterone, AMH, LH/FSH, glucose) is encrypted with **Fernet symmetric encryption** before being written to PostgreSQL:

```python
# In pcod_service.py — runs before every DB write
encrypted_lab_values = encrypt_dict(
    raw_lab_values,
    fields=["insulin", "testosterone", "lh_fsh", "amh", "glucose"]
)
analysis = PCODAnalysis(lab_values=encrypted_lab_values, ...)
```

The Fernet key lives exclusively in the environment variable `FERNET_SECRET_KEY`. It is never committed to source control.

### Key Rotation (90-day cycle)

```
Day 0:   FERNET_SECRET_KEY = KeyA
Day 90:  FERNET_SECRET_KEY = KeyB, FERNET_SECRET_KEY_OLD = KeyA
         → MultiFernet: decrypts old rows with KeyA, encrypts new rows with KeyB
Day 180: FERNET_SECRET_KEY = KeyC, FERNET_SECRET_KEY_OLD = KeyB
         → All KeyA-encrypted rows should be re-encrypted by migration script
```

### Security Headers

`SecurityHeadersMiddleware` injects these on every response:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; frame-ancestors 'none'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` |

### Rate Limits

| Endpoint | Limit | Key |
|---|---|---|
| `POST /auth/register` | 5/min | IP |
| `POST /auth/login` | 10/min | IP |
| `POST /pcod/analyze` | 5/min | User ID (JWT) |
| `POST /mood/log` | 20/min | User ID (JWT) |
| `POST /safety/sos` | **Unlimited** | Never rate-limit safety-critical SOS |
| Everything else | 60/min | User ID or IP |

### Audit Log Schema

Every access to health data writes to the `audit_logs` table:

```
id               UUID (PK)
timestamp        DATETIME (indexed)
accessor_user_id VARCHAR(36) — who made the request
target_user_id   VARCHAR(36) — whose data was accessed (indexed)
resource_type    VARCHAR(50) — "pcod_analysis", "mood_log", "sos_event", "full_data_export"
resource_id      VARCHAR(36) — specific record ID
action           VARCHAR(20) — "read", "write", "delete", "export"
ip_address       VARCHAR(45) — supports IPv6
user_agent       VARCHAR(500)
extra            JSON — additional context (subtype, risk_score, contacts_notified, etc.)
```

### DPDP Compliance Endpoints

| Endpoint | DPDP Article | Description |
|---|---|---|
| `GET /users/me/data/export` | Art. 11 (Portability) | Full JSON dump of all user health data |
| `DELETE /users/me/data` | Art. 12 (Erasure) | Hard-deletes all health records; keeps account |

---

## Data Flow Reference

### PCOD Analysis — Full Chain
```
Browser form submit
  → POST /pcod/analyze (gateway, rate limited 5/min)
  → pcod.py router: validates PCODAnalyzeRequest
  → pcod_service.run_pcod_analysis()
    → POST http://localhost:8001/analyze (PCOD ML service)
      [on failure: rule-based fallback]
    → encrypt_dict(lab_values, fields=[...])   ← Layer 7
    → PCODAnalysis.save() to PostgreSQL
  → write_audit_log()   ← Layer 7
  → pcod_analyses_total.labels(subtype=...).inc()   ← Prometheus
  → return PCODAnalyzeResponse (snake_case JSON)
Frontend transformers.ts:
  → transformPCODResponse(raw) → PCODAnalysisResult (camelCase)
  → ResultPanel renders drivers, recommendations, lab flags
```

### SOS Alert — Full Chain
```
User taps SOS button
  → POST /safety/sos (gateway, NO rate limit — safety critical)
  → safety.py router: NO @limiter.limit decorator
  → sos_events_total.inc()   ← Prometheus counter
  → safety_service.trigger_sos()
    → Create SOSEvent in DB
    → Query EmergencyContact table
    → Log: "🚨 SOS ALERT: {name} ({phone}) at {lat},{lng}"
    → [TODO Layer 8: Twilio SMS to each contact]
  → write_audit_log(action="write", resource_type="sos_event")   ← Layer 7
  → return SOSResponse { event_id, contacts_notified, message }
```

---

## API Contract Reference

### POST /pcod/analyze
```json
Request:
{
  "symptoms": ["Irregular periods", "Acne", "Fatigue"],
  "lifestyle": { "sleep": 5, "stress": 8, "exercise": 1, "water": 4 },
  "lab_values": { "insulin": "18.4", "testosterone": "4.2", "lh_fsh": "2.8", "amh": "8.1", "glucose": "92" }
}

Response:
{
  "id": "uuid",
  "subtype": "insulin_resistant",
  "subtype_label": "Insulin-Resistant PCOD",
  "risk_score": 82.5,
  "confidence": 65.0,
  "drivers": [{ "label": "Insulin Resistance", "value": 78, "color": "#FF5F7E" }],
  "recommendations": [{ "category": "Diet", "title": "Low-GI Nutrition", "desc": "...", "priority": "high", "icon_name": "Salad" }],
  "lab_flags": [],
  "created_at": "2026-06-16T12:00:00"
}
```

### POST /safety/route
```json
Request:
{
  "origin": { "lat": 19.0544, "lng": 72.8347 },
  "destination": { "lat": 19.1136, "lng": 72.8479 }
}

Response (gateway snake_case):
{
  "safest_route": {
    "type": "safest",
    "distance": "4.1 km",
    "duration": "15 min",
    "safety_score": 8.4,
    "coordinates": [[72.8347, 19.0544], [72.8479, 19.1136]],
    "signals": [{ "type": "police", "description": "Police station within 200m", "icon_name": "ShieldCheck", "positive": true }]
  },
  "fastest_route": { ... },
  "safety_signals": [...]
}
```

### GET /users/me/data/export
```json
Response:
{
  "export_timestamp": "2026-06-16T12:00:00",
  "user": { "id": "uuid", "email": "...", "name": "..." },
  "health_profile": { "cycle_length": 28, "last_period_date": "2026-06-01" },
  "pcod_analyses": [{ "id": "uuid", "subtype": "insulin_resistant", "risk_score": 72.0, "created_at": "..." }],
  "mood_logs": [{ "id": "uuid", "date": "2026-06-15", "mood_score": 8, "mood_state": "Calm" }],
  "emergency_contacts": [{ "id": "uuid", "name": "Mom", "phone": "+91..." }],
  "sos_events": [{ "id": "uuid", "triggered_at": "...", "resolved": false }]
}
```

---

## 🚧 Planned Next Layers

| Layer | Description |
|---|---|
| **Layer 6** | WebSocket real-time events (SOS live tracking, mood updates) |
| **Layer 8** | Twilio SMS/Email on SOS; push notifications |
| **Layer 9** | Alembic database migrations (replace create_all with proper versioning) |
| **Layer 10** | AWS ECS deployment with Terraform, RDS + ElastiCache, GitHub Actions CI/CD |
