# Deployment Guide

This project is organized as a **monorepo with separate containers** for frontend and backend.

## Project Structure

```
tin/
├── Dockerfile.backend      # Backend container (Express + tRPC)
├── Dockerfile.frontend     # Frontend container (React + Vite + Nginx)
├── docker-compose.yml      # Local development setup
├── nginx.conf              # Nginx config for frontend
├── src/
│   ├── server/            # Backend code
│   └── routes/            # Frontend code
└── prisma/                # Database schema
```

## Architecture

- **Frontend**: React app built with Vite, served via Nginx
- **Backend**: Express server with tRPC, runs on Bun
- **Database**: PostgreSQL (external or containerized)

## Local Development with Docker

1. **Create `.env` file**:

```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/tin
FRONTEND_URL=http://localhost:3000
WORKOS_API_KEY=your_workos_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
JWT_SECRET=your_jwt_secret
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

2. **Start all services**:

```bash
docker-compose up -d
```

3. **Run database migrations** (first time):

```bash
docker-compose exec backend bun run prisma migrate deploy
```

4. **Access the app**:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

5. **Stop services**:

```bash
docker-compose down
```

## Deployment Options

### Option 1: Railway (Recommended)

Railway can deploy both containers and provides PostgreSQL.

**📖 See `RAILWAY_DEPLOYMENT.md` for complete step-by-step guide**

**Quick Steps:**

1. Create Railway project from GitHub
2. Add PostgreSQL database
3. Deploy backend service (Dockerfile: `Dockerfile.backend`)
4. Deploy frontend service (Dockerfile: `Dockerfile.frontend`)
5. Set environment variables (see `RAILWAY_DEPLOYMENT.md`)
6. Run migrations: `railway run bun run prisma migrate deploy`

**Key Environment Variables:**

- Backend: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `FRONTEND_URL`, WorkOS keys, JWT secret
- Frontend: `VITE_API_URL` (your backend URL)

### Option 2: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Create PostgreSQL**:

```bash
fly postgres create --name tin-db
```

3. **Deploy Backend**:

```bash
cd /path/to/project
fly launch --dockerfile Dockerfile.backend --name tin-backend
fly postgres attach tin-db -a tin-backend
fly secrets set FRONTEND_URL="https://your-frontend.fly.dev"
fly secrets set WORKOS_API_KEY="your_key"
fly secrets set WORKOS_CLIENT_ID="your_client_id"
fly secrets set WORKOS_REDIRECT_URI="https://your-frontend.fly.dev/auth/callback"
fly secrets set JWT_SECRET="your_jwt_secret"
fly secrets set UPLOADTHING_SECRET="your_secret"
fly secrets set UPLOADTHING_APP_ID="your_app_id"
fly deploy
```

4. **Deploy Frontend** (with backend URL):

```bash
fly launch --dockerfile Dockerfile.frontend --name tin-frontend
# Set build arg for backend URL
fly deploy --build-arg VITE_API_URL=https://your-backend.fly.dev
```

### Option 3: Render

1. **Create PostgreSQL** in Render dashboard
2. **Deploy Backend**:
   - New Web Service → Connect GitHub
   - Dockerfile: `Dockerfile.backend`
   - Environment: Add all required variables
   - Set `FRONTEND_URL` to your frontend URL
3. **Deploy Frontend**:
   - New Web Service → Connect GitHub
   - Dockerfile: `Dockerfile.frontend`
   - Build Command: `docker build --build-arg VITE_API_URL=https://your-backend.onrender.com -f Dockerfile.frontend -t tin-frontend .`
   - Or set `VITE_API_URL` in environment and modify Dockerfile to use it

### Option 4: Split Deployment (Frontend + Backend)

**Frontend on Vercel/Netlify**:

- Build command: `bun run build`
- Output directory: `dist`
- Environment variables: `VITE_API_URL` (your backend URL)

**Backend on Railway/Fly.io**:

- Use `Dockerfile.backend`
- Set all environment variables

**Database**: Use Neon or Supabase (free PostgreSQL)

## Environment Variables

### Backend Required Variables:

- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_REDIRECT_URI` - OAuth callback URL
- `JWT_SECRET` - Secret for JWT tokens
- `UPLOADTHING_SECRET` - UploadThing secret
- `UPLOADTHING_APP_ID` - UploadThing app ID
- `PORT` - Server port (default: 3001)

### Frontend Required Variables (if using Vite):

- `VITE_API_URL` - Backend API URL

## Building Images Manually

```bash
# Build backend
docker build -f Dockerfile.backend -t tin-backend .

# Build frontend (for docker-compose - no VITE_API_URL needed)
docker build -f Dockerfile.frontend -t tin-frontend .

# Build frontend (for separate deployment - set backend URL)
docker build --build-arg VITE_API_URL=https://your-backend.com -f Dockerfile.frontend -t tin-frontend .

# Run backend
docker run -p 3001:3001 --env-file .env tin-backend

# Run frontend (docker-compose setup)
docker run -p 3000:80 --network tin-network tin-frontend

# Run frontend (standalone - backend URL set at build time)
docker run -p 3000:80 tin-frontend
```

## Database Migrations

Migrations run automatically on container start via the CMD in `Dockerfile.backend`.

To run manually:

```bash
docker-compose exec backend bun run prisma migrate deploy
```

## Troubleshooting

1. **Backend can't connect to database**:
   - Check `DATABASE_URL` is correct
   - Ensure database is accessible from backend container
   - For external DB, check firewall/network settings

2. **Frontend can't reach backend**:
   - Update `nginx.conf` proxy_pass URL
   - Check CORS settings in backend
   - Verify `FRONTEND_URL` environment variable

3. **Prisma client not found**:
   - Ensure `prisma:generate` runs in Dockerfile
   - Check `.prisma` folder is copied to production stage
