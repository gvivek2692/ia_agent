"""
WebSocket connection manager for real-time chat
"""

import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self):
        # Store active WebSocket connections
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept WebSocket connection and store it"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected to WebSocket")
    
    def disconnect(self, client_id: str):
        """Remove WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected from WebSocket")
    
    async def send_personal_message(self, message: Dict, client_id: str):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                websocket = self.active_connections[client_id]
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to client {client_id}: {str(e)}")
                # Remove dead connection
                self.disconnect(client_id)
    
    async def broadcast(self, message: Dict):
        """Broadcast message to all connected clients"""
        dead_connections = []
        
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client {client_id}: {str(e)}")
                dead_connections.append(client_id)
        
        # Clean up dead connections
        for client_id in dead_connections:
            self.disconnect(client_id)
    
    def get_connected_clients(self) -> List[str]:
        """Get list of connected client IDs"""
        return list(self.active_connections.keys())
    
    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)