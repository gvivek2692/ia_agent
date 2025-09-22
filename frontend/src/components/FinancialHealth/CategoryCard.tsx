import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface CategoryCardProps {
  category: {
    score: number;
    max_score: number;
    details: any;
    category: string;
  };
  unlockOpportunities: any[];
  onUnlockOpportunity: (opportunity: any) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  unlockOpportunities,
  onUnlockOpportunity
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const percentage = Math.round((category.score / category.max_score) * 100);
  const hasUnlockOpportunities = unlockOpportunities.length > 0;
  const totalPossibleGain = unlockOpportunities.reduce((sum, opp) => sum + opp.potential_gain, 0);
  
  // Determine card status and styling
  const getCardStatus = () => {
    if (hasUnlockOpportunities && category.score < category.max_score * 0.7) {
      return {
        status: 'unlock_available',
        bgClass: 'bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-amber-500/30',
        textClass: 'text-amber-400',
        icon: Lock
      };
    } else if (percentage >= 80) {
      return {
        status: 'excellent',
        bgClass: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/30',
        textClass: 'text-green-400',
        icon: CheckCircle
      };
    } else if (percentage >= 60) {
      return {
        status: 'good',
        bgClass: 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30',
        textClass: 'text-blue-400',
        icon: TrendingUp
      };
    } else {
      return {
        status: 'needs_attention',
        bgClass: 'bg-gradient-to-br from-red-500/10 to-pink-600/10 border-red-500/30',
        textClass: 'text-red-400',
        icon: AlertCircle
      };
    }
  };

  const cardStatus = getCardStatus();
  const StatusIcon = cardStatus.icon;

  const formatCategoryName = (name: string) => {
    return name.replace(/&/g, '&').replace(/ & /g, ' & ');
  };

  // Helper function to format financial values
  const formatValue = (value: number, type: 'percentage' | 'currency' | 'months' | 'score' | 'ratio') => {
    if (value === undefined || value === null) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `₹${value.toLocaleString('en-IN')}`;
      case 'months':
        return `${value.toFixed(1)} months`;
      case 'score':
        return Math.round(value).toString();
      case 'ratio':
        return `${value.toFixed(2)}x`;
      default:
        return value.toString();
    }
  };

  // Extract key metric for prominent display
  const getKeyMetric = () => {
    if (!category.details) return null;
    
    const categoryName = category.category;
    
    switch (categoryName) {
      case 'Income & Cash Flow':
        if (category.details.savings_rate?.value !== undefined) {
          return {
            label: 'Savings Rate',
            value: formatValue(category.details.savings_rate.value, 'percentage'),
            target: category.details.savings_rate.target ? `Target: ${category.details.savings_rate.target}%` : null,
            status: category.details.savings_rate.status
          };
        }
        if (category.details.expense_ratio?.value !== undefined) {
          return {
            label: 'Expense Ratio',
            value: formatValue(category.details.expense_ratio.value, 'percentage'),
            target: category.details.expense_ratio.target ? `Target: <${category.details.expense_ratio.target}%` : null,
            status: category.details.expense_ratio.status
          };
        }
        break;
        
      case 'Asset Allocation & Investments':
        if (category.details.equity_allocation?.current !== undefined) {
          const current = category.details.equity_allocation.current;
          const min = category.details.equity_allocation.recommended_min;
          const max = category.details.equity_allocation.recommended_max;
          return {
            label: 'Equity Allocation',
            value: formatValue(current, 'percentage'),
            target: min && max ? `Target: ${min}-${max}%` : null,
            status: category.details.equity_allocation.status
          };
        }
        break;
        
      case 'Liabilities & Credit':
        if (category.details.credit_score?.score !== undefined) {
          return {
            label: 'Credit Score',
            value: formatValue(category.details.credit_score.score, 'score'),
            target: category.details.credit_score.source ? `(${category.details.credit_score.source})` : null,
            status: category.details.credit_score.status
          };
        }
        break;
        
      case 'Risk Protection':
        if (category.details.life_insurance?.value !== undefined) {
          return {
            label: 'Life Insurance',
            value: formatValue(category.details.life_insurance.value, 'currency'),
            target: category.details.life_insurance.target_coverage ? `Target: ${formatValue(category.details.life_insurance.target_coverage, 'currency')}` : null,
            status: category.details.life_insurance.status
          };
        }
        break;
        
      case 'Tax Efficiency & Estate':
        if (category.details.section_80c_investments?.value !== undefined) {
          return {
            label: '80C Investments',
            value: formatValue(category.details.section_80c_investments.value, 'currency'),
            target: 'Limit: ₹1.5L',
            status: category.details.section_80c_investments.status
          };
        }
        break;
        
      case 'Goal Planning & Progress':
        // Show overall goal progress if available
        const goalKeys = Object.keys(category.details).filter(key => key.includes('goal'));
        if (goalKeys.length > 0) {
          return {
            label: 'Active Goals',
            value: `${goalKeys.length} goals`,
            target: 'On track',
            status: 'good'
          };
        }
        break;
    }
    
    return null;
  };

  const keyMetric = getKeyMetric();

  const renderDetailMetric = (key: string, detail: any) => {
    if (typeof detail !== 'object' || !detail) return null;
    
    const formatKey = (k: string) => {
      return k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    if (detail.status === 'unlock_opportunity') {
      return (
        <div key={key} className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">{formatKey(key)}</p>
            <p className="text-xs text-gray-400">{detail.recommendation}</p>
          </div>
          <div className="text-right">
            <div className="text-amber-400 text-xs font-medium">+{detail.potential_points} pts</div>
            <Lock className="w-4 h-4 text-amber-400 ml-auto mt-1" />
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
        <div>
          <p className="text-sm font-medium text-white">{formatKey(key)}</p>
          {detail.value !== undefined && (
            <p className="text-xs text-gray-400">
              Current: {typeof detail.value === 'number' ? detail.value.toFixed(1) : detail.value}
              {detail.target && ` | Target: ${detail.target}`}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className={`text-xs font-medium ${
            detail.status === 'excellent' ? 'text-green-400' :
            detail.status === 'good' ? 'text-blue-400' :
            detail.status === 'average' ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {detail.status?.replace(/_/g, ' ')?.toUpperCase()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${cardStatus.bgClass} backdrop-blur-lg border rounded-xl p-4 transition-all duration-300 hover:border-opacity-60`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${cardStatus.textClass}`} />
          <h3 className="font-semibold text-white text-sm">{formatCategoryName(category.category)}</h3>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {category.score}<span className="text-gray-400 text-sm">/{category.max_score}</span>
          </div>
          <div className="text-xs text-gray-400">{percentage}%</div>
        </div>
      </div>

      {/* Key Metric Display */}
      {keyMetric && (
        <div className="mb-3 p-2 bg-black/20 rounded-lg border border-gray-600/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-300">{keyMetric.label}</div>
              <div className="text-lg font-bold text-white">{keyMetric.value}</div>
              {keyMetric.target && (
                <div className="text-xs text-gray-400">{keyMetric.target}</div>
              )}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded ${
              keyMetric.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
              keyMetric.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
              keyMetric.status === 'average' ? 'bg-yellow-500/20 text-yellow-400' :
              keyMetric.status === 'poor' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {keyMetric.status?.replace(/_/g, ' ')?.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-green-400' :
              percentage >= 60 ? 'bg-blue-400' :
              percentage >= 40 ? 'bg-yellow-400' :
              'bg-red-400'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Status & Unlock Button */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${cardStatus.textClass}`}>
          {cardStatus.status.replace(/_/g, ' ').toUpperCase()}
        </span>
        
        {hasUnlockOpportunities && (
          <button
            onClick={() => unlockOpportunities[0] && onUnlockOpportunity(unlockOpportunities[0])}
            className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md hover:bg-amber-500/30 transition-colors border border-amber-500/30"
          >
            +{totalPossibleGain} pts available
          </button>
        )}
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center text-gray-400 hover:text-white transition-colors py-2"
      >
        <span className="text-xs mr-2">
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-gray-600 pt-4">
          {category.details && Object.entries(category.details).map(([key, detail]) => 
            renderDetailMetric(key, detail)
          )}
          
          {hasUnlockOpportunities && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-amber-400 mb-2">Available Improvements:</h4>
              <div className="space-y-2">
                {unlockOpportunities.map((opportunity, index) => (
                  <button
                    key={index}
                    onClick={() => onUnlockOpportunity(opportunity)}
                    className="w-full text-left p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/15 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">{opportunity.title}</p>
                        <p className="text-xs text-gray-400">{opportunity.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 text-xs font-medium">+{opportunity.potential_gain} pts</div>
                        <div className="text-gray-400 text-xs capitalize">{opportunity.effort_level} effort</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;