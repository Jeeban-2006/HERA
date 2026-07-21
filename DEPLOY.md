# 🚀 HERA — Free Deployment Guide

Deploy the complete HERA platform for **$0/month** using Vercel (frontend) + Railway (backend + database).

---

## 📋 Overview

| Component | Platform | Free Tier Limit | Cost |
|---|---|---|---|
| Next.js Frontend | **Vercel** | 100GB bandwidth/month | ✅ Free |
| API Gateway (FastAPI) | **Railway** | 500 hours + $5 credit/month | ✅ Free |
| PostgreSQL 16 | **Railway** | 1 GB storage | ✅ Free |
| Redis 7 | **Railway** | 25 MB RAM | ✅ Free |
| ML Services (PCOD, Mood, Safety) | **Railway** | Same $5 credit | ✅ Free |
| HERA AI Chat | **Groq** | 14,400 requests/day | ✅ Free |
| Maps | **OpenStreetMap/Leaflet** | Unlimited | ✅ Free |

> **Total monthly cost: $0** for typical usage under free tier limits.

---

## 🔑 Accounts You Need First

Before deploying, create free accounts on:

1. **GitHub** — https://github.com (to push code)
2. **Vercel** — https://vercel.com (frontend hosting)
3. **Railway** — https://railway.app (backend hosting)
4. **Groq** — https://console.groq.com (AI API key)
5. **Sentry** *(optional)* — https://sentry.io (error tracking)

---

## Part 1 — Push Code to GitHub

### Step 1.1 — Initialize Git (if not already done)

Open a terminal at the HERA project root:

```powershell
cd C:\Users\ASUS\Music\HERA

# Initialize git if not already
git init
git branch -M main
```

### Step 1.2 — Add .gitignore entries

Make sure these are in your `.gitignore` (already included):
```
node_modules/
.env
.env.local
__pycache__/
*.pyc
.dist/
```

### Step 1.3 — Commit and push

```powershell
git add .
git commit -m "feat: HERA v2 — 3D landing, AI companion, Leaflet maps"

# Add remote (if not already set)
git remote add origin https://github.com/Jeeban-2006/HERA.git

# Push
git push -u origin main
```

> If you get a conflict, use: `git push --force-with-lease origin main`

---

## Part 2 — Deploy Backend on Railway

Railway will host your API gateway, ML services, PostgreSQL, and Redis.

### Step 2.1 — Create Railway account

1. Go to https://railway.app
2. Click **"Login with GitHub"** → authorize Railway
3. Click **"New Project"**

---

### Step 2.2 — Add PostgreSQL

1. In your Railway project, click **"+ New Service"**
2. Select **"Database" → "PostgreSQL"**
3. Wait ~30 seconds for it to provision
4. Click on the PostgreSQL service → go to **"Variables"** tab
5. Copy the `DATABASE_URL` value — you'll need it shortly

> Railway gives you a full PostgreSQL 16 instance free.

---

### Step 2.3 — Add Redis

1. Click **"+ New Service"** again
2. Select **"Database" → "Redis"**
3. Wait for it to provision
4. Copy the `REDIS_URL` from Variables tab

---

### Step 2.4 — Deploy the API Gateway

1. Click **"+ New Service"** → **"GitHub Repo"**
2. Select your `HERA` repository
3. Railway will detect it — click **"Configure"**
4. Set the **Root Directory** to: `services/api-gateway`
5. Set the **Start Command** to:
   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Go to **"Variables"** tab and add all these:

```env
DATABASE_URL=<paste from PostgreSQL service>
REDIS_URL=<paste from Redis service>
JWT_SECRET=<generate: openssl rand -hex 32>
FERNET_SECRET_KEY=<generate key — see below>
ENVIRONMENT=production
GROQ_API_KEY=<your groq key from console.groq.com>
SENTRY_DSN=<optional — from sentry.io>
```

**Generate your Fernet key:**
```powershell
# Run locally
cd services/api-gateway
poetry run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

7. Click **"Deploy"** — Railway builds and starts your API gateway
8. Once running, click **"Settings"** → **"Networking"** → **"Generate Domain"**
9. Copy the domain (e.g. `https://hera-gateway-production.up.railway.app`) — you'll need this for the frontend

**Verify:** Visit `https://your-domain.up.railway.app/health`  
You should see: `{"status": "healthy", "environment": "production"}`

---

### Step 2.5 — Deploy PCOD ML Service

1. Click **"+ New Service"** → **"GitHub Repo"** → select HERA
2. Set **Root Directory**: `services/pcod-service`
3. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add variable: `ENVIRONMENT=production`
5. Deploy and generate domain
6. Copy the PCOD service URL

---

### Step 2.6 — Deploy Mood Service

1. Click **"+ New Service"** → **"GitHub Repo"** → select HERA
2. Set **Root Directory**: `services/mood-service`
3. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add variables:
   ```env
   ENVIRONMENT=production
   GROQ_API_KEY=<same groq key>
   ```
5. Deploy and generate domain

---

### Step 2.7 — Deploy Safety Service

1. Click **"+ New Service"** → **"GitHub Repo"** → select HERA
2. Set **Root Directory**: `services/safety-service`
3. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add variable: `ENVIRONMENT=production`
5. Deploy and generate domain

---

### Step 2.8 — Link ML Services to API Gateway

Go back to the **API Gateway** service → **Variables** → add:

```env
PCOD_SERVICE_URL=https://your-pcod-service.up.railway.app
MOOD_SERVICE_URL=https://your-mood-service.up.railway.app
SAFETY_SERVICE_URL=https://your-safety-service.up.railway.app
```

Click **"Redeploy"** on the API Gateway.

---

## Part 3 — Deploy Frontend on Vercel

Vercel is the easiest way to deploy Next.js. It auto-detects the framework and deploys instantly.

### Step 3.1 — Import Project

1. Go to https://vercel.com → **"Add New Project"**
2. Click **"Import Git Repository"**
3. Select your `Jeeban-2006/HERA` repository
4. Vercel will detect Next.js automatically

### Step 3.2 — Configure Root Directory

> ⚠️ This is important — the Next.js app is inside `apps/web`, not the root.

1. Expand **"Root Directory"** setting
2. Type: `apps/web`
3. Vercel will now build from the correct directory

### Step 3.3 — Add Environment Variables

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://your-gateway.up.railway.app
GROQ_API_KEY=your_groq_api_key_here
```

> `GROQ_API_KEY` is used server-side in `/api/chat/route.ts` — Vercel keeps it secure.

### Step 3.4 — Deploy

Click **"Deploy"** — Vercel builds and deploys in ~2 minutes.

Once done, Vercel gives you a live URL like:  
`https://hera-jeeban.vercel.app`

### Step 3.5 — Add Custom Domain (Optional, Free)

1. In Vercel project → **"Settings" → "Domains"**
2. Add a domain you own, or use the free `*.vercel.app` domain

---

## Part 4 — Run Database Migrations

After the API Gateway is live on Railway, run Alembic migrations:

### Option A — Railway CLI

```powershell
# Install Railway CLI
npm install -g @railway/cli
railway login

# Link to your project
railway link

# Run migrations
railway run --service api-gateway -- alembic upgrade head
```

### Option B — Railway Console

1. Open your API Gateway service on Railway
2. Click **"Settings" → "Shell"** (or use the Railway terminal)
3. Run:
   ```bash
   alembic upgrade head
   ```

This creates all tables including `users`, `pcod_analyses`, `mood_logs`, `sos_events`, and `audit_logs`.

---

## Part 5 — Verify Full Deployment

Work through this checklist after deploying:

### ✅ Frontend Live
- Open your Vercel URL
- Landing page loads with 3D particle animation
- Scrolling morphs particles through all 6 shapes

### ✅ API Gateway Healthy
- Visit `https://your-gateway.up.railway.app/health`
- Returns: `{"status": "healthy"}`

### ✅ Registration & Login
- Go to `https://your-vercel-url/register`
- Create account → redirects to dashboard
- No CORS errors in browser console

### ✅ HERA AI Companion
- Run a PCOD analysis
- Click "Talk to HERA AI"
- AI responds with health advice

### ✅ Safety Map
- Enter locations → route appears on Leaflet map
- No "API key" errors (Leaflet is free, no key needed)

---

## Part 6 — Environment Variables Quick Reference

### Vercel (Frontend)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Your Railway API Gateway URL |
| `GROQ_API_KEY` | From console.groq.com |

### Railway — API Gateway

| Variable | How to Get |
|---|---|
| `DATABASE_URL` | Auto-provided by Railway PostgreSQL |
| `REDIS_URL` | Auto-provided by Railway Redis |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `FERNET_SECRET_KEY` | `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `GROQ_API_KEY` | From console.groq.com |
| `ENVIRONMENT` | `production` |
| `SENTRY_DSN` | From sentry.io (optional) |

---

## 💡 Tips & Gotchas

### CORS
The API Gateway's `main.py` has CORS configured. Update the `ALLOWED_ORIGINS` environment variable on Railway to include your Vercel domain:
```env
ALLOWED_ORIGINS=https://hera-jeeban.vercel.app,http://localhost:3000
```

### Cold Starts
Railway free tier may have cold starts (first request takes ~5s after inactivity). This is normal on the free plan.

### Scaling
When you outgrow free tiers:
- **Vercel Pro**: $20/month — more bandwidth, Edge Functions
- **Railway Starter**: $5/month — no sleep, more RAM
- **Supabase**: Free PostgreSQL alternative with a larger free tier

### Monitoring (Free)
- **Vercel Analytics**: Built-in, free
- **Railway Metrics**: Built-in CPU/RAM charts
- **Sentry**: 5,000 events/month free — highly recommended

### Custom Domain on Railway
1. Railway service → Settings → Networking → Custom Domain
2. Add your domain and update DNS at your registrar

---

## 🔄 Continuous Deployment (Auto)

Both Vercel and Railway automatically deploy when you push to `main`:

```powershell
# Make changes locally, then:
git add .
git commit -m "your changes"
git push origin main
# → Vercel redeploys frontend automatically
# → Railway redeploys backend automatically
```

Zero-downtime deployments on both platforms.

---

## 📞 Getting Help

| Resource | Link |
|---|---|
| Railway Docs | https://docs.railway.app |
| Vercel Docs | https://vercel.com/docs |
| Groq Docs | https://console.groq.com/docs |
| HERA GitHub | https://github.com/Jeeban-2006/HERA |
| HERA Local Guide | [STARTUP.md](./STARTUP.md) |
