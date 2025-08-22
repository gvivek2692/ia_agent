import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  ArrowRight,
  Lightbulb,
  Shield
} from 'lucide-react';

interface PortfolioRecommendationsProps {
  userId?: string;
}

interface Recommendation {
  id: string;
  type: 'rebalance' | 'add' | 'reduce' | 'diversify' | 'goal_based';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact_score: number;
  current_allocation?: number;
  recommended_allocation?: number;
  amount_suggestion?: number;
  timeframe: string;
  reasoning: string[];
  risk_level: 'low' | 'medium' | 'high';
}

interface RebalanceData {
  current: { [key: string]: number };
  recommended: { [key: string]: number };
  difference: { [key: string]: number };
}

const PortfolioRecommendations: React.FC<PortfolioRecommendationsProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rebalanceData, setRebalanceData] = useState<RebalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      
      try {
        // Fetch real portfolio recommendations from API
        const response = await fetch(`${process.env.REACT_APP_API_URL}/portfolio-recommendations?userId=${userId || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio recommendations');
        }
        
        const recommendationsData = await response.json();
        
        // Filter out goal_based recommendations as they are shown in the Goals section
        const portfolioRecommendations = (recommendationsData.recommendations || []).filter(
          (rec: Recommendation) => rec.type !== 'goal_based'
        );
        setRecommendations(portfolioRecommendations);
        setRebalanceData(recommendationsData.rebalance_data || null);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        // Fallback to sample data if API fails
        const fallbackRecommendations: Recommendation[] = [
          {
            id: 'fallback_1',
            type: 'rebalance',
            title: 'Rebalance Large Cap Allocation',
            description: 'Consider increasing your large cap allocation for better stability and risk management.',
            priority: 'medium',
            impact_score: 65,
            current_allocation: 45,
            recommended_allocation: 55,
            timeframe: '2-3 months',
            reasoning: [
              'Current large cap allocation is below optimal range',
              'Market volatility suggests need for more stability',
              'Large cap stocks provide better downside protection'
            ],
            risk_level: 'low'
          },
          {
            id: 'fallback_2',
            type: 'diversify',
            title: 'Add International Exposure',
            description: 'Consider adding international funds to improve diversification and reduce country-specific risks.',
            priority: 'low',
            impact_score: 45,
            amount_suggestion: 50000,
            timeframe: '6-12 months',
            reasoning: [
              'Portfolio lacks international diversification',
              'Global markets can provide hedge against domestic risks',
              'Long-term currency diversification benefits'
            ],
            risk_level: 'medium'
          }
        ];
        
        const fallbackRebalanceData: RebalanceData = {
          current: { 'Portfolio': 100 },
          recommended: { 'Portfolio': 100 },
          difference: { 'Portfolio': 0 }
        };
        
        setRecommendations(fallbackRecommendations);
        setRebalanceData(fallbackRebalanceData);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [userId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-500/20 border border-red-400/30';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      case 'low': return 'text-green-300 bg-green-500/20 border border-green-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rebalance': return BarChart3;
      case 'add': return TrendingUp;
      case 'reduce': return TrendingDown;
      case 'diversify': return PieChart;
      case 'goal_based': return Target;
      default: return DollarSign;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rebalance': return 'text-blue-400 bg-blue-500/20 border border-blue-400/30';
      case 'add': return 'text-green-400 bg-green-500/20 border border-green-400/30';
      case 'reduce': return 'text-red-400 bg-red-500/20 border border-red-400/30';
      case 'diversify': return 'text-purple-400 bg-purple-500/20 border border-purple-400/30';
      case 'goal_based': return 'text-indigo-400 bg-indigo-500/20 border border-indigo-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Portfolio Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <Target className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Portfolio Recommendations</h3>
        </div>
        <div className="text-sm text-gray-400">
          {recommendations.length} recommendations
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const TypeIcon = getTypeIcon(rec.type);
          const isExpanded = selectedRecommendation === rec.id;
          
          return (
            <div 
              key={rec.id} 
              className={`border rounded-lg p-4 transition-all cursor-pointer backdrop-blur-sm ${
                isExpanded ? 'border-blue-400/30 bg-blue-500/20' : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setSelectedRecommendation(isExpanded ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-white">{rec.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <span>Impact:</span>
                        <span className="font-medium">{rec.impact_score}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Timeframe:</span>
                        <span className="font-medium">{rec.timeframe}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span className="font-medium capitalize">{rec.risk_level}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {rec.current_allocation && rec.recommended_allocation && (
                    <div className="text-right text-sm">
                      <div className="text-gray-400">
                        {rec.current_allocation}% → {rec.recommended_allocation}%
                      </div>
                    </div>
                  )}
                  <ArrowRight className={`w-4 h-4 text-gray-300 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-blue-400/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reasoning */}
                    <div>
                      <h5 className="font-medium text-white mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Why this matters
                      </h5>
                      <ul className="space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Details */}
                    <div>
                      <h5 className="font-medium text-white mb-2">Recommended Action</h5>
                      {rec.amount_suggestion && (
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="font-medium">Amount: </span>
                          ₹{rec.amount_suggestion.toLocaleString()}
                        </div>
                      )}
                      {rec.current_allocation && rec.recommended_allocation && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Current:</span>
                            <span className="font-medium">{rec.current_allocation}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Target:</span>
                            <span className="font-medium text-blue-400">{rec.recommended_allocation}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Adjustment:</span>
                            <span className={`font-medium ${
                              rec.recommended_allocation > rec.current_allocation ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {rec.recommended_allocation > rec.current_allocation ? '+' : ''}
                              {rec.recommended_allocation - rec.current_allocation}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button className="text-sm text-gray-400 hover:text-gray-300">
                      Remind Later
                    </button>
                    <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                      Take Action
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rebalance Visualization */}
      {rebalanceData && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="font-semibold text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Rebalancing Overview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(rebalanceData.current).map(([asset, currentValue]) => {
              const recommended = rebalanceData.recommended[asset];
              const difference = rebalanceData.difference[asset];
              
              return (
                <div key={asset} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                  <div className="font-medium text-sm text-white mb-1">{asset}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{currentValue}%</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span className="font-medium">{recommended}%</span>
                  </div>
                  {difference !== 0 && (
                    <div className={`text-xs mt-1 ${
                      difference > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {difference > 0 ? '+' : ''}{difference}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioRecommendations;