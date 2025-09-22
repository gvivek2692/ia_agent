import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Shield, PiggyBank } from 'lucide-react';

interface HealthCategory {
  score: number;
  max_score: number;
  details: any;
  category: string;
}

interface KeyMetricsPanelProps {
  categories: HealthCategory[];
  overallScore: number;
}

interface MetricItem {
  icon: React.ElementType;
  label: string;
  value: string;
  target?: string;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'unknown';
  trend?: 'up' | 'down' | 'stable';
}

const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({ categories, overallScore }) => {
  
  // Helper function to format values consistently
  const formatValue = (value: number, type: 'percentage' | 'currency' | 'months' | 'score' | 'ratio') => {
    if (value === undefined || value === null) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
        return `₹${value.toLocaleString('en-IN')}`;
      case 'months':
        return `${value.toFixed(1)}mo`;
      case 'score':
        return Math.round(value).toString();
      case 'ratio':
        return `${value.toFixed(1)}x`;
      default:
        return value.toString();
    }
  };

  // Extract key metrics from all categories
  const getKeyMetrics = (): MetricItem[] => {
    const metrics: MetricItem[] = [];

    categories.forEach(category => {
      const categoryName = category.category;
      const details = category.details;

      if (!details) return;

      switch (categoryName) {
        case 'Income & Cash Flow':
          if (details.savings_rate?.value !== undefined) {
            metrics.push({
              icon: PiggyBank,
              label: 'Savings Rate',
              value: formatValue(details.savings_rate.value, 'percentage'),
              target: details.savings_rate.target ? `Target: ${details.savings_rate.target}%` : undefined,
              status: details.savings_rate.status || 'unknown',
              trend: details.savings_rate.value >= 25 ? 'up' : details.savings_rate.value >= 15 ? 'stable' : 'down'
            });
          }
          
          if (details.emergency_fund?.value !== undefined) {
            metrics.push({
              icon: Shield,
              label: 'Emergency Fund',
              value: formatValue(details.emergency_fund.value, 'months'),
              target: `Target: ${details.emergency_fund.target || 6}mo`,
              status: details.emergency_fund.status || 'unknown',
              trend: details.emergency_fund.value >= 6 ? 'up' : details.emergency_fund.value >= 3 ? 'stable' : 'down'
            });
          }
          break;

        case 'Asset Allocation & Investments':
          if (details.equity_allocation?.current !== undefined) {
            metrics.push({
              icon: TrendingUp,
              label: 'Equity Allocation',
              value: formatValue(details.equity_allocation.current, 'percentage'),
              target: details.equity_allocation.recommended_min && details.equity_allocation.recommended_max 
                ? `Target: ${details.equity_allocation.recommended_min}-${details.equity_allocation.recommended_max}%`
                : undefined,
              status: details.equity_allocation.status === 'optimal' ? 'excellent' : 
                     details.equity_allocation.status === 'too_conservative' ? 'poor' : 'average'
            });
          }
          break;

        case 'Liabilities & Credit':
          if (details.credit_score?.score !== undefined) {
            metrics.push({
              icon: DollarSign,
              label: 'Credit Score',
              value: formatValue(details.credit_score.score, 'score'),
              target: details.credit_score.source ? `${details.credit_score.source}` : undefined,
              status: details.credit_score.status || 'unknown',
              trend: details.credit_score.score >= 750 ? 'up' : details.credit_score.score >= 650 ? 'stable' : 'down'
            });
          }
          
          if (details.debt_to_income_ratio?.value !== undefined) {
            metrics.push({
              icon: Minus,
              label: 'Debt-to-Income',
              value: formatValue(details.debt_to_income_ratio.value, 'percentage'),
              target: `Target: <30%`,
              status: details.debt_to_income_ratio.status || 'unknown',
              trend: details.debt_to_income_ratio.value <= 30 ? 'up' : details.debt_to_income_ratio.value <= 50 ? 'stable' : 'down'
            });
          }
          break;

        case 'Risk Protection':
          if (details.life_insurance?.value !== undefined) {
            metrics.push({
              icon: Shield,
              label: 'Life Insurance',
              value: formatValue(details.life_insurance.value, 'currency'),
              target: details.life_insurance.target_coverage 
                ? `Target: ${formatValue(details.life_insurance.target_coverage, 'currency')}`
                : undefined,
              status: details.life_insurance.status || 'unknown'
            });
          }
          break;

        case 'Tax Efficiency & Estate':
          if (details.section_80c_investments?.value !== undefined) {
            metrics.push({
              icon: DollarSign,
              label: '80C Investments',
              value: formatValue(details.section_80c_investments.value, 'currency'),
              target: 'Limit: ₹1.5L',
              status: details.section_80c_investments.status || 'unknown'
            });
          }
          break;
      }
    });

    return metrics.slice(0, 6); // Show top 6 metrics
  };

  const keyMetrics = getKeyMetrics();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'good':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'average':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'poor':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg border border-gold-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Key Financial Metrics</h2>
          <p className="text-sm text-gray-300">Your most important financial indicators at a glance</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gold-400">{overallScore}</div>
          <div className="text-xs text-gray-400">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:border-opacity-60 ${getStatusColor(metric.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium text-white">{metric.label}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="mb-1">
                <div className="text-lg font-bold text-white">{metric.value}</div>
                {metric.target && (
                  <div className="text-xs text-gray-400">{metric.target}</div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(metric.status)}`}>
                  {metric.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {keyMetrics.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No metrics available</div>
          <p className="text-sm text-gray-500">Complete your financial profile to see key metrics</p>
        </div>
      )}
    </div>
  );
};

export default KeyMetricsPanel;