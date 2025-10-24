"""
AI Wealth Advisor Backend - Python/FastAPI Implementation
Main application entry point
"""

import os
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import uvicorn
from datetime import datetime

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, users, portfolio, chat, kite, upload, ai_insights, search

# Import services
from services.websocket_manager import WebSocketManager
from services.conversation_service import ConversationService
from services.ai_service import AIService
from config.settings import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Wealth Advisor API",
    description="Python/FastAPI backend for AI-powered wealth advisory platform",
    version="2.0.0"
)

# Get settings
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://localhost:3000",
        "https://ia-agent-aguf.onrender.com",
        "https://ia-agent-1.onrender.com",
        "https://ia-agent-wine.vercel.app",
        "https://ia-agent-mvk1.vercel.app",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "https://*.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
websocket_manager = WebSocketManager()
conversation_service = ConversationService()
ai_service = AIService()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(portfolio.router, prefix="/api", tags=["portfolio"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(kite.router, prefix="/api/kite", tags=["kite-connect"])
app.include_router(upload.router, prefix="/api", tags=["uploads"])
app.include_router(ai_insights.router, prefix="/api", tags=["ai-insights"])
app.include_router(search.router, prefix="/api", tags=["search"])

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

# Mount static files
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "message": "AI Wealth Advisor Backend API",
        "version": "2.0.0",
        "framework": "FastAPI",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(settings.openai_api_key),
        "kite_configured": bool(settings.kite_api_key),
        "serper_configured": bool(settings.serper_api_key)
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time chat"""
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process chat message
            if data.get("type") == "chat_message":
                response = await ai_service.process_chat_message(
                    message=data.get("message"),
                    user_id=data.get("userId"),
                    conversation_id=data.get("conversationId"),
                    context=data.get("context")
                )
                
                # Send response back to client
                await websocket_manager.send_personal_message(
                    message={
                        "type": "chat_response",
                        "data": response
                    },
                    client_id=client_id
                )
            
            # Process insight context message
            elif data.get("type") == "insight_context_message":
                response = await ai_service.process_insight_context_message(
                    message=data.get("message"),
                    user_id=data.get("userId"),
                    conversation_id=data.get("conversationId"),
                    context=data.get("context")
                )
                
                # Send response back to client
                await websocket_manager.send_personal_message(
                    message={
                        "type": "chat_response",
                        "data": response
                    },
                    client_id=client_id
                )
            
            # Handle conversation cleared event
            elif data.get("type") == "conversation_cleared":
                conversation_id = data.get("conversationId")
                await conversation_service.clear_conversation(conversation_id)
                logger.info(f"Conversation {conversation_id} cleared for client {client_id}")
    
    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        websocket_manager.disconnect(client_id)

@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("AI Wealth Advisor Backend starting up...")
    logger.info(f"OpenAI API configured: {bool(settings.openai_api_key)}")
    logger.info(f"Kite Connect configured: {bool(settings.kite_api_key)}")
    logger.info(f"Web search configured: {bool(settings.serper_api_key)}")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("AI Wealth Advisor Backend shutting down...")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3001)),
        reload=os.getenv("NODE_ENV") == "development",
        log_level="info"
    )