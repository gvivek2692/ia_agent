import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  BarChart3, 
  PieChart, 
  DollarSign,
  Clock,
  Lightbulb,
  Shield,
  Activity
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

interface InsightCardProps {
  insight: InsightData;
  onActionClick?: (insight: InsightData) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onActionClick }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return TrendingUp;
      case 'risk':
        return Shield;
      case 'opportunity':
        return Lightbulb;
      case 'warning':
        return AlertTriangle;
      case 'goal':
        return Target;
      case 'market':
        return Activity;
      default:
        return BarChart3;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'text-green-400 bg-green-500/20 border border-green-400/30';
      case 'risk':
        return 'text-red-400 bg-red-500/20 border border-red-400/30';
      case 'opportunity':
        return 'text-blue-400 bg-blue-500/20 border border-blue-400/30';
      case 'warning':
        return 'text-orange-400 bg-orange-500/20 border border-orange-400/30';
      case 'goal':
        return 'text-purple-400 bg-purple-500/20 border border-purple-400/30';
      case 'market':
        return 'text-indigo-400 bg-indigo-500/20 border border-indigo-400/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border border-gray-400/30';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'border-l-green-400';
      case 'risk':
        return 'border-l-red-400';
      case 'opportunity':
        return 'border-l-blue-400';
      case 'warning':
        return 'border-l-orange-400';
      case 'goal':
        return 'border-l-purple-400';
      case 'market':
        return 'border-l-indigo-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-300 bg-red-500/20 border border-red-400/30';
      case 'medium':
        return 'text-yellow-300 bg-yellow-500/20 border border-yellow-400/30';
      case 'low':
        return 'text-green-300 bg-green-500/20 border border-green-400/30';
      default:
        return 'text-gray-300 bg-gray-500/20 border border-gray-400/30';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const color = confidence >= 80 ? 'bg-green-400' : confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400';
    return (
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-1.5 mt-1">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    );
  };

  const Icon = getInsightIcon(insight.type);
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg border-l-4 ${getBorderColor(insight.type)} p-6 hover:bg-white/15 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white leading-tight">
              {insight.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                {insight.impact.toUpperCase()} IMPACT
              </span>
              {insight.actionable && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-300 bg-blue-500/20 border border-blue-400/30">
                  ACTIONABLE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {insight.description}
      </p>

      {/* Data Visualization (if present) */}
      {insight.data && (
        <div className="mb-4 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
          {insight.data.chart_data && (
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Current:</span>
                <span className="font-semibold text-white">
                  {insight.data.current_value}
                </span>
              </div>
              {insight.data.target_value && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400">Target:</span>
                  <span className="font-semibold text-blue-400">
                    {insight.data.target_value}
                  </span>
                </div>
              )}
              {insight.data.change && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400">Change:</span>
                  <span className={`font-semibold ${
                    insight.data.change.startsWith('+') ? 'text-green-400' : 
                    insight.data.change.startsWith('-') ? 'text-red-400' : 'text-white'
                  }`}>
                    {insight.data.change}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      {insight.recommendation && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-300 mb-1">Recommendation</p>
              <p className="text-sm text-blue-200">{insight.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <span>Confidence:</span>
              <span className="font-medium">{insight.confidence}%</span>
            </div>
            {getConfidenceBar(insight.confidence)}
          </div>
        </div>
        
        {insight.actionable && onActionClick && (
          <button
            onClick={() => onActionClick(insight)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Take Action →
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;