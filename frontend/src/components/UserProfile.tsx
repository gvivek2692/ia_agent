import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/apiService';

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

interface UserProfileProps {
  user: User;
  sessionId: string;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, sessionId, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiService.logout(sessionId);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      onLogout();
    }
  };

  const getRiskColor = (riskTolerance: string) => {
    switch (riskTolerance.toLowerCase()) {
      case 'conservative':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate-aggressive':
        return 'bg-orange-100 text-orange-800';
      case 'aggressive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar/Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {getInitials(user.name)}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-900">{user.name || 'User'}</div>
          <div className="text-xs text-gray-600">{user.profession || 'Professional'}</div>
        </div>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</div>
                <div className="text-sm text-gray-600 truncate">{user.email || 'No email'}</div>
                <div className="text-xs text-gray-500">{user.profession || 'Professional'} • {user.location || 'Location'}</div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Age:</span>
                <span className="ml-1 font-medium">{user.age || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Experience:</span>
                <span className="ml-1 font-medium">{user.experience_level || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Profile:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(user.risk_tolerance || 'moderate')}`}>
                {user.risk_tolerance || 'Moderate'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing Out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </div>

          {/* Session Info */}
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
              Session ID: {sessionId.slice(-8)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;