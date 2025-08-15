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
        return 'text-green-600 bg-green-100';
      case 'risk':
        return 'text-red-600 bg-red-100';
      case 'opportunity':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'goal':
        return 'text-purple-600 bg-purple-100';
      case 'market':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'border-l-green-500';
      case 'risk':
        return 'border-l-red-500';
      case 'opportunity':
        return 'border-l-blue-500';
      case 'warning':
        return 'border-l-orange-500';
      case 'goal':
        return 'border-l-purple-500';
      case 'market':
        return 'border-l-indigo-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const color = confidence >= 80 ? 'bg-green-500' : confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    );
  };

  const Icon = getInsightIcon(insight.type);
  
  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 ${getBorderColor(insight.type)} p-6 hover:shadow-lg transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {insight.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(insight.impact)}`}>
                {insight.impact.toUpperCase()} IMPACT
              </span>
              {insight.actionable && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-blue-600 bg-blue-100">
                  ACTIONABLE
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 text-sm leading-relaxed mb-4">
        {insight.description}
      </p>

      {/* Data Visualization (if present) */}
      {insight.data && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          {insight.data.chart_data && (
            <div className="text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current:</span>
                <span className="font-semibold text-gray-900">
                  {insight.data.current_value}
                </span>
              </div>
              {insight.data.target_value && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-semibold text-blue-600">
                    {insight.data.target_value}
                  </span>
                </div>
              )}
              {insight.data.change && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Change:</span>
                  <span className={`font-semibold ${
                    insight.data.change.startsWith('+') ? 'text-green-600' : 
                    insight.data.change.startsWith('-') ? 'text-red-600' : 'text-gray-900'
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
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Recommendation</p>
              <p className="text-sm text-blue-800">{insight.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(insight.generated_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
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
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Take Action →
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;