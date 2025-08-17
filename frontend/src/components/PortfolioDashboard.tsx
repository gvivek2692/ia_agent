import React, { useState, useEffect } from 'react';
import { TrendingDown, Target, PieChart, Settings, RefreshCw } from 'lucide-react';
import PortfolioOverview from './PortfolioOverview';
import AssetAllocation from './AssetAllocation';
import HoldingsTable from './HoldingsTable';
import GoalsDashboard from './GoalsDashboard';
import { apiService } from '../services/apiService';

interface PortfolioDashboardProps {
  userId?: string;
  userName?: string;
  onSessionExpired?: () => void;
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

interface GoalData {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  category: string;
  progress_percentage: number;
}

const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({ userId, userName, onSessionExpired }) => {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'goals'>('portfolio');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
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
        setGoals(userContext.financial_goals?.goals || []);
      } else {
        // Load demo data
        const [portfolioResponse, goalsResponse] = await Promise.all([
          apiService.getPortfolioSummary(),
          apiService.getGoalsOverview()
        ]);
        setPortfolioData(portfolioResponse as PortfolioData);
        setGoals((goalsResponse as any).goals || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsUpdate = async (updatedGoals: GoalData[]) => {
    setGoals(updatedGoals);
    
    // If userId is available, save goals to backend for AI insights
    if (userId) {
      try {
        await apiService.updateUserGoals(userId, updatedGoals);
        console.log('Goals updated in backend for AI insights');
      } catch (error) {
        console.error('Failed to update goals in backend:', error);
        // Don't show error to user as the goals are still updated locally
      }
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

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number | string | null | undefined) => {
    if (percentage === null || percentage === undefined || percentage === '') {
      return 'N/A';
    }
    
    const numPercentage = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
    
    if (isNaN(numPercentage)) {
      return 'N/A';
    }
    
    const sign = numPercentage >= 0 ? '+' : '';
    return `${sign}${numPercentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userName ? `${userName}'s Portfolio` : 'Portfolio Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Track your investments, monitor performance, and manage your financial goals
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Last updated: {portfolioData ? new Date(portfolioData.updated_at).toLocaleDateString() : 'N/A'}
              </div>
              {userId && userId.startsWith('kite-') ? (
                <button
                  onClick={handleRefreshPortfolio}
                  disabled={refreshing}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Refresh from Kite"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Syncing...' : 'Sync from Kite'}</span>
                </button>
              ) : (
                <button
                  onClick={loadDashboardData}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                  title="Refresh Data"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'portfolio'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-2">
                    <PieChart className="w-4 h-4" />
                    <span>Portfolio</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'goals'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Goals</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'portfolio' && portfolioData && (
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

        {activeTab === 'goals' && (
          <GoalsDashboard 
            goals={goals}
            onGoalsChange={handleGoalsUpdate}
            userId={userId}
            formatCurrency={formatCurrency}
            portfolioValue={portfolioData?.summary?.total_current_value || 0}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioDashboard;