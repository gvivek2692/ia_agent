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
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isOpen,
  onToggle,
  currentConversationId,
  onSelectConversation,
  onNewConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load conversations on component mount
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConversations() as Conversation[];
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80 lg:w-72
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onNewConversation}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="New Conversation"
            >
              ✏️
            </button>
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-2 text-sm">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <button
                onClick={onNewConversation}
                className="mt-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
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
                    group relative px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-2 transition-colors
                    ${conversation.id === currentConversationId 
                      ? 'bg-primary-50 border-primary-500' 
                      : 'border-transparent hover:border-gray-300'
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
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        autoFocus
                      />
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            conversation.id === currentConversationId ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            {conversation.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(conversation.updatedAt)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {conversation.messageCount} messages
                            </p>
                          </div>
                        </div>
                        
                        {/* Action buttons - show on hover */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(conversation);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                            title="Rename"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conversation.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationHistory;