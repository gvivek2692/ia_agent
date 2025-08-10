import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ConnectionTest from './components/ConnectionTest';
import ConversationHistory from './components/ConversationHistory';
import LoginForm from './components/LoginForm';
import UserList from './components/UserList';
import UserProfile from './components/UserProfile';
import UploadStatement from './components/UploadStatement';
import PortfolioDashboard from './components/PortfolioDashboard';
import { apiService } from './services/apiService';

interface User {
  id: string;
  name: string;
  email: string;
  profession: string;
  location: string;
  age: number;
  experience_level: string;
  risk_tolerance: string;
}

type AppView = 'login' | 'userList' | 'chat' | 'upload' | 'portfolio';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const savedSessionId = localStorage.getItem('wealth_advisor_session');
    const savedUser = localStorage.getItem('wealth_advisor_user');

    if (savedSessionId && savedUser) {
      try {
        const session = await apiService.getSession(savedSessionId) as any;
        if (session.success) {
          setCurrentUser(JSON.parse(savedUser));
          setSessionId(savedSessionId);
          setCurrentView('chat');
        } else {
          // Invalid session, clear storage
          localStorage.removeItem('wealth_advisor_session');
          localStorage.removeItem('wealth_advisor_user');
        }
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('wealth_advisor_session');
        localStorage.removeItem('wealth_advisor_user');
      }
    }
    
    setIsAuthChecking(false);
  };

  const handleLoginSuccess = (user: User, newSessionId: string) => {
    setCurrentUser(user);
    setSessionId(newSessionId);
    setCurrentView('chat');
    
    // Save to localStorage for persistence
    localStorage.setItem('wealth_advisor_session', newSessionId);
    localStorage.setItem('wealth_advisor_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionId('');
    setCurrentView('login');
    setCurrentConversationId('');
    setSidebarOpen(false);
    
    // Clear localStorage
    localStorage.removeItem('wealth_advisor_session');
    localStorage.removeItem('wealth_advisor_user');
  };

  const handleSelectUserFromList = async (email: string) => {
    try {
      const response = await apiService.login(email, 'demo123') as any;
      
      if (response.success) {
        handleLoginSuccess(response.user, response.sessionId);
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setCurrentView('login');
    }
  };

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

  const handleUploadSuccess = (result: any) => {
    // After successful upload, redirect to login to use the new account
    alert(`Account created successfully! You can now login with your username.`);
    setCurrentView('login');
  };

  // Show loading screen while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Wealth Manager AI...</p>
        </div>
      </div>
    );
  }

  // Show login form
  if (currentView === 'login') {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onShowUserList={() => setCurrentView('userList')}
        onShowUpload={() => setCurrentView('upload')}
      />
    );
  }

  // Show user list
  if (currentView === 'userList') {
    return (
      <UserList
        onSelectUser={handleSelectUserFromList}
        onBack={() => setCurrentView('login')}
      />
    );
  }

  // Show upload form
  if (currentView === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <button
              onClick={() => setCurrentView('login')}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              ← Back to Login
            </button>
          </div>
          <UploadStatement onSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  // Show main chat interface (authenticated)
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Conversation History Sidebar */}
      <ConversationHistory
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        userId={currentUser?.id}
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
                  <p className="text-sm text-gray-600 mt-1">Your personalized financial planning assistant</p>
                </div>
              </div>
              
              {/* Navigation Pills */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('chat')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setCurrentView('portfolio')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'portfolio'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  📊 Portfolio
                </button>
              </div>
              
              {/* User Profile Component */}
              {currentUser && (
                <UserProfile
                  user={currentUser}
                  sessionId={sessionId}
                  onLogout={handleLogout}
                />
              )}
            </div>
          </div>
        </header>
        
        <main className={`${currentView === 'portfolio' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
          {currentView === 'chat' && (
            <>
              {/* Connection Test - Remove this in production */}
              <div className="mb-6">
                <ConnectionTest />
              </div>
              
              <ChatInterface 
                selectedConversationId={currentConversationId}
                onConversationChange={setCurrentConversationId}
                userId={currentUser?.id}
                userName={currentUser?.name}
              />
            </>
          )}
          
          {currentView === 'portfolio' && (
            <PortfolioDashboard 
              userId={currentUser?.id}
              userName={currentUser?.name}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;