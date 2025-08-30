"""
Chat and conversation API endpoints
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query

from models.chat import ChatRequest, ChatResponse
from services.conversation_service import ConversationService
from services.ai_service import AIService

router = APIRouter()
conversation_service = ConversationService()
ai_service = AIService()


@router.post("/chat")
async def process_chat_message(chat_request: ChatRequest):
    """Process chat message (REST endpoint for non-WebSocket clients)"""
    try:
        response = await ai_service.process_chat_message(
            message=chat_request.message,
            user_id=chat_request.user_id,
            conversation_id=chat_request.conversation_id,
            context=chat_request.context
        )
        
        return {
            "success": True,
            "data": response
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": f"Failed to process chat message: {str(e)}",
                "code": "PROCESSING_ERROR"
            }
        )


@router.get("/conversations")
async def get_conversations(
    limit: int = Query(50),
    offset: int = Query(0),
    user_id: str = Query("demo-user")
):
    """Get conversations for user"""
    try:
        conversations = await conversation_service.get_conversations(user_id, limit, offset)
        return conversations
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to retrieve conversations"}
        )


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get specific conversation"""
    try:
        conversation = await conversation_service.load_conversation(conversation_id)
        
        if conversation:
            return conversation
        else:
            raise HTTPException(
                status_code=404,
                detail={"error": "Conversation not found"}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to retrieve conversation"}
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete conversation"""
    try:
        success = await conversation_service.delete_conversation(conversation_id)
        
        if success:
            return {"success": True}
        else:
            raise HTTPException(
                status_code=404,
                detail={"error": "Conversation not found"}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to delete conversation"}
        )


@router.put("/conversations/{conversation_id}/title")
async def rename_conversation(conversation_id: str, request: Dict[str, Any]):
    """Rename conversation"""
    try:
        title = request.get("title")
        if not title:
            raise HTTPException(
                status_code=400,
                detail={"error": "Title is required"}
            )
        
        success = await conversation_service.rename_conversation(conversation_id, title)
        
        if success:
            return {"success": True}
        else:
            raise HTTPException(
                status_code=404,
                detail={"error": "Conversation not found"}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to rename conversation"}
        )


@router.put("/conversations/{conversation_id}/archive")
async def archive_conversation(conversation_id: str):
    """Archive conversation"""
    try:
        success = await conversation_service.archive_conversation(conversation_id)
        
        if success:
            return {"success": True}
        else:
            raise HTTPException(
                status_code=404,
                detail={"error": "Conversation not found"}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to archive conversation"}
        )


@router.get("/conversations/search/{query}")
async def search_conversations(query: str, user_id: str = Query("demo-user")):
    """Search conversations"""
    try:
        results = await conversation_service.search_conversations(query, user_id)
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to search conversations"}
        )


@router.get("/conversations/stats")
async def get_conversation_stats(user_id: str = Query("demo-user")):
    """Get conversation statistics"""
    try:
        stats = await conversation_service.get_stats(user_id)
        return stats
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get stats"}
        )