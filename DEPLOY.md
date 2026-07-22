# 🚀 HERA Deployment Guide (Free Tier)

This guide walks you through deploying the HERA platform (Frontend + Backend + Database) using free tiers on Vercel and Railway.

## Architecture & Hosting Platforms
- **Frontend (Next.js):** [Vercel](https://vercel.com) (Free forever for hobbyists)
- **Backend (FastAPI services):** [Railway](https://railway.app) ($5 free credit/month, enough for this project)
- **Database (PostgreSQL & Redis):** [Railway](https://railway.app) (Included in the $5/month credits)

---

## Step 1: Deploy Database (Railway)

1. Go to [Railway](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Provision PostgreSQL**.
3. Once provisioned, click on the PostgreSQL service → **Variables**.
4. Copy the `DATABASE_URL` (it should look like `postgresql://postgres:password@host:port/railway`).
5. Change `postgresql://` to `postgresql+asyncpg://` to enable async support in our backend. Keep this modified URL handy.
6. Click **New** → **Database** → **Add Redis** (for rate limiting).
7. Copy the Redis connection URL.

---

## Step 2: Deploy API Gateway & Microservices (Railway)

We'll deploy the API Gateway first. Since this is a monorepo, we need to specify the root directory.

1. In your Railway project, click **New** → **GitHub Repo** and select your HERA repository.
2. Once the repo is added, go to the service settings.
3. Under **Build**, set the **Root Directory** to `/services/api-gateway`.
4. Under **Variables**, add the following:
   - `DATABASE_URL` = (Your modified asyncpg URL from Step 1)
   - `REDIS_URL` = (Your Redis URL from Step 1)
   - `JWT_SECRET` = (Generate a strong 32+ char secret)
   - `FERNET_SECRET_KEY` = (Generate a base64 32-byte key)
   - `GROQ_API_KEY` = (Your Groq API Key)
5. Under **Networking**, click **Generate Domain** (e.g., `hera-api.up.railway.app`).
6. Deploy the service.

*(Optional)* You can repeat Step 2 for `pcod-service`, `mood-service`, and `safety-service` by changing the Root Directory to their respective folders and generating internal/external domains. Note: Ensure you configure the API Gateway to point to these microservices using environment variables.

---

## Step 3: Run Alembic Database Migrations

Before the backend can work, you need to create the tables in PostgreSQL.

1. Ensure Railway is running and PostgreSQL is up.
2. You can either run this locally pointing to the remote DB, or use Railway's built-in console.
3. Locally (using your remote `DATABASE_URL`):
   ```bash
   cd services/api-gateway
   export DATABASE_URL="postgresql+asyncpg://your-railway-url..."
   poetry run alembic -c ../../db/migrations/alembic.ini upgrade head
   ```

---

## Step 4: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project** and import your HERA repository.
3. Vercel automatically detects Next.js.
4. Set the **Root Directory** to `apps/web`.
5. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://your-railway-api-domain.up.railway.app` (The domain you generated in Step 2)
6. Click **Deploy**.

---

## Step 5: Verification

1. Once Vercel finishes building, click on the provided Vercel domain.
2. Test user registration and login.
3. Verify that the Dashboard loads successfully.
4. Test the **Period Tracker** and **AI Companion** modules.

🎉 **Congratulations!** HERA is now live on the internet for free.
