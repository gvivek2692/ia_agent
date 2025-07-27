# Deployment Configuration

## Backend - Render Deployment

**Deployed URL:** https://ia-agent-aguf.onrender.com/

### Environment Variables on Render:
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Automatically set by Render (usually 10000)

### Build Command:
```bash
npm install
```

### Start Command:
```bash
npm start
```

### Health Check:
- Endpoint: `/health`
- Expected Response: `{"status": "healthy", "openai_configured": true}`

## Frontend Configuration

### Environment Files:
- `.env` - Production configuration (points to Render)
- `.env.local` - Local development (points to localhost:3001)

### Current Configuration:
- **Production Backend**: https://ia-agent-aguf.onrender.com
- **Local Backend**: http://localhost:3001

### Automatic Environment Detection:
The frontend automatically detects whether it's running in development or production mode and uses the appropriate backend URL.

## API Endpoints Available:

✅ **Health Check**
- `GET /health`

✅ **Financial Data**
- `GET /api/user/context` - Complete user profile
- `GET /api/portfolio/summary` - Portfolio overview
- `GET /api/goals/overview` - Financial goals
- `GET /api/transactions/recent` - Recent transactions

✅ **Market Data**
- `GET /api/market/overview` - Current market status
- `GET /api/market/portfolio-impact` - Portfolio market impact

✅ **Real-time Chat**
- WebSocket connection for chat functionality
- Conversation memory and context tracking

## Testing Deployment:

### Test Backend Health:
```bash
curl https://ia-agent-aguf.onrender.com/health
```

### Test Portfolio Data:
```bash
curl https://ia-agent-aguf.onrender.com/api/portfolio/summary
```

### Test Frontend Connection:
1. Run `npm start` in frontend directory
2. Check console for connection status to Render backend
3. Verify chat interface connects properly

## CORS Configuration:
Backend is configured to accept requests from:
- Local development: `http://localhost:3000`
- Vercel deployments: `*.vercel.app`
- Netlify deployments: `*.netlify.app`
- GitHub Pages: `*.github.io`

## Notes:
- Backend automatically handles environment detection
- OpenAI API key must be set in Render environment variables
- Socket.io configured for both WebSocket and polling transports
- Real-time market data simulation included