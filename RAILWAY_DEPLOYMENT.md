# Railway Deployment Guide

Step-by-step guide to deploy your app to Railway.

## Prerequisites

1. GitHub account with your code pushed
2. Railway account (sign up at [railway.app](https://railway.app))
3. WorkOS account (for authentication)
4. UploadThing account (for file uploads)

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository

## Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL instance
4. **Copy the `DATABASE_URL`** from the database service (you'll need it later)

## Step 3: Deploy Backend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** (select the same repo)
3. Railway will detect your repo
4. **Configure the service:**
   - **Name**: `tin-backend` (or any name you prefer)
   - Railway will auto-detect `Dockerfile.backend` if present
   - If not detected, go to **Settings** → **Build** → Set Dockerfile path to `Dockerfile.backend`

5. **Add Environment Variables** (Settings → Variables):

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   FRONTEND_URL=https://your-frontend-service.up.railway.app
   WORKOS_API_KEY=your_workos_api_key
   WORKOS_CLIENT_ID=your_workos_client_id
   WORKOS_REDIRECT_URI=https://your-frontend-service.up.railway.app/auth/callback
   JWT_SECRET=your_secure_random_string_here
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   ```

   **Important Notes:**
   - `DATABASE_URL` uses Railway's reference syntax: `${{Postgres.DATABASE_URL}}`
   - Replace `Postgres` with your actual database service name
   - `FRONTEND_URL` will be set after deploying frontend
   - Generate `JWT_SECRET` with: `openssl rand -base64 32`

6. **Configure Build Settings** (if needed):
   - Build Command: (leave empty, Dockerfile handles it)
   - Start Command: (leave empty, Dockerfile handles it)

7. **Deploy**: Railway will automatically start building and deploying

8. **Get Backend URL**:
   - Go to **Settings** → **Networking**
   - Generate a domain or use the provided one
   - Copy the URL (e.g., `https://tin-backend-production.up.railway.app`)

## Step 4: Deploy Frontend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"** (select the same repo)
3. **Configure the service:**
   - **Name**: `tin-frontend`
   - Go to **Settings** → **Build** → Set Dockerfile path to `Dockerfile.frontend`

4. **Add Environment Variables** (Settings → Variables):

   ```
   VITE_API_URL=https://your-backend-service.up.railway.app
   ```

   **Important**: Replace with your actual backend URL from Step 3

5. **Configure Build Settings**:
   - Build Command: (leave empty, Dockerfile handles it)
   - Start Command: (leave empty, Dockerfile handles it)

6. **Deploy**: Railway will automatically start building and deploying

7. **Get Frontend URL**:
   - Go to **Settings** → **Networking**
   - Generate a domain or use the provided one
   - Copy the URL (e.g., `https://tin-frontend-production.up.railway.app`)

## Step 5: Update Environment Variables

After getting both URLs, update:

1. **Backend Service** → **Variables**:
   - Update `FRONTEND_URL` to your frontend URL
   - Update `WORKOS_REDIRECT_URI` to `https://your-frontend-url/auth/callback`

2. **Frontend Service** → **Variables**:
   - Update `VITE_API_URL` to your backend URL

3. **Redeploy both services** (Railway will auto-redeploy on variable changes, or trigger manually)

## Step 6: Run Database Migrations

1. Go to your **Backend service**
2. Click on **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**
5. Check if migrations ran automatically (they should via the Dockerfile CMD)

**If migrations didn't run**, use Railway's CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run bun run prisma migrate deploy
```

## Step 7: Configure WorkOS

1. Go to your WorkOS dashboard
2. Update **Redirect URIs** to include:
   - `https://your-frontend-url/auth/callback`
3. Update **Allowed Origins** to include:
   - `https://your-frontend-url`

## Step 8: Configure UploadThing

1. Go to your UploadThing dashboard
2. Update **Allowed Origins** to include:
   - `https://your-frontend-url`

## Troubleshooting

### Backend won't start

1. **Check logs**: Backend service → Deployments → Latest → View Logs
2. **Common issues**:
   - Missing `DATABASE_URL`: Check database service is running
   - Prisma client not generated: Check build logs
   - Port conflicts: Ensure `PORT=3001` is set

### Frontend can't reach backend

1. **Check CORS**: Ensure `FRONTEND_URL` in backend matches frontend URL
2. **Check `VITE_API_URL`**: Must be set at build time (not runtime)
3. **Check network**: Both services should be in same Railway project

### Database connection issues

1. **Check `DATABASE_URL`**: Use Railway's reference syntax
2. **Check database is running**: Database service should show "Active"
3. **Check migrations**: Run `railway run bun run prisma migrate deploy`

### Build failures

1. **Check Dockerfile paths**: Ensure correct Dockerfile is selected
2. **Check build logs**: Service → Deployments → Latest → View Logs
3. **Check dependencies**: Ensure `bun.lockb` is committed

## Railway CLI Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in service
railway run bun run prisma migrate deploy

# Open service shell
railway shell
```

## Cost Estimation

Railway's free tier includes:

- **$5 credit/month** (usually enough for small apps)
- **500 hours** of usage
- **100GB** bandwidth

For this app:

- Backend: ~$2-3/month
- Frontend: ~$1-2/month
- PostgreSQL: Included in free tier (small instances)

**Total**: Usually within free tier for development/testing

## Next Steps

1. Set up custom domains (optional)
2. Configure monitoring/alerts
3. Set up CI/CD (Railway auto-deploys on git push)
4. Configure backups for database

## Useful Links

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Pricing](https://railway.app/pricing)
