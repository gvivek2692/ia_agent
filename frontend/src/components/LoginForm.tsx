import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import KiteLogin from './KiteLogin';
import { User, Upload, LogIn, Shield, Zap } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: any, sessionId: string) => void;
  onShowUserList: () => void;
  onShowUpload?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onShowUserList, onShowUpload }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKiteLogin, setShowKiteLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'demo'>('signup');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(email, password) as any;
      
      if (response.success) {
        onLoginSuccess(response.user, response.sessionId);
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
    
    // Auto-submit after setting credentials
    setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await apiService.login(demoEmail, 'demo123') as any;
        
        if (response.success) {
          onLoginSuccess(response.user, response.sessionId);
        } else {
          setError(response.error || 'Login failed');
        }
      } catch (error) {
        console.error('Demo login error:', error);
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  const handleKiteSuccess = (user: any) => {
    console.log('Kite login successful:', user);
    // For Kite users, we'll use a different session ID format
    const sessionId = `kite-session-${user.kite_user_id}`;
    onLoginSuccess(user, sessionId);
  };

  const handleKiteError = (error: string) => {
    setError(error);
    setShowKiteLogin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            WealthWise
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Your intelligent companion for smart financial decisions and portfolio management
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-blue-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI-powered investment insights</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <Shield className="w-6 h-6" />
              <span>Goal-based financial planning</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <Zap className="w-6 h-6" />
              <span>Improve overall financial health</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">WealthWise</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'demo'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Try Demo
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Sign Up Tab */}
          {activeTab === 'signup' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
                <p className="text-gray-600">Choose how you'd like to create your account</p>
              </div>

              {/* Kite Connect Option */}
              <button
                onClick={() => setShowKiteLogin(true)}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 group"
              >
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <img src="/zerodha-kite-seeklogo.png" alt="Kite Logo" className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 group-hover:text-orange-700">Connect with Kite</div>
                  <div className="text-sm text-gray-600">Import your real portfolio from Zerodha</div>
                </div>
              </button>

              {/* Upload Statement Option */}
              {onShowUpload && (
                <button
                  onClick={onShowUpload}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-700">Upload MF Statement</div>
                    <div className="text-sm text-gray-600">Create account with your mutual fund data</div>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Sign In Tab */}
          {activeTab === 'signin' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email or Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email or username"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <LogIn className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Demo Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Try Demo</h2>
                <p className="text-gray-600">Explore with sample investment portfolios</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleDemoLogin('priya.sharma@email.com')}
                  disabled={isLoading}
                  className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">Priya Sharma</div>
                    <div className="text-sm text-gray-600">Software Engineer • Conservative Portfolio</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin('rajesh.kumar@email.com')}
                  disabled={isLoading}
                  className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">Rajesh Kumar</div>
                    <div className="text-sm text-gray-600">Business Owner • Aggressive Portfolio</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDemoLogin('anita.desai@email.com')}
                  disabled={isLoading}
                  className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">Dr. Anita Desai</div>
                    <div className="text-sm text-gray-600">Medical Doctor • Moderate Portfolio</div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDemoLogin('arjun.singh@email.com')}
                    disabled={isLoading}
                    className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                      A
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-xs text-gray-900 group-hover:text-blue-700">Arjun Singh</div>
                      <div className="text-xs text-gray-600">Developer</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDemoLogin('meera.patel@email.com')}
                    disabled={isLoading}
                    className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                      M
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-xs text-gray-900 group-hover:text-blue-700">Meera Patel</div>
                      <div className="text-xs text-gray-600">Manager</div>
                    </div>
                  </button>
                </div>
              </div>


              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Demo Info:</strong> All demo accounts use password "demo123". 
                  Each profile features different investment strategies and portfolio compositions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kite Login Modal */}
      {showKiteLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Connect with Kite</h3>
              <button
                onClick={() => {
                  setShowKiteLogin(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <KiteLogin
                onSuccess={handleKiteSuccess}
                onError={handleKiteError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;