import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  PieChart, 
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface PortfolioHealthCardProps {
  portfolioScore: number;
  riskScore: number;
  diversificationScore: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  formatCurrency: (amount: number) => string;
  onViewDetails?: () => void;
}

const PortfolioHealthCard: React.FC<PortfolioHealthCardProps> = ({
  portfolioScore,
  riskScore,
  diversificationScore,
  totalValue,
  dayChange,
  dayChangePercent,
  formatCurrency,
  onViewDetails
}) => {
  const getHealthStatus = () => {
    const avgScore = (portfolioScore + diversificationScore + (100 - riskScore)) / 3;
    
    if (avgScore >= 80) return {
      status: 'Excellent',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20 border-green-400/30',
      icon: CheckCircle2,
      description: 'Your portfolio is well-balanced and performing optimally'
    };
    
    if (avgScore >= 60) return {
      status: 'Good',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20 border-blue-400/30',
      icon: TrendingUp,
      description: 'Your portfolio is on track with room for minor improvements'
    };
    
    if (avgScore >= 40) return {
      status: 'Fair',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20 border-yellow-400/30',
      icon: BarChart3,
      description: 'Your portfolio needs some rebalancing for optimal performance'
    };
    
    return {
      status: 'Needs Attention',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20 border-red-400/30',
      icon: AlertTriangle,
      description: 'Your portfolio requires immediate attention and rebalancing'
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Portfolio Health</h3>
            <p className="text-sm text-gray-400">{formatCurrency(totalValue)} total value</p>
          </div>
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View Details
          </button>
        )}
      </div>

      {/* Portfolio Value and Change */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-white">
            {formatCurrency(totalValue)}
          </span>
          <div className={`flex items-center space-x-1 ${getChangeColor(dayChange)}`}>
            {dayChange > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : dayChange < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span className="font-medium">
              {dayChange > 0 ? '+' : ''}{formatCurrency(Math.abs(dayChange))} ({dayChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-400">Today's change</div>
      </div>

      {/* Overall Health Status */}
      <div className={`rounded-lg p-4 mb-6 ${healthStatus.bgColor} border backdrop-blur-sm`}>
        <div className="flex items-center space-x-3 mb-2">
          <HealthIcon className={`w-5 h-5 ${healthStatus.color}`} />
          <span className={`font-semibold ${healthStatus.color}`}>
            {healthStatus.status}
          </span>
        </div>
        <p className="text-sm text-gray-300">{healthStatus.description}</p>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {/* Portfolio Score */}
        <div className="text-center">
          <div className="mb-2">
            <BarChart3 className={`w-6 h-6 mx-auto ${getScoreColor(portfolioScore)}`} />
          </div>
          <div className={`text-lg font-bold ${getScoreColor(portfolioScore)}`}>
            {portfolioScore}
          </div>
          <div className="text-xs text-gray-400">Performance</div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                portfolioScore >= 80 ? 'bg-green-500' : 
                portfolioScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${portfolioScore}%` }}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div className="text-center">
          <div className="mb-2">
            <Shield className={`w-6 h-6 mx-auto ${getScoreColor(100 - riskScore)}`} />
          </div>
          <div className={`text-lg font-bold ${getScoreColor(100 - riskScore)}`}>
            {riskScore}
          </div>
          <div className="text-xs text-gray-400">Risk Level</div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                riskScore <= 30 ? 'bg-green-500' : 
                riskScore <= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>

        {/* Diversification Score */}
        <div className="text-center">
          <div className="mb-2">
            <PieChart className={`w-6 h-6 mx-auto ${getScoreColor(diversificationScore)}`} />
          </div>
          <div className={`text-lg font-bold ${getScoreColor(diversificationScore)}`}>
            {diversificationScore}
          </div>
          <div className="text-xs text-gray-400">Diversified</div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                diversificationScore >= 80 ? 'bg-green-500' : 
                diversificationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${diversificationScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center mt-6">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all duration-300 backdrop-blur-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Full Analysis</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PortfolioHealthCard;