import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  archived: boolean;
}

interface ConversationHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
  currentConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  userId?: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isOpen,
  onToggle,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  userId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load conversations on component mount and when userId changes
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConversations(50, 0, userId || 'demo-user') as Conversation[];
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
    setLoading(false);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      await apiService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If deleting current conversation, start a new one
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    try {
      await apiService.renameConversation(conversationId, newTitle);
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, title: newTitle } : c
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const startEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-black/80 backdrop-blur-xl border-r border-pink-500/20 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/20 bg-black/20 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-white">Chat History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewConversation}
              className="p-2 text-gray-300 hover:text-pink-300 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              title="New Conversation"
            >
              ✏️
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-gray-300 hover:text-pink-300 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm lg:hidden"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-pink-500/10">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50 transition-all duration-300"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-300">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mx-auto"></div>
              <p className="mt-2 text-sm">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-300">
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <button
                onClick={onNewConversation}
                className="mt-4 px-6 py-3 text-sm bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25 backdrop-blur-sm"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            <div className="py-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`
                    group relative px-4 py-3 hover:bg-white/10 cursor-pointer border-l-2 transition-all duration-300 backdrop-blur-sm
                    ${conversation.id === currentConversationId 
                      ? 'bg-pink-500/20 border-pink-500 shadow-lg' 
                      : 'border-transparent hover:border-pink-500/30'
                    }
                  `}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  {editingId === conversation.id ? (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        onBlur={saveEdit}
                        className="flex-1 px-3 py-2 text-sm bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500/50"
                        autoFocus
                      />
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            conversation.id === currentConversationId ? 'text-pink-200' : 'text-white'
                          }`}>
                            {conversation.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400">
                              {formatDate(conversation.updatedAt)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {conversation.messageCount} messages
                            </p>
                          </div>
                        </div>
                        
                        {/* Action buttons - show on hover */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(conversation);
                            }}
                            className="p-1 text-gray-400 hover:text-pink-300 hover:bg-white/20 rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-500/20 bg-black/20 backdrop-blur-sm">
          <div className="text-xs text-gray-400">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationHistory;