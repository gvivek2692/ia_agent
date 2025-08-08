import React, { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import MessageRenderer from './MessageRenderer';
import { config } from '../config/environment';
import { apiService } from '../services/apiService';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  selectedConversationId, 
  onConversationChange,
  userId,
  userName
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    console.log('Connecting to backend:', config.backendUrl);
    
    const newSocket = io(config.backendUrl, {
      transports: ['polling', 'websocket'], // Try polling first for better compatibility
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError('');
      console.log('Connected to server at:', config.backendUrl);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error to', config.backendUrl, ':', error);
      setConnectionError(`Failed to connect to ${config.backendUrl}: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError('');
    });

    newSocket.on('chat_response', (response: Message) => {
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error?.message || error);
      setIsTyping(false);
      // Optionally show user-friendly error message
      if (error?.message) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: `⚠️ Error: ${error.message}. Please try again.`,
          timestamp: new Date().toISOString(),
          isBot: true
        }]);
      }
    });

    // Initialize first conversation
    if (!selectedConversationId) {
      initializeConversation();
    }

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Only run once on mount

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!inputMessage.trim() || !socket || !isConnected) return;

    const userMessage: Message = {
      id: Date.now(),
      message: inputMessage,
      timestamp: new Date().toISOString(),
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send message with conversation context and user info
    socket.emit('chat_message', { 
      message: inputMessage,
      conversationId: conversationId,
      conversationHistory: messages.slice(-10), // Send last 10 messages for context
      userId: userId // Send userId for personalized responses
    });
    setInputMessage('');
  };

  const clearConversation = () => {
    const newConversationId = initializeConversation();
    if (socket) {
      socket.emit('conversation_cleared', { conversationId: newConversationId });
    }
  };

  const startNewConversation = () => {
    const newConversationId = initializeConversation();
    if (socket) {
      socket.emit('conversation_cleared', { conversationId: newConversationId });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-[700px] flex flex-col">
      {/* Header with Connection Status and Controls */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className={`text-sm flex items-center ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {isConnected ? (
              <span>🟢 Connected to Wealth Manager AI</span>
            ) : (
              <span title={connectionError || 'Connecting...'}>
                🔴 {connectionError ? 'Connection Failed' : 'Connecting...'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={startNewConversation}
              disabled={!isConnected}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start New Conversation"
            >
              🔄 New Chat
            </button>
            <button
              onClick={clearConversation}
              disabled={!isConnected || messages.length <= 1}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear Conversation"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
        
        {/* Conversation Info */}
        <div className="px-4 py-1 bg-gray-50 text-xs text-gray-600 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span>
              {userName ? `User: ${userName} • ` : ''}
              Conversation: {conversationId.slice(-8)} • Messages: {messages.length}
            </span>
            <span className="text-blue-600">Backend: {config.isDevelopment ? 'Local' : 'Render'}</span>
          </div>
          <div className="mt-0.5 flex justify-between">
            <span>Model: GPT-4.1 Mini with Web Search</span>
            {userId && <span className="text-green-600">Personalized Mode: ON</span>}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.isBot
                  ? 'bg-white border border-gray-200 shadow-sm'
                  : 'bg-primary-500 text-white shadow-sm'
              }`}
            >
              <div className={message.isBot ? 'text-gray-800' : 'text-white'}>
                <MessageRenderer content={message.message} isBot={message.isBot} />
              </div>
              <div className={`text-xs mt-2 ${
                message.isBot ? 'text-gray-500' : 'text-primary-100'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="border-t border-gray-200 p-4 bg-white">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setInputMessage("Show me my portfolio summary")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            📊 Portfolio Summary
          </button>
          <button
            onClick={() => setInputMessage("How are my financial goals progressing?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            🎯 Goal Progress
          </button>
          <button
            onClick={() => setInputMessage("Should I rebalance my investments?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            ⚖️ Rebalancing
          </button>
          <button
            onClick={() => setInputMessage("What's happening in the markets today?")}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            📈 Market Update
          </button>
        </div>

        <div className="flex space-x-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your investments, financial planning, or market insights..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            rows={2}
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected || isTyping}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
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