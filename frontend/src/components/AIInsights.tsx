import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  PieChart, 
  Calendar,
  Lightbulb,
  Settings,
  RefreshCw
} from 'lucide-react';
import InsightCard from './InsightCard';
import MarketAnalysis from './MarketAnalysis';
import PortfolioRecommendations from './PortfolioRecommendations';
import RiskAnalysis from './RiskAnalysis';
import { apiService } from '../services/apiService';

interface AIInsightsProps {
  userId?: string;
  userName?: string;
  onSessionExpired?: () => void;
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

interface AIInsightsData {
  insights: InsightData[];
  portfolio_score: number;
  risk_score: number;
  diversification_score: number;
  market_outlook: 'bullish' | 'bearish' | 'neutral';
  next_review_date: string;
  last_updated: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ userId, userName, onSessionExpired }) => {
  const [insightsData, setInsightsData] = useState<AIInsightsData | null>(null);
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
      const response = await apiService.getAIInsights(userId);
      setInsightsData(response as AIInsightsData);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadInsightsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No insights data available</p>
        </div>
      </div>
    );
  }

  const filteredInsights = filterInsightsByTab(insightsData.insights);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  AI Insights
                </h1>
                <p className="text-gray-600 mt-1">
                  Personalized recommendations powered by advanced analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date(insightsData.last_updated).toLocaleString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Refresh Insights"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* AI Scores Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className={`rounded-lg border-2 p-4 ${getScoreBackground(insightsData.portfolio_score)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Portfolio Score</p>
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
                  <p className="text-sm font-medium text-gray-600">Risk Score</p>
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
                  <p className="text-sm font-medium text-gray-600">Diversification</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insightsData.diversification_score)}`}>
                    {insightsData.diversification_score}/100
                  </p>
                </div>
                <PieChart className={`w-8 h-8 ${getScoreColor(insightsData.diversification_score)}`} />
              </div>
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Outlook</p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">
                    {insightsData.market_outlook}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  {insightsData.market_outlook === 'bullish' ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : insightsData.market_outlook === 'bearish' ? (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  ) : (
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
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
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Insights Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Insights</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Insights</h2>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Market Insights</h2>
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
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Goal-Based Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredInsights.length > 0 ? (
                  filteredInsights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow-md">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Goal Insights</h3>
                    <p className="text-gray-600">
                      Set up your financial goals to receive personalized insights and recommendations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;