import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email: string;
  profession: string;
  location: string;
}

interface UserListProps {
  onSelectUser: (email: string) => void;
  onBack: () => void;
}

const UserList: React.FC<UserListProps> = ({ onSelectUser, onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers() as any;
      
      if (response.success) {
        setUsers(response.users);
      } else {
        setError('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getUserIcon = (profession: string) => {
    switch (profession.toLowerCase()) {
      case 'software engineer':
      case 'software developer':
        return '👨‍💻';
      case 'business owner':
        return '👨‍💼';
      case 'medical doctor':
        return '👩‍⚕️';
      case 'senior manager':
        return '👩‍💼';
      default:
        return '👤';
    }
  };

  const getRiskProfile = (email: string) => {
    // Based on our user data
    const profiles: Record<string, { risk: string; color: string }> = {
      'priya.sharma@email.com': { risk: 'Conservative', color: 'bg-green-100 text-green-800' },
      'rajesh.kumar@email.com': { risk: 'Aggressive', color: 'bg-red-100 text-red-800' },
      'anita.desai@email.com': { risk: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
      'arjun.singh@email.com': { risk: 'Conservative', color: 'bg-green-100 text-green-800' },
      'meera.patel@email.com': { risk: 'Moderate-Aggressive', color: 'bg-orange-100 text-orange-800' }
    };
    
    return profiles[email] || { risk: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  };

  const getPortfolioValue = (email: string) => {
    // Based on our user data
    const portfolios: Record<string, string> = {
      'priya.sharma@email.com': '₹5.64L',
      'rajesh.kumar@email.com': '₹15.8L',
      'anita.desai@email.com': '₹9.25L',
      'arjun.singh@email.com': '₹92K',
      'meera.patel@email.com': '₹22.8L'
    };
    
    return portfolios[email] || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading demo users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>
          
          <div className="bg-white p-3 rounded-full w-16 h-16 mx-auto mb-4 shadow-lg">
            <div className="text-2xl">👥</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Users</h1>
          <p className="text-gray-600">Choose a user profile to explore different investment scenarios</p>
        </div>

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const riskProfile = getRiskProfile(user.email);
            const portfolioValue = getPortfolioValue(user.email);
            
            return (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => onSelectUser(user.email)}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{getUserIcon(user.profession)}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.profession}</p>
                  <p className="text-xs text-gray-500">{user.location}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Portfolio Value:</span>
                    <span className="font-semibold text-green-600">{portfolioValue}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Profile:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskProfile.color}`}>
                      {riskProfile.risk}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Email:</p>
                    <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">{user.email}</p>
                  </div>
                </div>

                <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Login as {user.name.split(' ')[0]}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Demo Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features Available:</h4>
              <ul className="space-y-1">
                <li>• Personalized portfolio analysis</li>
                <li>• 3 months of transaction history</li>
                <li>• Financial goal tracking</li>
                <li>• AI-powered investment advice</li>
                <li>• Conversation history</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Profiles:</h4>
              <ul className="space-y-1">
                <li>• <strong>Priya:</strong> Young professional, conservative approach</li>
                <li>• <strong>Rajesh:</strong> Business owner, aggressive growth</li>
                <li>• <strong>Anita:</strong> Doctor, balanced investment strategy</li>
                <li>• <strong>Arjun:</strong> Fresh graduate, learning to invest</li>
                <li>• <strong>Meera:</strong> Senior manager, experienced investor</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Password:</strong> All demo accounts use "demo123" as the password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;