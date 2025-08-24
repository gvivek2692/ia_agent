import React, { useState, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Shield
} from 'lucide-react';

interface GoalBasedRecommendationsProps {
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

const GoalBasedRecommendations: React.FC<GoalBasedRecommendationsProps> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    const loadGoalBasedRecommendations = async () => {
      setLoading(true);
      
      try {
        // Fetch portfolio recommendations from API and filter for goal_based
        const response = await fetch(`${process.env.REACT_APP_API_URL}/portfolio-recommendations?userId=${userId || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio recommendations');
        }
        
        const recommendationsData = await response.json();
        
        // Filter for goal_based recommendations only
        const goalBasedRecs = (recommendationsData.recommendations || []).filter(
          (rec: Recommendation) => rec.type === 'goal_based'
        );
        
        setRecommendations(goalBasedRecs);
      } catch (error) {
        console.error('Error loading goal-based recommendations:', error);
        // Fallback to sample goal-based recommendations if API fails
        const fallbackRecommendations: Recommendation[] = [
          {
            id: 'goal_fallback_1',
            type: 'goal_based',
            title: 'Increase SIP for Emergency Fund Goal',
            description: 'Your emergency fund goal is behind target. Consider increasing monthly SIP to get back on track.',
            priority: 'high',
            impact_score: 85,
            amount_suggestion: 5000,
            timeframe: '1-2 months',
            reasoning: [
              'Emergency fund is only 58% complete with target date approaching',
              'Increasing SIP by ₹5,000 will help achieve target on time',
              'Emergency fund provides crucial financial security'
            ],
            risk_level: 'low'
          },
          {
            id: 'goal_fallback_2',
            type: 'goal_based',
            title: 'Optimize House Down Payment Strategy',
            description: 'Consider shifting some low-performing investments to accelerate your house purchase goal.',
            priority: 'medium',
            impact_score: 72,
            amount_suggestion: 25000,
            timeframe: '3-6 months',
            reasoning: [
              'House down payment goal needs ₹10.75L more to complete',
              'Some current investments are underperforming',
              'Real estate prices are expected to rise next year'
            ],
            risk_level: 'medium'
          }
        ];
        
        setRecommendations(fallbackRecommendations);
      } finally {
        setLoading(false);
      }
    };

    loadGoalBasedRecommendations();
  }, [userId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-500/20 border border-red-400/30';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      case 'low': return 'text-green-300 bg-green-500/20 border border-green-400/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Goal-Based Recommendations</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Goal-Based Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h4 className="text-white font-medium mb-2">All Goals on Track!</h4>
          <p className="text-gray-300 text-sm">
            Your financial goals are progressing well. Keep up the great work!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg backdrop-blur-sm">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Goal-Based Recommendations</h3>
        </div>
        <div className="text-sm text-gray-400">
          {recommendations.length} recommendations
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isExpanded = selectedRecommendation === rec.id;
          
          return (
            <div 
              key={rec.id} 
              className={`border rounded-lg p-4 transition-all cursor-pointer backdrop-blur-sm ${
                isExpanded ? 'border-indigo-400/30 bg-indigo-500/20' : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setSelectedRecommendation(isExpanded ? null : rec.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-lg text-indigo-400 bg-indigo-500/20 border border-indigo-400/30">
                    <Target className="w-5 h-5" />
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
                  {rec.amount_suggestion && (
                    <div className="text-right text-sm">
                      <div className="text-indigo-400 font-medium">
                        +₹{rec.amount_suggestion.toLocaleString()}
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
                <div className="mt-4 pt-4 border-t border-indigo-400/30">
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
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
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
                            <span className="font-medium text-indigo-400">{rec.recommended_allocation}%</span>
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
                    <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                      Take Action
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalBasedRecommendations;