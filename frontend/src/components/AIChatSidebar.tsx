import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import ConversationDropdown from './ConversationDropdown';
import ChatInterface from './ChatInterface';

interface AIChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userId?: string;
  userName?: string;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onToggle,
  userId,
  userName
}) => {
  const [currentConversationId, setCurrentConversationId] = useState<string>('');

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setCurrentConversationId('');
  };

  const handleConversationChange = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
          style={{ zIndex: 'var(--z-overlay)' }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed top-0 left-0 h-full bg-black/80 backdrop-blur-xl border-r border-gold-500/20 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-[420px] lg:w-[500px]
        `}
        style={{ zIndex: 'var(--z-sidebar)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gold-500/20 bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} className="text-gold-400" />
            <h2 className="text-lg font-semibold text-white">AI Chat</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-2 text-gray-300 hover:text-gold-300 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            title="Close AI Chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Conversation Dropdown */}
        <div className="p-4 border-b border-gold-500/10 flex-shrink-0">
          <ConversationDropdown
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            userId={userId}
          />
        </div>

        {/* Chat Interface Container */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0">
            <ChatInterface
              selectedConversationId={currentConversationId}
              onConversationChange={handleConversationChange}
              userId={userId}
              userName={userName}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatSidebar;