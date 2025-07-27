# Backend Configuration Guide

## Current Setup
The frontend is configured to use the **deployed Render backend** by default.

## Backend URLs
- **Production (Render)**: https://ia-agent-aguf.onrender.com
- **Local Development**: http://localhost:3001

## How to Switch Backends

### Option 1: Use Deployed Backend (Default)
**No action needed** - this is the current configuration.

### Option 2: Use Local Backend
Create a `.env.local` file in the frontend directory:

```bash
# Create .env.local file
cat > .env.local << EOF
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_API_URL=http://localhost:3001/api
EOF
```

Then restart your development server:
```bash
npm start
```

### Option 3: Use environment.ts Flag
Edit `src/config/environment.ts` and change:
```typescript
const USE_LOCAL_BACKEND = true; // Set to true for local backend
```

## Troubleshooting Connection Issues

### 1. Check Backend Status
Test if the backend is running:
```bash
# For deployed backend
curl https://ia-agent-aguf.onrender.com/health

# For local backend  
curl http://localhost:3001/health
```

### 2. Check Console Logs
Look for these messages in browser console:
- `Connecting to backend: [URL]`
- Connection status messages

### 3. Connection Test Component
The app includes a connection test component that shows:
- Current backend URL
- Connection status
- Environment (Dev/Production)

### 4. Common Issues
- **WebSocket timeout**: Normal for Render cold starts (5-10 seconds)
- **CORS errors**: Backend CORS is configured for common hosting platforms
- **Network errors**: Check if backend URL is accessible

## Environment Files Priority
1. `.env.local` (highest priority - gitignored)
2. `.env.development` (for development)  
3. `.env` (default/production)

## Current Configuration
- **Default**: Uses Render backend for stability
- **Local Override**: Create `.env.local` to use local backend
- **Auto-detection**: Automatically handles environment differences