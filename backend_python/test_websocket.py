#!/usr/bin/env python3
"""
Simple WebSocket test for the chat functionality
"""

import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:3001/ws/test-client-123"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            
            # Send a test chat message
            message = {
                "type": "chat_message",
                "message": "Hello! How is my portfolio performing?",
                "userId": "fbee56e6-9462-4d00-8d1d-bdde5b707da3",
                "conversationId": "test-conv-123",
                "context": None
            }
            
            print("Sending message:", message)
            await websocket.send(json.dumps(message))
            
            # Wait for response
            print("Waiting for response...")
            response = await websocket.recv()
            data = json.loads(response)
            
            print("Received response:")
            print(json.dumps(data, indent=2))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())