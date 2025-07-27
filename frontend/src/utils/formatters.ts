/**
 * Utility functions for formatting financial data in Indian context
 */

// Format currency in Indian Rupees with proper notation
export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
  }
  
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format percentage with proper styling
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format large numbers in Indian numbering system
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

// Format gain/loss with color coding
export const formatGainLoss = (amount: number, percentage: number): {
  amount: string;
  percentage: string;
  isGain: boolean;
  colorClass: string;
} => {
  const isGain = amount >= 0;
  return {
    amount: `${isGain ? '+' : ''}${formatCurrency(amount)}`,
    percentage: `${isGain ? '+' : ''}${formatPercentage(percentage)}`,
    isGain,
    colorClass: isGain ? 'text-green-600' : 'text-red-600'
  };
};

// Format date in Indian format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Format time period
export const formatTimePeriod = (months: number): string => {
  if (months >= 12) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years}y ${remainingMonths}m`;
  }
  return `${months} month${months > 1 ? 's' : ''}`;
};

// Format asset allocation percentage
export const formatAllocation = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

// Format SIP amount
export const formatSIP = (amount: number): string => {
  return `₹${formatNumber(amount)}/month`;
};

// Format portfolio summary for display
export const formatPortfolioSummary = (portfolio: any) => {
  return {
    totalValue: formatCurrency(portfolio.total_current_value),
    totalInvestment: formatCurrency(portfolio.total_investment),
    totalGains: formatGainLoss(portfolio.total_gain_loss, parseFloat(portfolio.gain_loss_percentage)),
    stocks: {
      value: formatCurrency(portfolio.asset_allocation.stocks.value),
      percentage: formatAllocation(parseFloat(portfolio.asset_allocation.stocks.percentage))
    },
    mutualFunds: {
      value: formatCurrency(portfolio.asset_allocation.mutual_funds.value),
      percentage: formatAllocation(parseFloat(portfolio.asset_allocation.mutual_funds.percentage))
    },
    ppf: {
      value: formatCurrency(portfolio.asset_allocation.ppf.value),
      percentage: formatAllocation(parseFloat(portfolio.asset_allocation.ppf.percentage))
    }
  };
};

// Format goal progress
export const formatGoalProgress = (goal: any) => {
  return {
    name: goal.name,
    current: formatCurrency(goal.current_amount),
    target: formatCurrency(goal.target_amount),
    progress: formatPercentage(goal.progress_percentage),
    monthly: formatCurrency(goal.monthly_target),
    remaining: formatCurrency(goal.target_amount - goal.current_amount),
    timeline: formatTimePeriod(goal.timeline.months_remaining)
  };
};