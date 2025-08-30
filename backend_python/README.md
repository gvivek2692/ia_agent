# AI Wealth Advisor - Python Backend

A FastAPI-based backend for the AI Wealth Advisor platform, migrated from Node.js/Express with enhanced performance and type safety.

## Features

- **FastAPI Framework**: Modern, fast Python web framework with automatic API documentation
- **Real-time Chat**: WebSocket-based AI chat with OpenAI GPT-4.1 Mini integration
- **Portfolio Management**: Support for demo data, Kite Connect integration, and PDF uploads
- **PDF Processing**: Password-protected CAS statement parsing with advanced text extraction
- **Web Search Integration**: Real-time market data via Serper API
- **Authentication**: JWT-based user authentication and session management
- **Type Safety**: Full Pydantic models with automatic validation
- **Auto Documentation**: Automatic API documentation at `/docs`

## Technology Stack

- **FastAPI**: Web framework with automatic API documentation
- **Pydantic**: Data validation and settings management
- **OpenAI**: GPT-4.1 Mini for AI-powered financial advice
- **PyPDF2/pdfplumber**: PDF parsing with password protection
- **KiteConnect**: Live portfolio data from Zerodha
- **httpx**: Async HTTP client for web search
- **bcrypt**: Password hashing
- **python-jose**: JWT token handling

## Quick Start

### 1. Install Dependencies

```bash
cd backend_python
pip install -r requirements.txt
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key_here
KITE_API_KEY=your_kite_api_key_here
KITE_API_SECRET=your_kite_api_secret_here
SERPER_API_KEY=your_serper_api_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
```

### 3. Start Development Server

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 3001

# Option 3: Using the main module
python -m main
```

The server will start at `http://localhost:3001`

### 4. API Documentation

- **Interactive Docs**: http://localhost:3001/docs
- **OpenAPI JSON**: http://localhost:3001/openapi.json
- **Health Check**: http://localhost:3001/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/session` - Get session info

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{user_id}` - Get specific user
- `GET /api/user/{user_id}/context` - Get user context for AI
- `GET /api/user/{user_id}/transactions` - Get user transactions
- `GET /api/user/{user_id}/goals` - Get user financial goals

### Portfolio & Market Data
- `GET /api/portfolio/summary` - Get portfolio summary
- `GET /api/goals/overview` - Get goals overview
- `GET /api/transactions/recent` - Get recent transactions
- `GET /api/market/overview` - Get market overview
- `GET /api/market/portfolio-impact` - Get portfolio market impact

### Chat & AI
- `POST /api/chat` - Process chat message (REST)
- `WebSocket /ws/{client_id}` - Real-time chat WebSocket
- `GET /api/conversations` - Get conversations
- `GET /api/conversations/{id}` - Get specific conversation
- `DELETE /api/conversations/{id}` - Delete conversation
- `PUT /api/conversations/{id}/title` - Rename conversation
- `GET /api/conversations/search/{query}` - Search conversations

### Kite Connect Integration
- `GET /api/kite/status` - Get Kite Connect status
- `GET /api/kite/login` - Get Kite login URL
- `POST /api/kite/callback` - Handle Kite OAuth callback
- `POST /api/kite/refresh-portfolio` - Refresh portfolio data
- `GET /api/kite/user/{kite_user_id}` - Get Kite user data

### File Upload
- `POST /api/upload/mf-statement` - Upload mutual fund statement PDF
- `POST /api/check-username` - Check username availability

### AI Insights
- `GET /api/ai-insights` - Get AI portfolio insights
- `GET /api/portfolio-recommendations` - Get portfolio recommendations
- `GET /api/risk-analysis` - Get risk analysis
- `GET /api/market-analysis` - Get market analysis
- `POST /api/generate-default-goals` - Generate default financial goals
- `POST /api/update-user-goals` - Update user goals

## WebSocket Chat Protocol

Connect to `/ws/{client_id}` and send/receive messages:

### Send Message
```json
{
  "type": "chat_message",
  "message": "How is my portfolio performing?",
  "userId": "user_123",
  "conversationId": "conv_456",
  "context": {...}
}
```

### Receive Response
```json
{
  "type": "chat_response", 
  "data": {
    "id": "msg_789",
    "message": "Your portfolio is performing well...",
    "timestamp": "2024-01-15T10:30:00Z",
    "is_bot": true,
    "sources": [...]
  }
}
```

## Project Structure

```
backend_python/
├── main.py                 # FastAPI application entry point
├── run.py                  # Development server runner
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables
├── config/
│   └── settings.py        # Application settings
├── models/
│   ├── user.py           # User data models
│   ├── chat.py           # Chat models
│   └── portfolio.py      # Portfolio models
├── services/
│   ├── auth_service.py   # Authentication service
│   ├── upload_service.py # PDF upload & parsing
│   ├── kite_service.py   # Kite Connect integration
│   ├── web_search_service.py # Web search (Serper API)
│   ├── ai_service.py     # OpenAI integration
│   ├── conversation_service.py # Chat history
│   └── websocket_manager.py # WebSocket management
├── routers/
│   ├── auth.py           # Auth endpoints
│   ├── users.py          # User endpoints
│   ├── portfolio.py      # Portfolio endpoints
│   ├── chat.py           # Chat endpoints
│   ├── kite.py           # Kite endpoints
│   ├── upload.py         # Upload endpoints
│   └── ai_insights.py    # AI insights endpoints
└── data/
    ├── users.json        # User data storage
    ├── conversations/    # Chat conversations
    └── portfolioTransactions/ # Portfolio data
```

## Key Features

### AI-Powered Chat
- Real-time WebSocket communication
- Context-aware conversations with portfolio data
- Web search integration for current market data
- Conversation history and persistence

### Portfolio Management
- **Demo Data**: Pre-built demo portfolios for testing
- **Kite Connect**: Live portfolio data from Zerodha accounts
- **PDF Upload**: Parse mutual fund CAS statements with password support
- **Real-time Updates**: Portfolio refresh and sync capabilities

### Advanced PDF Processing
- Password-protected PDF support using PyPDF2/pdfplumber
- Y-coordinate based text reconstruction for accurate parsing
- Direct market value extraction from CAS statements
- Comprehensive transaction and scheme data extraction

### Market Data Integration
- Real-time web search for current market prices and news
- Intelligent query enhancement based on user portfolio
- Source attribution for AI responses
- Market sentiment analysis

### Security & Authentication
- JWT-based authentication system
- Bcrypt password hashing
- Session management
- CORS configuration for cross-origin requests

## Migration Benefits from Node.js

1. **Performance**: FastAPI is significantly faster than Express.js
2. **Type Safety**: Pydantic provides automatic validation and serialization
3. **Documentation**: Automatic OpenAPI documentation generation
4. **Async Support**: Better async/await support throughout the application
5. **Python Ecosystem**: Access to powerful data science and ML libraries
6. **Developer Experience**: Better error messages and debugging capabilities

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Linting & Formatting
```bash
# Install development tools
pip install black flake8 mypy

# Format code
black .

# Check linting
flake8 .

# Type checking
mypy .
```

### Production Deployment

For production deployment, use a WSGI server like Gunicorn:

```bash
# Install production dependencies
pip install gunicorn

# Start production server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3001
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4.1 Mini | Yes |
| `KITE_API_KEY` | Kite Connect API key | Optional |
| `KITE_API_SECRET` | Kite Connect API secret | Optional |
| `SERPER_API_KEY` | Serper web search API key | Optional |
| `JWT_SECRET_KEY` | JWT signing secret | Yes |
| `PORT` | Server port (default: 3001) | No |

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`

2. **Permission Errors**: Check file permissions for data directory and uploaded files

3. **PDF Parsing Errors**: Verify PyPDF2 and pdfplumber are properly installed

4. **WebSocket Connection Issues**: Check CORS configuration and client connection code

5. **API Key Errors**: Verify all required environment variables are set in `.env`

### Logs

The application logs important events and errors. Check the console output for debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure code passes linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.