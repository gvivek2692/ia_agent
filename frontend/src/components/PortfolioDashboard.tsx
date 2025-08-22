import React, { useState, useEffect } from 'react';
import { TrendingDown, Settings, RefreshCw, MessageSquare } from 'lucide-react';
import PortfolioOverview from './PortfolioOverview';
import AssetAllocation from './AssetAllocation';
import HoldingsTable from './HoldingsTable';
import { apiService } from '../services/apiService';

interface PortfolioDashboardProps {
  userId?: string;
  userName?: string;
  onSessionExpired?: () => void;
  onToggleAIChat?: () => void;
}

interface PortfolioData {
  summary: {
    total_current_value: number;
    total_investment: number;
    total_gain_loss: number;
    gain_loss_percentage: number;
    asset_allocation: {
      [key: string]: {
        value: number;
        percentage: number;
      };
    };
  };
  mutual_funds: any[];
  stocks: any[];
  updated_at: string;
}


const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ userId, userName, onSessionExpired, onToggleAIChat }) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load portfolio data
      if (userId) {
        // Load specific user's data
        const userContext = await apiService.getUserContext(userId) as any;
        setPortfolioData(userContext.portfolio);
      } else {
        // Load demo data
        const portfolioResponse = await apiService.getPortfolioSummary();
        setPortfolioData(portfolioResponse as PortfolioData);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleRefreshPortfolio = async () => {
    if (!userId || !userId.startsWith('kite-') || refreshing) {
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      await apiService.refreshKitePortfolio(userId);
      // Reload dashboard data after successful refresh
      await loadDashboardData();
    } catch (err: any) {
      console.error('Error refreshing portfolio:', err);
      if (err.requires_reauth) {
        // Session expired, redirect to login
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          setError('Session expired. Please login again to refresh your portfolio.');
        }
      } else {
        setError('Failed to refresh portfolio. Please try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number | string | null | undefined) => {
    if (percentage === null || percentage === undefined || percentage === '') {
      return '0.00%';
    }
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    if (isNaN(numPercentage)) {
      return '0.00%';
    }
    const sign = numPercentage >= 0 ? '+' : '';
    return `${sign}${numPercentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-2xl hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {userName ? (
              <>
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  {userName}'s
                </span>{' '}
                Portfolio
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                  Portfolio
                </span>{' '}
                Dashboard
              </>
            )}
          </h2>
          <p className="text-gray-300 mt-1">
            Track your investments, monitor performance, and manage your financial goals
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {portfolioData ? new Date(portfolioData.updated_at).toLocaleDateString() : 'N/A'}
          </div>
          {onToggleAIChat && (
            <button
              onClick={onToggleAIChat}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-pink-300 bg-pink-500/20 border border-pink-400/30 rounded-2xl hover:bg-pink-500/30 hover:text-pink-200 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              title="Open AI Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
          )}
          {userId && userId.startsWith('kite-') ? (
            <button
              onClick={handleRefreshPortfolio}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-orange-300 bg-orange-500/20 border border-orange-400/30 rounded-2xl hover:bg-orange-500/30 hover:text-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              title="Refresh from Kite"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync from Kite'}</span>
            </button>
          ) : (
            <button
              onClick={loadDashboardData}
              className="p-3 text-gray-400 hover:text-pink-400 rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              title="Refresh Data"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>


      {/* Content */}
      {portfolioData && (
        <div className="space-y-8">
          {/* Portfolio Overview Cards */}
          <PortfolioOverview 
            portfolio={portfolioData}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />

          {/* Charts and Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Asset Allocation Chart */}
            <div className="lg:col-span-1">
              <AssetAllocation 
                assetAllocation={portfolioData.summary.asset_allocation}
                formatCurrency={formatCurrency}
              />
            </div>

            {/* Holdings Table */}
            <div className="lg:col-span-2">
              <HoldingsTable 
                mutualFunds={portfolioData.mutual_funds}
                stocks={portfolioData.stocks}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;