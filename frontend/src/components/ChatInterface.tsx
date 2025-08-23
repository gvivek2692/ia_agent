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
    <div className="bg-transparent h-full flex flex-col">
      {/* Header with Connection Status and Controls - Enhanced */}
      <div className="border-b border-pink-400/30 bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className={`text-sm flex items-center font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Connected to WealthWise AI</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2" title={connectionError || 'Connecting...'}>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>{connectionError ? 'Connection Failed' : 'Connecting...'}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={startNewConversation}
              disabled={!isConnected}
              className="px-4 py-2 text-xs bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-200 rounded-xl hover:from-pink-500/40 hover:to-rose-500/40 border border-pink-400/40 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg shadow-pink-500/20 font-medium"
              title="Start New Conversation"
            >
              New Chat
            </button>
            <button
              onClick={clearConversation}
              disabled={!isConnected || messages.length <= 1}
              className="px-4 py-2 text-xs bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-200 rounded-xl hover:from-red-500/40 hover:to-pink-500/40 border border-red-400/40 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg shadow-red-500/20 font-medium"
              title="Clear Conversation"
            >
              Clear
            </button>
          </div>
        </div>
        
        {/* Conversation Info - Enhanced */}
        <div className="px-4 py-3 bg-gradient-to-r from-white/[0.03] to-white/[0.01] backdrop-blur-sm text-xs text-gray-300 border-t border-pink-400/20 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-200">
              {userName ? `User: ${userName} • ` : ''}
              Conversation: {conversationId.slice(-8)} • Messages: {messages.length}
            </span>
            <span className="text-pink-300 font-medium">Backend: {config.isDevelopment ? 'Local' : 'Render'}</span>
          </div>
          <div className="mt-1.5 flex justify-between items-center">
            <span className="text-gray-300">Model: GPT-4.1 Mini with Web Search</span>
            {userId && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-400 font-medium">Personalized Mode</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container - Enhanced with better background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-transparent via-white/[0.005] to-white/[0.02] relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-gradient-to-br from-pink-500/20 via-transparent to-rose-500/20 pointer-events-none"></div>
        <div className="relative z-10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${
                  message.isBot
                    ? 'bg-gradient-to-br from-white/25 via-white/20 to-white/15 border border-white/40 shadow-xl text-white ring-1 ring-pink-500/10'
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xl hover:shadow-pink-500/30 ring-1 ring-pink-400/20'
                }`}
              >
                <div className="relative">
                  <MessageRenderer content={message.message} isBot={message.isBot} />
                </div>
                <div className={`text-xs mt-3 ${
                  message.isBot ? 'text-gray-300' : 'text-pink-100/80'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isTyping && (
          <div className="relative z-10 flex justify-start">
            <div className="bg-gradient-to-br from-white/20 via-white/15 to-white/10 border border-white/30 px-6 py-4 rounded-2xl shadow-xl backdrop-blur-sm ring-1 ring-pink-500/10">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-200 ml-2 font-medium">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Enhanced */}
      <div className="border-t border-pink-400/30 p-4 bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-white/[0.05] backdrop-blur-lg shadow-lg shadow-black/10">
        {/* Quick Action Buttons - Enhanced without emojis */}
        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={() => setInputMessage("Show me my portfolio summary")}
            className="px-4 py-2.5 text-xs bg-slate-700/60 text-gray-200 rounded-xl hover:bg-slate-600/70 hover:text-white border border-slate-600/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
          >
            Portfolio Summary
          </button>
          <button
            onClick={() => setInputMessage("How are my financial goals progressing?")}
            className="px-4 py-2.5 text-xs bg-slate-700/60 text-gray-200 rounded-xl hover:bg-slate-600/70 hover:text-white border border-slate-600/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
          >
            Goal Progress
          </button>
          <button
            onClick={() => setInputMessage("Should I rebalance my investments?")}
            className="px-4 py-2.5 text-xs bg-slate-700/60 text-gray-200 rounded-xl hover:bg-slate-600/70 hover:text-white border border-slate-600/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
          >
            Rebalancing
          </button>
          <button
            onClick={() => setInputMessage("What's happening in the markets today?")}
            className="px-4 py-2.5 text-xs bg-slate-700/60 text-gray-200 rounded-xl hover:bg-slate-600/70 hover:text-white border border-slate-600/50 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
          >
            Market Update
          </button>
        </div>

        <div className="flex space-x-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your investments, financial planning, or market insights..."
            className="flex-1 p-4 bg-slate-800/80 border border-slate-600/50 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-400/70 focus:border-pink-400/70 focus:bg-slate-700/80 transition-all duration-300 text-white placeholder-slate-300 backdrop-blur-sm shadow-lg"
            rows={2}
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected || isTyping}
            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:from-pink-500 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center transform hover:scale-105 shadow-xl hover:shadow-pink-500/30 font-semibold"
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