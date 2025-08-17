// Portfolio Recommendations Engine - Generate personalized rebalancing advice

// Calculate asset allocation recommendations based on user profile and current holdings
const calculateAssetAllocationRecommendations = (userContext) => {
  const { user_profile, portfolio, investment_profile } = userContext;
  const age = user_profile.age || 30;
  const riskTolerance = investment_profile.risk_tolerance || 'moderate';
  const assetAllocation = portfolio.summary.asset_allocation;
  
  // Age-based equity allocation (rule of thumb: 100 - age = equity %)
  let targetEquityPercentage = Math.max(40, Math.min(80, 100 - age));
  
  // Adjust based on risk tolerance
  if (riskTolerance === 'aggressive') {
    targetEquityPercentage = Math.min(85, targetEquityPercentage + 15);
  } else if (riskTolerance === 'conservative') {
    targetEquityPercentage = Math.max(30, targetEquityPercentage - 20);
  }
  
  const currentEquityPercentage = (assetAllocation.stocks?.percentage || 0) + 
    (assetAllocation.mutual_funds?.percentage || 0) * 0.7; // Assuming 70% of MFs are equity
  
  const recommendations = [];
  
  // Asset allocation recommendations
  if (Math.abs(currentEquityPercentage - targetEquityPercentage) > 10) {
    const action = currentEquityPercentage > targetEquityPercentage ? 'reduce' : 'increase';
    const difference = Math.abs(currentEquityPercentage - targetEquityPercentage);
    
    recommendations.push({
      id: `asset_allocation_${action}_${Date.now()}`,
      type: action === 'reduce' ? 'reduce' : 'add',
      title: `${action === 'reduce' ? 'Reduce' : 'Increase'} Equity Allocation`,
      description: `Your equity allocation of ${currentEquityPercentage.toFixed(1)}% ${action === 'reduce' ? 'exceeds' : 'is below'} the recommended ${targetEquityPercentage}% for your age and risk profile.`,
      priority: difference > 20 ? 'high' : 'medium',
      impact_score: Math.min(100, difference * 4),
      current_allocation: Math.round(currentEquityPercentage),
      recommended_allocation: targetEquityPercentage,
      timeframe: difference > 20 ? '2-4 weeks' : '1-3 months',
      reasoning: [
        `Age-appropriate allocation for ${age} years old`,
        `Matches ${riskTolerance} risk tolerance`,
        action === 'reduce' ? 'Reduce portfolio volatility' : 'Enhance growth potential'
      ],
      risk_level: action === 'reduce' ? 'low' : 'medium'
    });
  }
  
  return recommendations;
};

// Analyze sector concentration and provide rebalancing recommendations
const analyzeSectorConcentration = (userContext) => {
  const { portfolio } = userContext;
  const stocks = portfolio.stocks || [];
  const recommendations = [];
  const portfolioValue = portfolio.summary.total_current_value;
  
  if (stocks.length === 0) return recommendations;
  
  // Calculate sector allocation
  const sectorAllocation = {};
  stocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!sectorAllocation[sector]) {
      sectorAllocation[sector] = { value: 0, percentage: 0, stocks: [] };
    }
    sectorAllocation[sector].value += stock.current_value;
    sectorAllocation[sector].stocks.push(stock);
  });
  
  // Calculate percentages
  Object.keys(sectorAllocation).forEach(sector => {
    sectorAllocation[sector].percentage = (sectorAllocation[sector].value / portfolioValue) * 100;
  });
  
  // Find overconcentrated sectors (>20% in single sector)
  Object.entries(sectorAllocation).forEach(([sector, data]) => {
    if (data.percentage > 20) {
      const stockSymbols = data.stocks.map(s => s.symbol).join(', ');
      
      recommendations.push({
        id: `sector_concentration_${sector}_${Date.now()}`,
        type: 'reduce',
        title: `Reduce ${sector} Sector Concentration`,
        description: `Your ${sector} exposure is ${data.percentage.toFixed(1)}% through ${stockSymbols}. Consider reducing to below 20% to minimize sector-specific risk.`,
        priority: data.percentage > 30 ? 'high' : 'medium',
        impact_score: Math.min(100, data.percentage * 3),
        current_allocation: Math.round(data.percentage),
        recommended_allocation: 18,
        timeframe: data.percentage > 30 ? '1-2 weeks' : '1-2 months',
        reasoning: [
          'Sector concentration creates single-point-of-failure risk',
          'Diversification across sectors improves risk-adjusted returns',
          `${sector} sector may face specific regulatory or economic challenges`
        ],
        risk_level: 'medium'
      });
    }
  });
  
  return recommendations;
};

// Analyze individual stock concentration
const analyzeStockConcentration = (userContext) => {
  const { portfolio } = userContext;
  const stocks = portfolio.stocks || [];
  const recommendations = [];
  const portfolioValue = portfolio.summary.total_current_value;
  
  // Find individual stocks that are >10% of portfolio
  const largePositions = stocks.filter(stock => 
    (stock.current_value / portfolioValue) * 100 > 10
  );
  
  largePositions.forEach(stock => {
    const positionPercent = (stock.current_value / portfolioValue) * 100;
    const targetPercent = 8; // Recommended max per stock
    
    recommendations.push({
      id: `stock_concentration_${stock.symbol}_${Date.now()}`,
      type: 'reduce',
      title: `Reduce ${stock.symbol} Position Size`,
      description: `${stock.company_name} represents ${positionPercent.toFixed(1)}% of your portfolio, creating concentration risk. Consider reducing to below 8%.`,
      priority: positionPercent > 15 ? 'high' : 'medium',
      impact_score: Math.min(100, positionPercent * 5),
      current_allocation: Math.round(positionPercent),
      recommended_allocation: targetPercent,
      amount_suggestion: Math.round((positionPercent - targetPercent) * portfolioValue / 100),
      timeframe: positionPercent > 15 ? '1-2 weeks' : '1-2 months',
      reasoning: [
        'Single stock concentration increases portfolio volatility',
        'Idiosyncratic risk from company-specific events',
        'Opportunity to diversify into other quality stocks'
      ],
      risk_level: 'medium'
    });
  });
  
  return recommendations;
};

// Analyze mutual fund performance and recommend switches
const analyzeMutualFundPerformance = (userContext) => {
  const { portfolio } = userContext;
  const mutualFunds = portfolio.mutual_funds || [];
  const recommendations = [];
  
  // Find underperforming funds (negative returns or very low returns)
  const underperformingFunds = mutualFunds.filter(fund => 
    (fund.gain_loss_percentage !== null && fund.gain_loss_percentage !== undefined && fund.gain_loss_percentage < 5) && 
    (fund.investment_amount || 0) > 50000
  );
  
  underperformingFunds.forEach(fund => {
    const isNegative = fund.gain_loss_percentage < 0;
    
    recommendations.push({
      id: `fund_performance_${fund.scheme_code}_${Date.now()}`,
      type: 'reduce',
      title: `Review ${fund.category || 'Mutual'} Fund Performance`,
      description: `Your ${(fund.scheme_name || 'mutual').split(' - ')[0]} fund ${isNegative ? 'has negative returns' : 'is underperforming'} at ${fund.gain_loss_percentage.toFixed(1)}%. Consider switching to better alternatives.`,
      priority: isNegative ? 'high' : 'medium',
      impact_score: Math.min(100, Math.abs(fund.gain_loss_percentage) * 8 + 30),
      current_allocation: fund.gain_loss_percentage,
      recommended_allocation: 12, // Target return
      timeframe: isNegative ? '2-4 weeks' : '3-6 months',
      reasoning: [
        `Current returns of ${fund.gain_loss_percentage.toFixed(1)}% are below expectations`,
        'Opportunity cost of staying in underperforming fund',
        'Better-performing alternatives available in same category'
      ],
      risk_level: 'low'
    });
  });
  
  // High expense ratio recommendations
  const highExpenseFunds = mutualFunds.filter(fund => (fund.expense_ratio || 0) > 1.0);
  
  highExpenseFunds.forEach(fund => {
    recommendations.push({
      id: `fund_expense_${fund.scheme_code}_${Date.now()}`,
      type: 'reduce',
      title: `Switch to Lower Cost ${fund.category || 'Mutual'} Fund`,
      description: `Your ${(fund.scheme_name || 'mutual').split(' - ')[0]} fund has a high expense ratio of ${fund.expense_ratio}%. Consider switching to direct plans or lower-cost alternatives.`,
      priority: 'medium',
      impact_score: 60,
      timeframe: '1-3 months',
      reasoning: [
        `High expense ratio of ${fund.expense_ratio}% reduces long-term returns`,
        'Direct plans typically have 0.5-1% lower expense ratios',
        'Cost savings compound significantly over time'
      ],
      risk_level: 'low'
    });
  });
  
  return recommendations;
};

// Analyze goal progress and generate recommendations
const analyzeGoalProgress = (userContext) => {
  const { financial_goals } = userContext;
  const goals = financial_goals?.goals || [];
  const recommendations = [];
  
  goals.forEach(goal => {
    const targetDate = new Date(goal.target_date);
    const monthsRemaining = Math.max(0, Math.round((targetDate - new Date()) / (1000 * 60 * 60 * 24 * 30)));
    const remainingAmount = goal.target_amount - goal.current_amount;
    const requiredMonthly = remainingAmount / Math.max(monthsRemaining, 1);
    
    // Goals that are behind schedule
    if (goal.progress_percentage < 30 && goal.priority === 'High' && monthsRemaining > 6) {
      recommendations.push({
        id: `goal_behind_${goal.id}_${Date.now()}`,
        type: 'goal_based',
        title: `Accelerate ${goal.name} Savings`,
        description: `Your ${goal.name} goal needs ₹${(remainingAmount/100000).toFixed(1)}L more. Consider increasing monthly allocation by ₹${Math.round(requiredMonthly/2).toLocaleString()}.`,
        priority: 'high',
        impact_score: 85,
        amount_suggestion: Math.round(requiredMonthly/2),
        timeframe: 'Immediate',
        reasoning: [
          `Only ${goal.progress_percentage.toFixed(1)}% complete with ${monthsRemaining} months left`,
          'Early action provides compounding advantage',
          'Meeting this goal is crucial for financial security'
        ],
        risk_level: 'low'
      });
    }
    
    // Goals close to completion
    if (goal.progress_percentage > 85 && goal.progress_percentage < 100) {
      recommendations.push({
        id: `goal_final_push_${goal.id}_${Date.now()}`,
        type: 'goal_based',
        title: `Final Push for ${goal.name}`,
        description: `You're ${goal.progress_percentage.toFixed(1)}% there! Just ₹${(remainingAmount/1000).toFixed(0)}K more needed. Consider a lump sum or increased SIP to complete this goal.`,
        priority: 'medium',
        impact_score: 75,
        amount_suggestion: Math.round(remainingAmount),
        timeframe: '1-2 months',
        reasoning: [
          'Goal is very close to completion',
          'Momentum advantage of achieving first goal',
          'Can redirect funds to other goals once completed'
        ],
        risk_level: 'low'
      });
    }
  });
  
  return recommendations;
};

// Calculate ideal rebalancing allocation
const calculateRebalanceData = (userContext) => {
  const { portfolio, user_profile, investment_profile } = userContext;
  const age = user_profile.age || 30;
  const riskTolerance = investment_profile.risk_tolerance || 'moderate';
  
  // Calculate current allocation from actual holdings
  const totalValue = portfolio.summary.total_current_value;
  const current = {};
  const recommended = {};
  const difference = {};
  
  // Current allocation
  const stocks = portfolio.stocks || [];
  const mutualFunds = portfolio.mutual_funds || [];
  
  // Group by categories
  let largeCap = 0;
  let midCap = 0;
  let smallCap = 0;
  let debt = 0;
  let international = 0;
  let gold = 0;
  
  // Analyze stock holdings
  stocks.forEach(stock => {
    const value = stock.current_value;
    // Assume large cap stocks (can be improved with actual market cap data)
    largeCap += value;
  });
  
  // Analyze mutual fund holdings
  mutualFunds.forEach(fund => {
    const value = fund.current_value;
    const category = (fund.category || 'Unknown').toLowerCase();
    
    if (category.includes('large')) largeCap += value;
    else if (category.includes('mid')) midCap += value;
    else if (category.includes('small')) smallCap += value;
    else if (category.includes('debt') || category.includes('bond')) debt += value;
    else if (category.includes('international')) international += value;
    else if (category.includes('gold')) gold += value;
    else largeCap += value * 0.7; // Default assumption for mixed funds
  });
  
  // Convert to percentages
  current['Large Cap'] = Math.round((largeCap / totalValue) * 100);
  current['Mid Cap'] = Math.round((midCap / totalValue) * 100);
  current['Small Cap'] = Math.round((smallCap / totalValue) * 100);
  current['Debt'] = Math.round((debt / totalValue) * 100);
  current['International'] = Math.round((international / totalValue) * 100);
  current['Gold'] = Math.round((gold / totalValue) * 100);
  
  // Recommended allocation based on age and risk tolerance
  let equityPercentage = Math.max(40, Math.min(80, 100 - age));
  
  if (riskTolerance === 'aggressive') {
    recommended['Large Cap'] = 35;
    recommended['Mid Cap'] = 25;
    recommended['Small Cap'] = 15;
    recommended['Debt'] = 15;
    recommended['International'] = 8;
    recommended['Gold'] = 2;
  } else if (riskTolerance === 'conservative') {
    recommended['Large Cap'] = 40;
    recommended['Mid Cap'] = 15;
    recommended['Small Cap'] = 5;
    recommended['Debt'] = 30;
    recommended['International'] = 5;
    recommended['Gold'] = 5;
  } else { // moderate
    recommended['Large Cap'] = 38;
    recommended['Mid Cap'] = 20;
    recommended['Small Cap'] = 10;
    recommended['Debt'] = 22;
    recommended['International'] = 7;
    recommended['Gold'] = 3;
  }
  
  // Calculate differences
  Object.keys(current).forEach(category => {
    difference[category] = recommended[category] - current[category];
  });
  
  return { current, recommended, difference };
};

// Main function to generate portfolio recommendations
const generatePortfolioRecommendations = (userContext) => {
  const recommendations = [];
  
  // Get recommendations from different analysis functions
  recommendations.push(...calculateAssetAllocationRecommendations(userContext));
  recommendations.push(...analyzeSectorConcentration(userContext));
  recommendations.push(...analyzeStockConcentration(userContext));
  recommendations.push(...analyzeMutualFundPerformance(userContext));
  recommendations.push(...analyzeGoalProgress(userContext));
  
  // Sort by priority and impact score
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.impact_score - a.impact_score;
  });
  
  // Calculate rebalance data
  const rebalanceData = calculateRebalanceData(userContext);
  
  return {
    recommendations: sortedRecommendations.slice(0, 8), // Limit to top 8 recommendations
    rebalance_data: rebalanceData,
    last_updated: new Date().toISOString(),
    next_review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
};

module.exports = {
  generatePortfolioRecommendations,
  calculateAssetAllocationRecommendations,
  analyzeSectorConcentration,
  analyzeStockConcentration,
  analyzeMutualFundPerformance,
  analyzeGoalProgress,
  calculateRebalanceData
};