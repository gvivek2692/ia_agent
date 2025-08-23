import React, { useState, useEffect } from 'react';
import { MessageSquare, BarChart3, Brain } from 'lucide-react';
import LandingPage from './components/LandingPage';
import AIChatSidebar from './components/AIChatSidebar';
import LoginForm from './components/LoginForm';
import UserList from './components/UserList';
import UserProfile from './components/UserProfile';
import UploadStatement from './components/UploadStatement';
import PortfolioDashboard from './components/PortfolioDashboard';
import AIInsights from './components/AIInsights';
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

type AppView = 'landing' | 'login' | 'userList' | 'upload' | 'portfolio' | 'insights';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkKiteCallback();
    checkExistingSession();
  }, []);

  // Check if this is a Kite callback
  const checkKiteCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get('request_token');
    const status = urlParams.get('status');
    const action = urlParams.get('action');

    if (requestToken && status === 'success' && action === 'login') {
      console.log('Detected Kite callback with token:', requestToken);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Process the Kite authentication
      handleKiteCallback(requestToken);
    }
  };

  const handleKiteCallback = async (requestToken: string) => {
    try {
      setIsAuthChecking(true);
      
      // Send request token to backend for authentication
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/kite/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_token: requestToken
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Authentication failed');
      }

      if (data.success) {
        console.log('Kite authentication successful:', data.user);
        const sessionId = `kite-session-${data.user.kite_user_id}`;
        handleLoginSuccess(data.user, sessionId);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Kite callback error:', error);
      setCurrentView('landing');
    } finally {
      setIsAuthChecking(false);
    }
  };

  const checkExistingSession = async () => {
    const savedSessionId = localStorage.getItem('wealth_advisor_session');
    const savedUser = localStorage.getItem('wealth_advisor_user');

    if (savedSessionId && savedUser) {
      try {
        const session = await apiService.getSession(savedSessionId) as any;
        if (session.success) {
          setCurrentUser(JSON.parse(savedUser));
          setSessionId(savedSessionId);
          
          // Redirect all users to portfolio page
          setCurrentView('portfolio');
        } else {
          // Invalid session, clear storage and show landing page
          localStorage.removeItem('wealth_advisor_session');
          localStorage.removeItem('wealth_advisor_user');
          setCurrentView('landing');
        }
      } catch (error) {
        console.error('Session check error:', error);
        localStorage.removeItem('wealth_advisor_session');
        localStorage.removeItem('wealth_advisor_user');
        setCurrentView('landing');
      }
    } else {
      // No existing session, show landing page
      setCurrentView('landing');
    }
    
    setIsAuthChecking(false);
  };

  const handleLoginSuccess = (user: User, newSessionId: string) => {
    setCurrentUser(user);
    setSessionId(newSessionId);
    
    // Redirect all users to portfolio page
    setCurrentView('portfolio');
    
    // Save to localStorage for persistence
    localStorage.setItem('wealth_advisor_session', newSessionId);
    localStorage.setItem('wealth_advisor_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionId('');
    setCurrentView('landing');
    setAiChatOpen(false);
    
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
      setCurrentView('landing');
    }
  };

  const toggleAIChat = () => {
    setAiChatOpen(!aiChatOpen);
  };

  const handleUploadSuccess = async (result: any) => {
    try {
      if (result.success && result.userId) {
        // Automatically fetch the newly created user and log them in
        const response = await apiService.getUser(result.userId) as any;
        
        if (response.success && response.user) {
          // Auto-login the newly created user
          handleLoginSuccess(response.user, result.userId);
          
          // Set view to portfolio to show their uploaded data
          setCurrentView('portfolio');
          
          // Show success message
          alert(`Welcome ${response.user.user_profile?.name || 'User'}! Your portfolio has been created from your CAS statement.`);
        } else {
          // Fallback to manual login if auto-login fails
          alert(`Account created successfully! Please login with your username.`);
          setCurrentView('login');
        }
      } else {
        alert(`Account creation failed. Please try again.`);
        setCurrentView('upload');
      }
    } catch (error) {
      console.error('Auto-login error after upload:', error);
      // Fallback to manual login
      alert(`Account created successfully! Please login with your username.`);
      setCurrentView('login');
    }
  };

  // Show loading screen while checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading WealthWise AI...</p>
        </div>
      </div>
    );
  }

  // Show landing page
  if (currentView === 'landing') {
    return (
      <LandingPage onGetStarted={() => setCurrentView('login')} />
    );
  }

  // Show login form
  if (currentView === 'login') {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onShowUserList={() => setCurrentView('userList')}
        onShowUpload={() => setCurrentView('upload')}
        onBackToLanding={() => setCurrentView('landing')}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <button
              onClick={() => setCurrentView('login')}
              className="inline-flex items-center text-pink-400 hover:text-pink-300 font-medium mb-4 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-pink-600/10 to-rose-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-rose-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* AI Chat Sidebar */}
      <AIChatSidebar
        isOpen={aiChatOpen}
        onToggle={toggleAIChat}
        userId={currentUser?.id}
        userName={currentUser?.name}
      />

      <div className={`relative z-10 transition-all duration-300 ${aiChatOpen ? 'lg:ml-[500px]' : ''}`}>
        <header 
          className="bg-black/50 backdrop-blur-lg border-b border-pink-500/20 shadow-lg overflow-visible relative"
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-visible relative">
            <div className="flex items-center justify-between overflow-visible relative">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleAIChat}
                  className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                  title="Toggle AI Chat"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      WealthWise
                    </span>{' '}
                    AI
                  </h1>
                  <p className="text-sm text-gray-300 mt-1">Your intelligent financial health companion</p>
                </div>
              </div>
              
              {/* Navigation Pills */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('portfolio')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentView === 'portfolio'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Portfolio</span>
                  </span>
                </button>
                <button
                  onClick={() => setCurrentView('insights')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    currentView === 'insights'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>AI Insights</span>
                  </span>
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
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentView === 'portfolio' && (
            <PortfolioDashboard 
              userId={currentUser?.id}
              userName={currentUser?.name}
              onSessionExpired={handleLogout}
              onToggleAIChat={toggleAIChat}
            />
          )}
          
          {currentView === 'insights' && (
            <AIInsights 
              userId={currentUser?.id}
              userName={currentUser?.name}
              onSessionExpired={handleLogout}
              onToggleAIChat={toggleAIChat}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;