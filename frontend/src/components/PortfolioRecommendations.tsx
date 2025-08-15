import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
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
        
        setRecommendations(recommendationsData.recommendations || []);
        setRebalanceData(recommendationsData.rebalance_data || null);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        // Fallback to sample data if API fails
        const fallbackRecommendations: Recommendation[] = [
          {
            id: 'fallback_1',
            type: 'rebalance',
            title: 'Unable to Load Personalized Recommendations',
            description: 'There was an issue loading your personalized portfolio recommendations. Please refresh the page to try again.',
            priority: 'medium',
            impact_score: 50,
            timeframe: 'N/A',
            reasoning: ['API Error', 'Please refresh to retry'],
            risk_level: 'low'
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
      case 'high': return 'text-red-600 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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
      case 'rebalance': return 'text-blue-600 bg-blue-100';
      case 'add': return 'text-green-600 bg-green-100';
      case 'reduce': return 'text-red-600 bg-red-100';
      case 'diversify': return 'text-purple-600 bg-purple-100';
      case 'goal_based': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Recommendations</h3>
        </div>
        <div className="text-sm text-gray-500">
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
              className={`border rounded-lg p-4 transition-all cursor-pointer ${
                isExpanded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
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
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
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
                      <div className="text-gray-600">
                        {rec.current_allocation}% → {rec.recommended_allocation}%
                      </div>
                    </div>
                  )}
                  <ArrowRight className={`w-4 h-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reasoning */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        Why this matters
                      </h5>
                      <ul className="space-y-1">
                        {rec.reasoning.map((reason, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Details */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Recommended Action</h5>
                      {rec.amount_suggestion && (
                        <div className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Amount: </span>
                          ₹{rec.amount_suggestion.toLocaleString()}
                        </div>
                      )}
                      {rec.current_allocation && rec.recommended_allocation && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Current:</span>
                            <span className="font-medium">{rec.current_allocation}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Target:</span>
                            <span className="font-medium text-blue-600">{rec.recommended_allocation}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Adjustment:</span>
                            <span className={`font-medium ${
                              rec.recommended_allocation > rec.current_allocation ? 'text-green-600' : 'text-red-600'
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
                    <button className="text-sm text-gray-600 hover:text-gray-700">
                      Remind Later
                    </button>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Rebalancing Overview
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(rebalanceData.current).map(([asset, currentValue]) => {
              const recommended = rebalanceData.recommended[asset];
              const difference = rebalanceData.difference[asset];
              
              return (
                <div key={asset} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-sm text-gray-900 mb-1">{asset}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{currentValue}%</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="font-medium">{recommended}%</span>
                  </div>
                  {difference !== 0 && (
                    <div className={`text-xs mt-1 ${
                      difference > 0 ? 'text-green-600' : 'text-red-600'
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