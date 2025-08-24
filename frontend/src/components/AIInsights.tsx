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
import GoalsProgress from './GoalsProgress';
import PortfolioHealthCard from './PortfolioHealthCard';
import ActionableInsights from './ActionableInsights';
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
  const [portfolioSummary, setPortfolioSummary] = useState<any>(null);
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
        setPortfolioSummary(userContext.portfolio?.summary || null);
      } else {
        // Load demo data
        const [goalsResponse, portfolioResponse] = await Promise.all([
          apiService.getGoalsOverview(),
          apiService.getPortfolioSummary()
        ]);
        setGoals((goalsResponse as any).goals || []);
        setPortfolioValue((portfolioResponse as any).summary?.total_current_value || 0);
        setPortfolioSummary((portfolioResponse as any).summary || null);
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
          <div className="w-12 h-12 border-4 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            className="bg-gradient-to-r from-gold-600 to-amber-600 text-white px-6 py-3 rounded-2xl hover:from-gold-500 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-gold-500/25"
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
          <div className="p-3 bg-gradient-to-r from-gold-500 to-amber-500 rounded-2xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-gold-400 to-amber-400 bg-clip-text text-transparent">
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
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gold-300 bg-gold-500/20 border border-gold-400/30 rounded-2xl hover:bg-gold-500/30 hover:text-gold-200 transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
              title="Open AI Chat"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat</span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 text-gray-400 hover:text-gold-400 rounded-2xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 backdrop-blur-sm transform hover:scale-105"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6">
        <div className="border-b border-gold-500/20">
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
                    ? 'border-gold-500 text-gold-400 bg-gold-500/10 backdrop-blur-sm'
                    : 'border-transparent text-gray-400 hover:text-gold-300 hover:border-gold-500/30 hover:bg-white/5'
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
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Portfolio Health */}
                {portfolioSummary && (
                  <PortfolioHealthCard
                    portfolioScore={insightsData.portfolio_score}
                    riskScore={insightsData.risk_score}
                    diversificationScore={insightsData.diversification_score}
                    totalValue={portfolioValue}
                    dayChange={portfolioSummary.day_change || 0}
                    dayChangePercent={portfolioSummary.day_change_percent || 0}
                    formatCurrency={formatCurrency}
                    onViewDetails={() => setActiveTab('portfolio')}
                  />
                )}
                
                {/* Goals Progress */}
                <GoalsProgress
                  goals={goals}
                  formatCurrency={formatCurrency}
                  onViewAllGoals={() => setActiveTab('goals')}
                />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Actionable Insights */}
                <ActionableInsights
                  insights={insightsData.insights}
                  onViewAllInsights={() => setActiveTab('portfolio')}
                />
                
                {/* Market Snapshot */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/20 border border-purple-400/30 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Market Outlook</h3>
                        <p className="text-sm text-gray-400">Current sentiment</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('market')}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg border backdrop-blur-sm ${
                      insightsData.market_outlook === 'bullish' ? 'bg-green-500/20 border-green-400/30' :
                      insightsData.market_outlook === 'bearish' ? 'bg-red-500/20 border-red-400/30' :
                      'bg-yellow-500/20 border-yellow-400/30'
                    }`}>
                      {insightsData.market_outlook === 'bullish' ? (
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      ) : insightsData.market_outlook === 'bearish' ? (
                        <TrendingDown className="w-6 h-6 text-red-400" />
                      ) : (
                        <BarChart3 className="w-6 h-6 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white capitalize">
                        {insightsData.market_outlook}
                      </div>
                      <div className="text-sm text-gray-400">
                        Market sentiment is {insightsData.market_outlook}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Portfolio Health Details */}
            {portfolioSummary && (
              <PortfolioHealthCard
                portfolioScore={insightsData.portfolio_score}
                riskScore={insightsData.risk_score}
                diversificationScore={insightsData.diversification_score}
                totalValue={portfolioValue}
                dayChange={portfolioSummary.day_change || 0}
                dayChangePercent={portfolioSummary.day_change_percent || 0}
                formatCurrency={formatCurrency}
              />
            )}
            
            {/* Portfolio Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PortfolioRecommendations userId={userId} />
              <RiskAnalysis userId={userId} />
            </div>
            
            {/* Portfolio Insights */}
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