import React, { useState } from 'react';
import { apiService } from '../services/apiService';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-white p-3 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
            <div className="text-2xl">💰</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wealth Manager AI</h1>
          <p className="text-gray-600">Your personal financial planning assistant</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email or username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Users Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Try Demo Accounts</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDemoLogin('priya.sharma@email.com')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">Priya Sharma</div>
                <div className="text-xs text-gray-600">Software Engineer • Conservative Investor</div>
              </button>

              <button
                onClick={() => handleDemoLogin('rajesh.kumar@email.com')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">Rajesh Kumar</div>
                <div className="text-xs text-gray-600">Business Owner • Aggressive Investor</div>
              </button>

              <button
                onClick={() => handleDemoLogin('anita.desai@email.com')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">Dr. Anita Desai</div>
                <div className="text-xs text-gray-600">Medical Doctor • Moderate Investor</div>
              </button>

              <button
                onClick={() => handleDemoLogin('arjun.singh@email.com')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">Arjun Singh</div>
                <div className="text-xs text-gray-600">Software Developer • Beginner Investor</div>
              </button>

              <button
                onClick={() => handleDemoLogin('meera.patel@email.com')}
                disabled={isLoading}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">Meera Patel</div>
                <div className="text-xs text-gray-600">Senior Manager • Balanced Investor</div>
              </button>
            </div>

            <button
              onClick={onShowUserList}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Demo Users →
            </button>
          </div>

          {/* Upload Statement Section */}
          {onShowUpload && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">New User?</h3>
              <button
                onClick={onShowUpload}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                📊 Upload MF Statement & Create Account
              </button>
              <p className="text-xs text-gray-600 text-center mt-2">
                Upload your mutual fund statement to create a personalized account
              </p>
            </div>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Demo Mode:</strong> All users use password "demo123". 
              Each user has different investment profiles and 3 months of transaction history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;