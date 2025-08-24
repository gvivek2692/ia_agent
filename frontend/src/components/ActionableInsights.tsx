import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

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

interface ActionableInsightsProps {
  insights: InsightData[];
  onTakeAction?: (insight: InsightData) => void;
  onViewAllInsights?: () => void;
}

const ActionableInsights: React.FC<ActionableInsightsProps> = ({
  insights,
  onTakeAction,
  onViewAllInsights
}) => {
  const getInsightIcon = (type: string, impact: string) => {
    if (impact === 'high') {
      switch (type) {
        case 'warning': return AlertTriangle;
        case 'opportunity': return TrendingUp;
        case 'goal': return Target;
        default: return AlertTriangle;
      }
    }
    
    switch (type) {
      case 'performance': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'opportunity': return DollarSign;
      case 'warning': return AlertTriangle;
      case 'goal': return Target;
      case 'market': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (impact === 'high') {
      switch (type) {
        case 'warning': return 'text-red-400 bg-red-500/20 border-red-400/30';
        case 'opportunity': return 'text-green-400 bg-green-500/20 border-green-400/30';
        case 'goal': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
        default: return 'text-red-400 bg-red-500/20 border-red-400/30';
      }
    }
    
    switch (type) {
      case 'performance': return 'text-blue-400 bg-blue-500/20 border-blue-400/30';
      case 'risk': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'opportunity': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'warning': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'goal': return 'text-indigo-400 bg-indigo-500/20 border-indigo-400/30';
      case 'market': return 'text-purple-400 bg-purple-500/20 border-purple-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPriorityOrder = (insight: InsightData) => {
    // Priority scoring: high impact + actionable + high confidence = highest priority
    let score = 0;
    
    if (insight.impact === 'high') score += 100;
    else if (insight.impact === 'medium') score += 50;
    else score += 10;
    
    if (insight.actionable) score += 50;
    
    score += insight.confidence;
    
    // Boost warnings and opportunities
    if (insight.type === 'warning') score += 30;
    if (insight.type === 'opportunity') score += 25;
    if (insight.type === 'goal') score += 20;
    
    return score;
  };

  // Filter and sort insights by priority
  const prioritizedInsights = insights
    .filter(insight => 
      insight.actionable && 
      (insight.impact === 'high' || insight.impact === 'medium') &&
      insight.confidence >= 70
    )
    .sort((a, b) => getPriorityOrder(b) - getPriorityOrder(a))
    .slice(0, 4); // Show top 4 actionable insights

  if (prioritizedInsights.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Action Items</h3>
          </div>
        </div>
        <div className="text-center py-6">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-2">All caught up!</p>
          <p className="text-sm text-gray-400">No urgent action items at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/20 border border-orange-400/30 rounded-lg backdrop-blur-sm">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Action Items</h3>
            <p className="text-sm text-gray-400">{prioritizedInsights.length} items need attention</p>
          </div>
        </div>
        {onViewAllInsights && (
          <button
            onClick={onViewAllInsights}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Actionable Insights */}
      <div className="space-y-4">
        {prioritizedInsights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type, insight.impact);
          const colorClasses = getInsightColor(insight.type, insight.impact);
          
          return (
            <div 
              key={insight.id} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* Priority Badge */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full ${colorClasses} flex items-center justify-center border backdrop-blur-sm`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-gray-400">
                    #{index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white text-sm pr-4">{insight.title}</h4>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${getImpactBadgeColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{insight.description}</p>
                  
                  {insight.recommendation && (
                    <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 mb-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-200">{insight.recommendation}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {onTakeAction && (
                      <button
                        onClick={() => onTakeAction(insight)}
                        className="flex items-center space-x-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group"
                      >
                        <span>Take Action</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {insights.length > prioritizedInsights.length && onViewAllInsights && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <button
            onClick={onViewAllInsights}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            +{insights.length - prioritizedInsights.length} more insights available
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionableInsights;