# Railway Quick Start

## TL;DR - Deploy in 5 Minutes

### 1. Create Project & Database

- Go to [railway.app](https://railway.app) → New Project → GitHub Repo
- Add PostgreSQL database
- Copy `DATABASE_URL` from database service

### 2. Deploy Backend

- New Service → GitHub Repo (same repo)
- Name the service: `backend` (or any name you prefer)
- Settings → Build → Dockerfile: `Dockerfile.backend`
- Settings → Variables → Add:
  ```
  DATABASE_URL=${{Postgres.DATABASE_URL}}
  FRONTEND_URL=https://your-frontend.up.railway.app (update after step 3)
  WORKOS_API_KEY=your_key
  WORKOS_CLIENT_ID=your_client_id
  WORKOS_REDIRECT_URI=https://your-frontend.up.railway.app/auth/callback
  JWT_SECRET=$(openssl rand -base64 32)
  UPLOADTHING_SECRET=your_secret
  UPLOADTHING_APP_ID=your_app_id
  ```
- Settings → Networking → Generate domain
- Copy backend URL

### 3. Deploy Frontend

- New Service → GitHub Repo (same repo)
- Settings → Build → Dockerfile: `Dockerfile.frontend`
- Settings → Variables → Add:
  ```
  BACKEND_URL=https://your-backend.up.railway.app
  ```
  **Note**: Do NOT set `VITE_API_URL` - we use nginx proxying instead
- Settings → Networking → Generate domain
- Copy frontend URL

### 4. Update URLs

- Backend: Update `FRONTEND_URL` and `WORKOS_REDIRECT_URI` with frontend URL
- Frontend: Update `BACKEND_URL` with backend URL (if not already set)
- Services will auto-redeploy

### 5. Run Migrations

```bash
railway run bun run prisma migrate deploy
```

Done! 🎉

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.
