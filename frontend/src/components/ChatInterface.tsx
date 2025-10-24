import React, { useState, useEffect, useRef, useCallback } from 'react';
import MessageRenderer from './MessageRenderer';
import { config } from '../config/environment';
import { apiService } from '../services/apiService';
import { InsightContext } from '../types/insight';
import { formatInsightContextMessage } from '../utils/insightContext';

interface Message {
  id: number;
  message: string;
  timestamp: string;
  isBot: boolean;
}

interface ConversationMessage {
  id: string;
  content: string;
  timestamp: string;
  isBot: boolean;
}

interface ConversationData {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  tags: string[];
  archived: boolean;
  messages: ConversationMessage[];
}

interface ChatInterfaceProps {
  selectedConversationId?: string;
  onConversationChange?: (conversationId: string) => void;
  userId?: string;
  userName?: string;
  initialContext?: InsightContext;
}

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  userId?: string;
  conversationId?: string;
  context?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  selectedConversationId, 
  onConversationChange,
  userId,
  userName,
  initialContext
}) => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string>('');
  const [contextSent, setContextSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000;

  // Generate unique client ID for WebSocket connection
  const clientId = useRef<string>(`client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const initializeConversation = useCallback(() => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(newConversationId);
    onConversationChange?.(newConversationId);
    
    // Welcome message with enhanced formatting
    const welcomeMessage = {
      id: Date.now(),
      message: `# Welcome${userName ? ` ${userName}` : ''} to Wealth Manager AI! 👋

I'm your personal AI wealth advisor specializing in **Indian financial markets**. I can help you with:

- 📊 **Portfolio Analysis** - Review your current investments
- 🎯 **Goal Planning** - Create and track financial goals  
- 📈 **Investment Recommendations** - Suggest suitable options
- 💰 **Tax Optimization** - Maximize your savings
- 📉 **Market Insights** - Current trends and opportunities

${userId ? `I have access to your complete financial profile, portfolio, and transaction history.` : `I have access to demo financial data to showcase my capabilities.`}

**How can I assist you today?**`,
      timestamp: new Date().toISOString(),
      isBot: true
    };
    
    setMessages([welcomeMessage]);
    return newConversationId;
  }, [onConversationChange, userName, userId]);

  const initializeConversationWithContext = useCallback((context: InsightContext) => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(newConversationId);
    onConversationChange?.(newConversationId);
    
    // Create context-aware welcome message
    const contextMessage = {
      id: Date.now(),
      message: formatInsightContextMessage(context),
      timestamp: new Date().toISOString(),
      isBot: false
    };
    
    setMessages([contextMessage]);
    setContextSent(false); // Will be set to true when sent via WebSocket
    return newConversationId;
  }, [onConversationChange]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = await apiService.getConversation(conversationId) as ConversationData;
      if (conversation && conversation.messages) {
        const formattedMessages = conversation.messages.map((msg: ConversationMessage) => ({
          id: parseInt(msg.id.replace('msg_', '').split('_')[0]) || Date.now(),
          message: msg.content,
          timestamp: msg.timestamp,
          isBot: msg.isBot
        }));
        setMessages(formattedMessages);
        setConversationId(conversationId);
        onConversationChange?.(conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      // Fallback to new conversation if loading fails
      initializeConversation();
    }
  }, [onConversationChange, initializeConversation]);

  const connectWebSocket = useCallback(() => {
    try {
      // Convert HTTP URL to WebSocket URL
      const wsUrl = config.backendUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      const websocketUrl = `${wsUrl}/ws/${clientId.current}`;

      console.log('Connecting to WebSocket:', websocketUrl);

      const ws = new WebSocket(websocketUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError('');
        reconnectAttemptsRef.current = 0;

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);

          if (data.type === 'chat_response') {
            const responseMessage = data.data;
            if (responseMessage && responseMessage.message) {
              const message: Message = {
                id: Date.now(),
                message: responseMessage.message,
                timestamp: responseMessage.timestamp || new Date().toISOString(),
                isBot: true
              };
              setMessages(prev => [...prev, message]);
              setIsTyping(false);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setConnectionError(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectDelay * reconnectAttemptsRef.current);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Connection failed after maximum attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
        setIsConnected(false);
      };

      setWebsocket(ws);

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Component unmounting');
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  }, []);

  useEffect(() => {
    // Prevent duplicate connections in React StrictMode
    let cleanup: (() => void) | undefined;
    let isMounted = true;

    if (isMounted) {
      cleanup = connectWebSocket();

      // Initialize conversation based on context
      if (!selectedConversationId) {
        if (initialContext) {
          initializeConversationWithContext(initialContext);
        } else {
          initializeConversation();
        }
      }
    }

    return () => {
      isMounted = false;
      if (cleanup) {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send insight context when WebSocket is connected
  useEffect(() => {
    // Only send if we have valid insight context
    if (isConnected && initialContext && initialContext.insight && !contextSent && websocket && conversationId) {
      const contextMessage = formatInsightContextMessage(initialContext);

      // Send message in format expected by Python FastAPI backend
      const wsMessage: WebSocketMessage = {
        type: 'insight_context_message',
        message: contextMessage,
        userId: userId,
        conversationId: conversationId,
        context: {
          insightContext: initialContext,
          conversationHistory: messages.slice(-10),
          userName: userName
        }
      };

      try {
        websocket.send(JSON.stringify(wsMessage));
        setContextSent(true);
        setIsTyping(true);
        console.log('Insight context sent to AI', initialContext.insight.title);
      } catch (error) {
        console.error('Error sending insight context:', error);
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: '⚠️ Failed to send insight context. Please try again.',
          timestamp: new Date().toISOString(),
          isBot: true
        }]);
      }
    }
  }, [isConnected, initialContext, contextSent, websocket, conversationId, messages, userId, userName]);

  // Handle conversation switching from parent component
  useEffect(() => {
    if (selectedConversationId && selectedConversationId !== conversationId) {
      if (selectedConversationId === '') {
        // Start new conversation
        initializeConversation();
      } else {
        // Load existing conversation
        loadConversation(selectedConversationId);
      }
    }
  }, [selectedConversationId, conversationId, initializeConversation, loadConversation]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !websocket || !isConnected) return;

    const userMessage: Message = {
      id: Date.now(),
      message: inputMessage,
      timestamp: new Date().toISOString(),
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send message in format expected by Python FastAPI backend
    const wsMessage: WebSocketMessage = {
      type: 'chat_message',
      message: inputMessage,
      userId: userId,
      conversationId: conversationId,
      context: {
        conversationHistory: messages.slice(-10), // Send last 10 messages for context
        userName: userName
      }
    };
    
    try {
      websocket.send(JSON.stringify(wsMessage));
      setInputMessage('');
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        message: '⚠️ Failed to send message. Please try again.',
        timestamp: new Date().toISOString(),
        isBot: true
      }]);
    }
  };

  const clearConversation = () => {
    const newConversationId = initializeConversation();
    if (websocket && isConnected) {
      const wsMessage: WebSocketMessage = {
        type: 'conversation_cleared',
        conversationId: newConversationId
      };
      try {
        websocket.send(JSON.stringify(wsMessage));
      } catch (error) {
        console.error('Error sending conversation_cleared message:', error);
      }
    }
  };

  const startNewConversation = () => {
    const newConversationId = initializeConversation();
    if (websocket && isConnected) {
      const wsMessage: WebSocketMessage = {
        type: 'conversation_cleared',
        conversationId: newConversationId
      };
      try {
        websocket.send(JSON.stringify(wsMessage));
      } catch (error) {
        console.error('Error sending conversation_cleared message:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReconnect = () => {
    reconnectAttemptsRef.current = 0;
    setConnectionError('');
    connectWebSocket();
  };

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-gold-500/20 rounded-2xl shadow-2xl h-full flex flex-col">
      {/* Header with Connection Status and Controls */}
      <div className="border-b border-gold-500/20">
        <div className="flex items-center justify-between px-4 py-2">
          <div className={`text-sm flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? (
              <span className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Connected to WealthWise AI</span>
              </span>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span title={connectionError || 'Connecting...'}>
                  {connectionError ? 'Connection Failed' : 'Connecting...'}
                </span>
                {connectionError && !connectionError.includes('Reconnecting') && (
                  <button
                    onClick={handleReconnect}
                    className="ml-2 px-3 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-all duration-200 transform hover:scale-105"
                    title="Click to retry connection"
                  >
                    ↻ Retry
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={startNewConversation}
              disabled={!isConnected}
              className="px-4 py-2 text-xs bg-gradient-to-r from-gold-500/20 to-amber-500/20 text-gold-300 rounded-full hover:from-gold-500/30 hover:to-amber-500/30 border border-gold-500/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              title="Start New Conversation"
            >
              🔄 New Chat
            </button>
            <button
              onClick={clearConversation}
              disabled={!isConnected || messages.length <= 1}
              className="px-4 py-2 text-xs bg-gradient-to-r from-red-500/20 to-gold-500/20 text-red-300 rounded-full hover:from-red-500/30 hover:to-gold-500/30 border border-red-500/30 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              title="Clear Conversation"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        
        {/* Conversation Info */}
        <div className="px-4 py-2 bg-white/5 backdrop-blur-sm text-xs text-gray-300 border-t border-gold-500/10">
          <div className="flex justify-between items-center">
            <span>
              {userName ? `User: ${userName} • ` : ''}
              Conversation: {conversationId.slice(-8)} • Messages: {messages.length}
            </span>
            <span className="text-gold-400">Backend: Python FastAPI</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Model: GPT-4.1 Mini with Web Search</span>
            {userId && <span className="text-green-400">Personalized Mode: ON</span>}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-sm px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                message.isBot
                  ? 'bg-white/20 border border-white/30 shadow-lg'
                  : 'bg-gradient-to-r from-gold-600 to-amber-600 text-white shadow-lg hover:shadow-gold-500/25'
              }`}
            >
              <div className={message.isBot ? 'text-white' : 'text-white'}>
                <MessageRenderer content={message.message} isBot={message.isBot} />
              </div>
              <div className={`text-xs mt-3 ${
                message.isBot ? 'text-gray-400' : 'text-gold-100'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-300 ml-2">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t border-gold-500/20 p-4 bg-black/30 backdrop-blur-lg">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setInputMessage("Show me my portfolio summary")}
            className="px-4 py-2 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20 hover:text-gold-300 border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
          >
            📊 Portfolio Summary
          </button>
          <button
            onClick={() => setInputMessage("How are my financial goals progressing?")}
            className="px-4 py-2 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20 hover:text-gold-300 border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
          >
            🎯 Goal Progress
          </button>
          <button
            onClick={() => setInputMessage("Should I rebalance my investments?")}
            className="px-4 py-2 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20 hover:text-gold-300 border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
          >
            ⚖️ Rebalancing
          </button>
          <button
            onClick={() => setInputMessage("What's happening in the markets today?")}
            className="px-4 py-2 text-xs bg-white/10 text-gray-300 rounded-full hover:bg-white/20 hover:text-gold-300 border border-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
          >
            📈 Market Update
          </button>
        </div>

        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your investments, financial planning, or market insights..."
            className="flex-1 p-4 bg-white/10 border border-white/20 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500/50 transition-all text-white placeholder-gray-400 backdrop-blur-sm"
            rows={2}
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected || isTyping}
            className="px-8 py-4 bg-gradient-to-r from-gold-600 to-amber-600 text-white rounded-2xl hover:from-gold-500 hover:to-amber-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center transform hover:scale-105 shadow-lg hover:shadow-gold-500/25"
          >
            {isTyping ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;