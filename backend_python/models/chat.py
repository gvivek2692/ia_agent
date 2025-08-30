"""
Chat and conversation data models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class ChatMessage(BaseModel):
    id: str
    content: str
    timestamp: datetime
    is_bot: bool
    user_id: Optional[str] = None
    conversation_id: str


class ConversationContext(BaseModel):
    user_id: Optional[str] = None
    portfolio_context: Optional[Dict[str, Any]] = None
    conversation_history: List[ChatMessage] = []
    search_results: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    id: str
    message: str
    timestamp: datetime
    is_bot: bool = True
    sources: Optional[List[Dict[str, str]]] = None


class Conversation(BaseModel):
    id: str
    title: str
    user_id: str
    messages: List[ChatMessage] = []
    created_at: datetime
    updated_at: datetime
    archived: bool = False


class ConversationSummary(BaseModel):
    id: str
    title: str
    last_message: Optional[str] = None
    message_count: int
    created_at: datetime
    updated_at: datetime
    archived: bool = False


class WebSearchResult(BaseModel):
    title: str
    link: str
    snippet: str
    date: Optional[str] = None


class WebSearchResponse(BaseModel):
    query: str
    results: List[WebSearchResult]
    sources: List[Dict[str, str]]
    summary: Optional[str] = None