import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ConnectionTest from './components/ConnectionTest';
import ConversationHistory from './components/ConversationHistory';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');

  const handleNewConversation = () => {
    setCurrentConversationId('');
    setSidebarOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Conversation History Sidebar */}
      <ConversationHistory
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-xl"
                  title="Toggle Chat History"
                >
                  ☰
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Wealth Manager AI</h1>
                  <p className="text-sm text-gray-600 mt-1">Your personal financial planning assistant</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Connection Test - Remove this in production */}
          <div className="mb-6">
            <ConnectionTest />
          </div>
          
          <ChatInterface 
            selectedConversationId={currentConversationId}
            onConversationChange={setCurrentConversationId}
          />
        </main>
      </div>
    </div>
  );
}

export default App;