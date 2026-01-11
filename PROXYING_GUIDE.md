# Frontend-Backend Proxying Guide

## Overview

This app uses **two different proxying strategies** depending on the environment:

1. **Development**: Vite dev server proxy
2. **Production (Docker)**: nginx reverse proxy
3. **Production (Separate deployments)**: Direct API calls with `VITE_API_URL`

---

## 🔧 How It Works

### Development Mode (`bun run dev`)

**Frontend**: Vite dev server on `http://localhost:3000`  
**Backend**: Express server on `http://localhost:3001`

**Proxy Configuration** (`vite.config.ts`):
```typescript
server: {
  proxy: {
    '/trpc': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

**How it works**:
- Browser makes request to `http://localhost:3000/trpc/...`
- Vite dev server intercepts `/trpc` requests
- Vite forwards them to `http://localhost:3001/trpc/...`
- Response comes back through Vite to the browser

**Frontend Code** (`src/lib/trpc.ts`):
- Uses relative URL: `/trpc` (no hostname)
- Works because Vite proxy handles it

---

### Production Mode (Docker Compose)

**Frontend**: nginx on port 80 (exposed as 3000)  
**Backend**: Express on port 3001 (internal Docker network)

**Proxy Configuration** (`nginx.conf`):
```nginx
location /trpc {
    proxy_pass http://backend:3001;
    # ... proxy headers ...
}

location /api {
    proxy_pass http://backend:3001;
    # ... proxy headers ...
}
```

**How it works**:
- Browser makes request to `http://localhost:3000/trpc/...`
- nginx intercepts `/trpc` requests
- nginx forwards them to `http://backend:3001/trpc/...` (using Docker service name)
- Response comes back through nginx to the browser

**Frontend Code** (`src/lib/trpc.ts`):
- Uses relative URL: `/trpc` (no hostname)
- Works because nginx proxy handles it

**Key Point**: `backend:3001` is the Docker service name, not accessible from browser. Only nginx can reach it.

---

### Production Mode (Separate Deployments)

When frontend and backend are on different domains (e.g., Railway, Vercel):

**Frontend Code** (`src/lib/trpc.ts`):
- Uses `VITE_API_URL` environment variable if set
- Example: `VITE_API_URL=https://api.yourapp.com`
- Results in: `https://api.yourapp.com/trpc`

**Build Command**:
```bash
VITE_API_URL=https://api.yourapp.com bun run vite build
```

**No proxy needed** - direct API calls to the backend URL.

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" or "CORS Error" in Production

**Symptom**: Frontend can't reach backend in Docker

**Cause**: Frontend using absolute URL like `http://localhost:3001/trpc` instead of relative `/trpc`

**Solution**: 
- ✅ Fixed in `src/lib/trpc.ts` - now uses relative URLs by default
- Only uses absolute URLs if `VITE_API_URL` is set

### Issue 2: Proxy Not Working in Development

**Symptom**: API calls fail in dev mode

**Check**:
1. Backend is running on port 3001: `cd server && bun run dev`
2. Frontend is running on port 3000: `bun run dev:client`
3. Check browser Network tab - requests should go to `localhost:3000/trpc`, not `localhost:3001`

### Issue 3: nginx Can't Reach Backend in Docker

**Symptom**: 502 Bad Gateway in production

**Check**:
1. Both services on same Docker network: `tin-network` (in `docker-compose.yml`)
2. Backend service name is `backend` (matches `nginx.conf`)
3. Backend is running: `docker-compose ps`
4. Check nginx logs: `docker-compose logs frontend`
5. Check backend logs: `docker-compose logs backend`

---

## 📝 Testing the Proxy

### Test Development Proxy

1. Start dev servers:
   ```bash
   bun run dev
   ```

2. Open browser DevTools → Network tab
3. Make an API call (e.g., load a page that uses tRPC)
4. Check the request:
   - ✅ Should see: `http://localhost:3000/trpc/...`
   - ❌ Should NOT see: `http://localhost:3001/trpc/...`

### Test Production Proxy (Docker)

1. Build and start:
   ```bash
   docker-compose up --build
   ```

2. Open browser DevTools → Network tab
3. Make an API call
4. Check the request:
   - ✅ Should see: `http://localhost:3000/trpc/...`
   - ❌ Should NOT see: `http://localhost:3001/trpc/...`

5. Check nginx logs:
   ```bash
   docker-compose logs frontend | grep trpc
   ```

6. Check backend receives requests:
   ```bash
   docker-compose logs backend | grep trpc
   ```

---

## 🔍 Debugging Commands

```bash
# Check if services are running
docker-compose ps

# View frontend (nginx) logs
docker-compose logs frontend

# View backend logs
docker-compose logs backend

# Test nginx configuration
docker-compose exec frontend nginx -t

# Restart services
docker-compose restart frontend backend

# Rebuild and restart
docker-compose up --build -d
```

---

## 📚 Key Files

- **`vite.config.ts`**: Development proxy configuration
- **`nginx.conf`**: Production proxy configuration
- **`src/lib/trpc.ts`**: Frontend API client (uses relative URLs)
- **`docker-compose.yml`**: Service networking configuration
- **`Dockerfile.frontend`**: Builds frontend with nginx

---

## ✅ Summary

**The Fix Applied**:
- Changed `src/lib/trpc.ts` to use relative URLs (`/trpc`) by default
- Only uses absolute URLs when `VITE_API_URL` is explicitly set
- This allows nginx proxy to work correctly in production

**Why This Works**:
- Relative URLs (`/trpc`) → Browser sends to same origin → nginx intercepts → proxies to backend
- Absolute URLs (`http://localhost:3001/trpc`) → Browser tries direct connection → fails (backend not accessible from browser)
