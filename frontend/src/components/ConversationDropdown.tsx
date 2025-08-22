import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MessageCircle, Plus } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  archived: boolean;
}

interface ConversationDropdownProps {
  currentConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  userId?: string;
}

const ConversationDropdown: React.FC<ConversationDropdownProps> = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  userId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load conversations on component mount and when userId changes
  useEffect(() => {
    loadConversations();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConversations(3, 0, userId || 'demo-user') as Conversation[];
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCurrentConversationTitle = () => {
    if (!currentConversationId) return 'New Chat';
    const current = conversations.find(c => c.id === currentConversationId);
    return current ? current.title : 'New Chat';
  };

  const handleConversationSelect = (conversationId: string) => {
    onSelectConversation(conversationId);
    setIsOpen(false);
  };

  const handleNewChat = () => {
    onNewConversation();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-sm text-white transition-all duration-200 backdrop-blur-sm"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <MessageCircle size={16} className="text-pink-400 flex-shrink-0" />
          <span className="truncate">{getCurrentConversationTitle()}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-pink-500/20 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* New Chat Option */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white hover:bg-pink-500/20 transition-colors border-b border-white/10"
          >
            <Plus size={16} className="text-pink-400" />
            <span>New Chat</span>
          </button>

          {/* Recent Conversations */}
          {loading ? (
            <div className="px-3 py-4 text-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-xs text-gray-400">Loading...</p>
            </div>
          ) : conversations.length > 0 ? (
            <div className="max-h-48 overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`
                    w-full flex flex-col px-3 py-2 text-sm text-left hover:bg-white/10 transition-colors
                    ${conversation.id === currentConversationId ? 'bg-pink-500/20 text-pink-200' : 'text-white'}
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate font-medium">{conversation.title}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {conversation.messageCount} messages
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-gray-400">No recent chats</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationDropdown;