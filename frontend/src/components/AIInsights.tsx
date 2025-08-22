import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  BarChart3, 
  PieChart, 
  Lightbulb,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import InsightCard from './InsightCard';
import MarketAnalysis from './MarketAnalysis';
import PortfolioRecommendations from './PortfolioRecommendations';
import RiskAnalysis from './RiskAnalysis';
import GoalsDashboard from './GoalsDashboard';
import GoalBasedRecommendations from './GoalBasedRecommendations';
import { apiService } from '../services/apiService';

interface AIInsightsProps {
  userId?: string;
  userName?: string;
  onSessionExpired?: () => void;
  onToggleAIChat?: () => void;
}

interface InsightData {
  id: string;
  type: 'performance' | 'risk' | 'opportunity' | 'warning' | 'goal' | 'market';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
  data?: any;
  generated_at: string;
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

interface AIInsightsData {
  insights: InsightData[];
  portfolio_score: number;
  risk_score: number;
  diversification_score: number;
  market_outlook: 'bullish' | 'bearish' | 'neutral';
  next_review_date: string;
  last_updated: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId, userName, onSessionExpired, onToggleAIChat }) => {
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'market' | 'goals'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInsightsData();
  }, [userId]);

  const loadInsightsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load AI insights
      const response = await apiService.getAIInsights(userId);
      setInsightsData(response as AIInsightsData);
      
      // Load goals and portfolio data
      if (userId) {
        // Load specific user's data
        const userContext = await apiService.getUserContext(userId) as any;
        setGoals(userContext.financial_goals?.goals || []);
        setPortfolioValue(userContext.portfolio?.summary?.total_current_value || 0);
      } else {
        // Load demo data
        const [goalsResponse, portfolioResponse] = await Promise.all([
          apiService.getGoalsOverview(),
          apiService.getPortfolioSummary()
        ]);
        setGoals((goalsResponse as any).goals || []);
        setPortfolioValue((portfolioResponse as any).summary?.total_current_value || 0);
      }
    } catch (err: any) {
      console.error('Error loading AI insights:', err);
      if (err.requires_reauth) {
        // Session expired, redirect to login
        if (onSessionExpired) {
          onSessionExpired();
        } else {
          setError('Session expired. Please login again to refresh your insights.');
        }
      } else {
        setError('Failed to load AI insights. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsightsData();
    setRefreshing(false);
  };

  const handleGoalsUpdate = async (updatedGoals: GoalData[]) => {
    setGoals(updatedGoals);
    
    // If userId is available, save goals to backend for AI insights
    if (userId) {
      try {
        await apiService.updateUserGoals(userId, updatedGoals);
      } catch (error) {
        console.error('Failed to update goals in backend:', error);
        // Don't show error to user as the goals are still updated locally
      }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-400/30 backdrop-blur-sm';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-400/30 backdrop-blur-sm';
    return 'bg-red-500/20 border-red-400/30 backdrop-blur-sm';
  };

  const filterInsightsByTab = (insights: InsightData[]) => {
    switch (activeTab) {
      case 'portfolio':
        return insights.filter(insight => 
          ['performance', 'risk', 'opportunity'].includes(insight.type)
        );
      case 'market':
        return insights.filter(insight => insight.type === 'market');
      case 'goals':
        return insights.filter(insight => insight.type === 'goal');
      case 'overview':
      default:
        return insights.slice(0, 6); // Show top 6 insights in overview
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Analyzing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadInsightsData}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-2xl hover:from-pink-500 hover:to-rose-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No insights data available</p>
        </div>
      </div>
    );
  }

  const filteredInsights = filterInsightsByTab(insightsData.insights);

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                AI
              </span>{' '}
              Insights
            </h2>
            <p className="text-gray-300 mt-1">
              Personalized recommendations powered by advanced analytics
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Last updated: {new Date(insightsData.last_updated).toLocaleString()}
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 text-gray-400 hover:text-pink-400 rounded-2xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm transform hover:scale-105"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* AI Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`rounded-lg border-2 p-4 ${getScoreBackground(insightsData.portfolio_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Portfolio Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(insightsData.portfolio_score)}`}>
                {insightsData.portfolio_score}/100
              </p>
            </div>
            <BarChart3 className={`w-8 h-8 ${getScoreColor(insightsData.portfolio_score)}`} />
          </div>
        </div>

        <div className={`rounded-lg border-2 p-4 ${getScoreBackground(insightsData.risk_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Risk Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(100 - insightsData.risk_score)}`}>
                {insightsData.risk_score}/100
              </p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${getScoreColor(100 - insightsData.risk_score)}`} />
          </div>
        </div>

        <div className={`rounded-lg border-2 p-4 ${getScoreBackground(insightsData.diversification_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Diversification</p>
              <p className={`text-2xl font-bold ${getScoreColor(insightsData.diversification_score)}`}>
                {insightsData.diversification_score}/100
              </p>
            </div>
            <PieChart className={`w-8 h-8 ${getScoreColor(insightsData.diversification_score)}`} />
          </div>
        </div>

        <div className="rounded-lg border-2 border-blue-400/30 bg-blue-500/20 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Market Outlook</p>
              <p className="text-2xl font-bold text-blue-400 capitalize">
                {insightsData.market_outlook}
              </p>
            </div>
            <div className="p-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 rounded-full">
              {insightsData.market_outlook === 'bullish' ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : insightsData.market_outlook === 'bearish' ? (
                <TrendingDown className="w-6 h-6 text-red-400" />
              ) : (
                <BarChart3 className="w-6 h-6 text-blue-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8">
        <div className="border-b border-pink-500/20">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Lightbulb },
              { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
              { id: 'market', label: 'Market', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-3 px-4 border-b-2 font-medium text-sm rounded-t-lg transition-all duration-300 ${
                  activeTab === id
                    ? 'border-pink-500 text-pink-400 bg-pink-500/10 backdrop-blur-sm'
                    : 'border-transparent text-gray-400 hover:text-pink-300 hover:border-pink-500/30 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Insights Grid */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* Quick Analysis Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MarketAnalysis userId={userId} />
              <RiskAnalysis userId={userId} />
            </div>

            <PortfolioRecommendations userId={userId} />
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PortfolioRecommendations userId={userId} />
              <RiskAnalysis userId={userId} />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Portfolio Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-8">
            <MarketAnalysis userId={userId} />
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Market Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-8">
            {/* Goals Management */}
            <GoalsDashboard 
              goals={goals}
              onGoalsChange={handleGoalsUpdate}
              userId={userId}
              formatCurrency={formatCurrency}
              portfolioValue={portfolioValue}
            />
            
            {/* Goal-Based Recommendations */}
            <GoalBasedRecommendations userId={userId} />
            
            {/* Goal-Based Insights */}
            {filteredInsights.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Goal-Based Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;