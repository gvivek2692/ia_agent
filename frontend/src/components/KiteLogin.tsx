import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Loader2, TrendingUp } from 'lucide-react';

interface KiteLoginProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const KiteLogin: React.FC<KiteLoginProps> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleKiteLogin = async () => {
    try {
      setIsLoading(true);
      
      // Get Kite login URL
      const response = await fetch(`${process.env.REACT_APP_API_URL}/kite/login`);
      
      if (!response.ok) {
        throw new Error('Failed to get Kite login URL');
      }
      
      const { loginUrl } = await response.json();
      
      // Redirect to Kite login in the same tab
      window.location.href = loginUrl;
      
    } catch (error) {
      console.error('Error initiating Kite login:', error);
      onError('Failed to initiate Kite login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <TrendingUp className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Connect with Kite</h2>
        <p className="text-sm text-gray-600 mt-2">
          Securely import your real portfolio from Zerodha Kite
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                What happens when you connect?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>We'll fetch your current stock and mutual fund holdings</li>
                  <li>Your portfolio will be analyzed for personalized insights</li>
                  <li>All AI features will work with your real data</li>
                  <li>Your login credentials are never stored</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleKiteLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-4 w-4 mr-2" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Authenticating...' : 'Login with Kite'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          {isLoading 
            ? 'Please complete authentication in the popup window' 
            : 'You\'ll be redirected to Zerodha Kite\'s secure login page'
          }
        </p>
      </div>
    </div>
  );
};

export default KiteLogin;