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

      {/* Sidebar - Enhanced Glassmorphism Chat Pod */}
      <div 
        className={`
          fixed top-0 left-0 h-full transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          w-[420px] lg:w-[500px]
        `}
        style={{ zIndex: 'var(--z-sidebar)' }}
      >
        {/* Glassmorphism Background with Enhanced Visual Separation */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-gray-900/95 backdrop-blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-rose-500/5"></div>
        <div className="absolute inset-0 border-r-2 border-pink-400/30 shadow-2xl shadow-pink-500/20"></div>
        
        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Header - Enhanced with better visual hierarchy */}
          <div className="flex items-center justify-between p-4 border-b border-pink-400/30 bg-white/5 backdrop-blur-sm flex-shrink-0 shadow-lg shadow-black/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-lg border border-pink-400/20">
                <MessageSquare size={20} className="text-pink-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-sm">AI Chat</h2>
                <p className="text-xs text-pink-200/70">WealthWise Assistant</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-pink-500/20 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/10 hover:border-pink-400/30 shadow-md"
              title="Close AI Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Conversation Dropdown - Enhanced styling */}
          <div className="p-4 border-b border-pink-400/20 flex-shrink-0 bg-white/[0.02]">
            <ConversationDropdown
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              userId={userId}
            />
          </div>

          {/* Chat Interface Container - Enhanced with better visual separation */}
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 p-3">
              <div className="h-full rounded-2xl overflow-hidden border border-pink-400/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm shadow-inner">
                <ChatInterface
                  selectedConversationId={currentConversationId}
                  onConversationChange={handleConversationChange}
                  userId={userId}
                  userName={userName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatSidebar;