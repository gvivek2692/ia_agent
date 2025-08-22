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
        return 'bg-green-500/20 text-green-300 border border-green-500/30 backdrop-blur-sm';
      case 'moderate':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 backdrop-blur-sm';
      case 'moderate-aggressive':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30 backdrop-blur-sm';
      case 'aggressive':
        return 'bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-sm';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30 backdrop-blur-sm';
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
        className="flex items-center space-x-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm border border-white/20 transform hover:scale-105"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
          {getInitials(user.name)}
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">{user.name || 'User'}</div>
          <div className="text-xs text-gray-300">{user.profession || 'Professional'}</div>
        </div>
        
        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="fixed right-4 top-20 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-pink-500/30 animate-in slide-in-from-top-2 duration-300"
          style={{ zIndex: 'var(--z-dropdown)' }}
        >
          {/* User Info Header */}
          <div className="p-3 sm:p-4 border-b border-pink-500/20 bg-white/5 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm sm:text-lg font-semibold shadow-lg flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user.name || 'User'}</div>
                <div className="text-xs sm:text-sm text-gray-300 truncate">{user.email || 'No email'}</div>
                <div className="text-xs text-gray-400 truncate">{user.profession || 'Professional'} • {user.location || 'Location'}</div>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="bg-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <span className="text-gray-300">Age:</span>
                <span className="ml-1 font-medium text-white">{user.age || 'N/A'}</span>
              </div>
              <div className="bg-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-sm border border-white/20">
                <span className="text-gray-300">Experience:</span>
                <span className="ml-1 font-medium text-white">{user.experience_level || 'N/A'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-white/10 p-2 sm:p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <span className="text-xs sm:text-sm text-gray-300">Risk Profile:</span>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(user.risk_tolerance || 'moderate')}`}>
                {user.risk_tolerance || 'Moderate'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 sm:p-4 border-t border-pink-500/20 bg-white/5 backdrop-blur-sm">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-red-300 bg-red-500/20 border border-red-500/30 rounded-2xl hover:bg-red-500/30 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm transform hover:scale-105 shadow-lg"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing Out...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          </div>

          {/* Session Info */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-xs text-gray-400 bg-white/10 rounded-xl p-2 sm:p-3 backdrop-blur-sm border border-white/20">
              <span className="text-gray-300">Session ID:</span> <span className="font-mono text-pink-300 break-all">{sessionId.slice(-8)}...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;