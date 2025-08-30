"""
Conversation management service for chat history and context
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from models.chat import Conversation, ConversationSummary, ChatMessage

logger = logging.getLogger(__name__)


class ConversationService:
    def __init__(self):
        self.conversations_dir = "data/conversations"
        self.index_file = os.path.join(self.conversations_dir, "index.json")
        
        # Ensure directories exist
        os.makedirs(self.conversations_dir, exist_ok=True)
        
        # Create index file if it doesn't exist
        if not os.path.exists(self.index_file):
            with open(self.index_file, 'w') as f:
                json.dump({}, f)
    
    def _load_index(self) -> Dict[str, Any]:
        """Load conversation index"""
        try:
            with open(self.index_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_index(self, index: Dict[str, Any]):
        """Save conversation index"""
        with open(self.index_file, 'w') as f:
            json.dump(index, f, indent=2, default=str)
    
    def _generate_conversation_id(self) -> str:
        """Generate unique conversation ID"""
        timestamp = int(datetime.now().timestamp() * 1000)
        random_suffix = str(uuid.uuid4())[:8]
        return f"conv_{timestamp}_{random_suffix}"
    
    def _generate_message_id(self) -> str:
        """Generate unique message ID"""
        return str(uuid.uuid4())
    
    async def create_conversation(self, user_id: str, title: Optional[str] = None) -> str:
        """Create new conversation"""
        conversation_id = self._generate_conversation_id()
        
        if not title:
            title = f"Conversation {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        conversation = {
            "id": conversation_id,
            "title": title,
            "user_id": user_id,
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "archived": False
        }
        
        # Save conversation file
        conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
        with open(conversation_file, 'w') as f:
            json.dump(conversation, f, indent=2, default=str)
        
        # Update index
        index = self._load_index()
        index[conversation_id] = {
            "title": title,
            "user_id": user_id,
            "created_at": conversation["created_at"],
            "updated_at": conversation["updated_at"],
            "message_count": 0,
            "archived": False
        }
        self._save_index(index)
        
        logger.info(f"Created new conversation: {conversation_id}")
        return conversation_id
    
    async def add_message(self, conversation_id: str, content: str, is_bot: bool, user_id: str):
        """Add message to conversation"""
        
        # Handle None conversation_id
        if not conversation_id:
            # For None conversation_id, just skip conversation saving
            return
        
        # Load conversation
        conversation = await self.load_conversation(conversation_id)
        if not conversation:
            # Create new conversation if it doesn't exist
            new_conversation_id = await self.create_conversation(user_id, "New Chat")
            conversation = await self.load_conversation(new_conversation_id)
        
        # Final safety check
        if not conversation:
            logger.error(f"Failed to load or create conversation for ID: {conversation_id}")
            return
        
        message = {
            "id": self._generate_message_id(),
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "is_bot": is_bot,
            "user_id": user_id,
            "conversation_id": conversation_id
        }
        
        conversation["messages"].append(message)
        conversation["updated_at"] = datetime.now().isoformat()
        
        # Save updated conversation
        conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
        with open(conversation_file, 'w') as f:
            json.dump(conversation, f, indent=2, default=str)
        
        # Update index
        index = self._load_index()
        if conversation_id in index:
            index[conversation_id]["updated_at"] = conversation["updated_at"]
            index[conversation_id]["message_count"] = len(conversation["messages"])
            
            # Update title if it's the first user message
            if not is_bot and len(conversation["messages"]) == 1:
                # Use first 50 characters of message as title
                title = content[:50] + "..." if len(content) > 50 else content
                index[conversation_id]["title"] = title
                conversation["title"] = title
                
                # Save conversation again with updated title
                with open(conversation_file, 'w') as f:
                    json.dump(conversation, f, indent=2, default=str)
        
        self._save_index(index)
        
        logger.info(f"Added message to conversation {conversation_id}")
    
    async def load_conversation(self, conversation_id: str) -> Optional[Dict[str, Any]]:
        """Load conversation by ID"""
        conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
        
        if not os.path.exists(conversation_file):
            return None
        
        try:
            with open(conversation_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
    
    async def get_conversations(self, user_id: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Get conversations for user"""
        index = self._load_index()
        
        # Filter conversations for user
        user_conversations = []
        for conv_id, conv_info in index.items():
            if conv_info.get("user_id") == user_id and not conv_info.get("archived", False):
                summary = {
                    "id": conv_id,
                    "title": conv_info.get("title", ""),
                    "message_count": conv_info.get("message_count", 0),
                    "created_at": conv_info.get("created_at"),
                    "updated_at": conv_info.get("updated_at"),
                    "archived": conv_info.get("archived", False)
                }
                user_conversations.append(summary)
        
        # Sort by updated_at (most recent first)
        user_conversations.sort(key=lambda x: x["updated_at"], reverse=True)
        
        # Apply pagination
        paginated_conversations = user_conversations[offset:offset + limit]
        
        return {
            "conversations": paginated_conversations,
            "total": len(user_conversations),
            "limit": limit,
            "offset": offset
        }
    
    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete conversation"""
        conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
        
        if not os.path.exists(conversation_file):
            return False
        
        try:
            # Remove conversation file
            os.remove(conversation_file)
            
            # Remove from index
            index = self._load_index()
            if conversation_id in index:
                del index[conversation_id]
                self._save_index(index)
            
            logger.info(f"Deleted conversation: {conversation_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting conversation {conversation_id}: {str(e)}")
            return False
    
    async def archive_conversation(self, conversation_id: str) -> bool:
        """Archive conversation"""
        conversation = await self.load_conversation(conversation_id)
        if not conversation:
            return False
        
        try:
            # Update conversation
            conversation["archived"] = True
            conversation["updated_at"] = datetime.now().isoformat()
            
            # Save conversation
            conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
            with open(conversation_file, 'w') as f:
                json.dump(conversation, f, indent=2, default=str)
            
            # Update index
            index = self._load_index()
            if conversation_id in index:
                index[conversation_id]["archived"] = True
                index[conversation_id]["updated_at"] = conversation["updated_at"]
                self._save_index(index)
            
            logger.info(f"Archived conversation: {conversation_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error archiving conversation {conversation_id}: {str(e)}")
            return False
    
    async def rename_conversation(self, conversation_id: str, new_title: str) -> bool:
        """Rename conversation"""
        conversation = await self.load_conversation(conversation_id)
        if not conversation:
            return False
        
        try:
            # Update conversation
            conversation["title"] = new_title
            conversation["updated_at"] = datetime.now().isoformat()
            
            # Save conversation
            conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
            with open(conversation_file, 'w') as f:
                json.dump(conversation, f, indent=2, default=str)
            
            # Update index
            index = self._load_index()
            if conversation_id in index:
                index[conversation_id]["title"] = new_title
                index[conversation_id]["updated_at"] = conversation["updated_at"]
                self._save_index(index)
            
            logger.info(f"Renamed conversation {conversation_id} to: {new_title}")
            return True
        
        except Exception as e:
            logger.error(f"Error renaming conversation {conversation_id}: {str(e)}")
            return False
    
    async def search_conversations(self, query: str, user_id: str) -> List[Dict[str, Any]]:
        """Search conversations by content"""
        index = self._load_index()
        results = []
        
        query_lower = query.lower()
        
        for conv_id, conv_info in index.items():
            if conv_info.get("user_id") != user_id:
                continue
            
            # Check if query matches title
            title_match = query_lower in conv_info.get("title", "").lower()
            
            # Load conversation and search messages
            conversation = await self.load_conversation(conv_id)
            message_matches = []
            
            if conversation:
                for message in conversation.get("messages", []):
                    if query_lower in message.get("content", "").lower():
                        message_matches.append({
                            "message_id": message.get("id"),
                            "content": message.get("content", "")[:100] + "...",
                            "timestamp": message.get("timestamp")
                        })
            
            if title_match or message_matches:
                result = {
                    "conversation_id": conv_id,
                    "title": conv_info.get("title", ""),
                    "created_at": conv_info.get("created_at"),
                    "updated_at": conv_info.get("updated_at"),
                    "title_match": title_match,
                    "message_matches": message_matches[:3]  # Limit to 3 matches
                }
                results.append(result)
        
        # Sort by relevance (title matches first, then by update time)
        results.sort(key=lambda x: (not x["title_match"], x["updated_at"]), reverse=True)
        
        return results[:10]  # Return top 10 results
    
    async def get_stats(self, user_id: str) -> Dict[str, Any]:
        """Get conversation statistics for user"""
        index = self._load_index()
        
        total_conversations = 0
        total_messages = 0
        archived_conversations = 0
        
        for conv_id, conv_info in index.items():
            if conv_info.get("user_id") == user_id:
                total_conversations += 1
                total_messages += conv_info.get("message_count", 0)
                
                if conv_info.get("archived", False):
                    archived_conversations += 1
        
        return {
            "total_conversations": total_conversations,
            "active_conversations": total_conversations - archived_conversations,
            "archived_conversations": archived_conversations,
            "total_messages": total_messages,
            "average_messages_per_conversation": total_messages / max(total_conversations, 1)
        }
    
    async def clear_conversation(self, conversation_id: str):
        """Clear conversation messages (but keep the conversation)"""
        conversation = await self.load_conversation(conversation_id)
        if not conversation:
            return
        
        try:
            # Clear messages
            conversation["messages"] = []
            conversation["updated_at"] = datetime.now().isoformat()
            
            # Save conversation
            conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
            with open(conversation_file, 'w') as f:
                json.dump(conversation, f, indent=2, default=str)
            
            # Update index
            index = self._load_index()
            if conversation_id in index:
                index[conversation_id]["message_count"] = 0
                index[conversation_id]["updated_at"] = conversation["updated_at"]
                self._save_index(index)
            
            logger.info(f"Cleared messages from conversation: {conversation_id}")
        
        except Exception as e:
            logger.error(f"Error clearing conversation {conversation_id}: {str(e)}")
    
    def build_conversation_context(self, conversation_id: str) -> str:
        """Build comprehensive conversation context from message history"""
        try:
            # Load conversation
            conversation_file = os.path.join(self.conversations_dir, f"{conversation_id}.json")
            if not os.path.exists(conversation_file):
                return ""
            
            with open(conversation_file, 'r') as f:
                conversation = json.load(f)
            
            messages = conversation.get("messages", [])
            if not messages:
                return ""
            
            # Build context from last 15 messages (more comprehensive)
            recent_messages = messages[-15:]
            context_lines = []
            
            # Track conversation themes and topics
            topics_mentioned = set()
            user_preferences = []
            previous_recommendations = []
            
            for msg in recent_messages:
                role = "User" if not msg["is_bot"] else "Assistant"
                content = msg["content"]
                timestamp = msg.get("timestamp", "")
                
                # Extract key topics and preferences
                if not msg["is_bot"]:  # User message
                    # Look for investment preferences
                    if any(keyword in content.lower() for keyword in ['prefer', 'like', 'want', 'interested']):
                        user_preferences.append(content[:150])
                    
                    # Track topics mentioned
                    investment_terms = ['stock', 'mutual fund', 'sip', 'goal', 'portfolio', 'risk', 'return', 'investment', 'money', 'finance']
                    for term in investment_terms:
                        if term in content.lower():
                            topics_mentioned.add(term)
                else:  # Assistant message
                    # Extract recommendations given
                    if any(keyword in content.lower() for keyword in ['recommend', 'suggest', 'consider', 'advice', 'should']):
                        previous_recommendations.append(content[:200])
                
                # Truncate content for context
                display_content = content[:300]
                if len(content) > 300:
                    display_content += "..."
                
                context_lines.append(f"{role}: {display_content}")
            
            # Build comprehensive context
            context = "\n\nRECENT CONVERSATION CONTEXT:"
            
            if topics_mentioned:
                context += f"\nTopics discussed: {', '.join(list(topics_mentioned)[:10])}"
            
            if user_preferences:
                context += f"\nUser preferences noted: {'; '.join(user_preferences[-3:])}"  # Last 3 preferences
            
            if previous_recommendations:
                context += f"\nPrevious advice given: {'; '.join(previous_recommendations[-2:])}"  # Last 2 recommendations
            
            context += "\n\nMessage History:\n" + "\n".join(context_lines[-8:])  # Last 8 messages
            
            context += "\n\nIMPORTANT: Build upon this conversation history. Reference previous discussions, acknowledge user's stated preferences, and provide continuity in your advice. If the user asks follow-up questions, connect them to the previous context."
            
            return context
            
        except Exception as e:
            logger.error(f"Error building conversation context: {str(e)}")
            return ""