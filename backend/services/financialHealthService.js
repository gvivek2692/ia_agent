/**
 * Financial Health Calculation Service
 * Calculates comprehensive financial health score with adaptive scoring for missing data
 */

// Helper function to safely calculate percentage
const safePercentage = (numerator, denominator) => {
  if (!denominator || denominator === 0) return 0;
  return Math.min(100, Math.max(0, (numerator / denominator) * 100));
};

// Helper function to calculate months between dates
const monthsBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
};

// Age-based equity allocation recommendations
const getRecommendedEquityAllocation = (age) => {
  if (age <= 25) return { min: 70, max: 90 };
  if (age <= 35) return { min: 60, max: 80 };
  if (age <= 45) return { min: 50, max: 70 };
  if (age <= 55) return { min: 40, max: 60 };
  return { min: 30, max: 50 };
};

/**
 * Calculate Income & Cash Flow Score (20 points)
 */
const calculateIncomeHealthScore = (userContext) => {
  const { user_profile, financial_profile, monthly_expenses, banking } = userContext;
  let score = 0;
  const details = {};
  
  // Monthly savings rate (8 points)
  if (financial_profile?.take_home && monthly_expenses?.total) {
    const savingsRate = ((financial_profile.take_home - monthly_expenses.total) / financial_profile.take_home) * 100;
    details.savings_rate = {
      value: savingsRate,
      target: 25,
      status: savingsRate >= 25 ? 'excellent' : savingsRate >= 20 ? 'good' : savingsRate >= 15 ? 'average' : 'poor'
    };
    
    if (savingsRate >= 25) score += 8;
    else if (savingsRate >= 20) score += 6;
    else if (savingsRate >= 15) score += 4;
    else if (savingsRate >= 10) score += 2;
  } else {
    details.savings_rate = { status: 'unlock_opportunity', potential_points: 8 };
  }
  
  // Expense ratio (4 points)
  if (financial_profile?.take_home && monthly_expenses?.total) {
    const expenseRatio = (monthly_expenses.total / financial_profile.take_home) * 100;
    details.expense_ratio = {
      value: expenseRatio,
      target: 60,
      status: expenseRatio <= 60 ? 'excellent' : expenseRatio <= 70 ? 'good' : expenseRatio <= 80 ? 'average' : 'poor'
    };
    
    if (expenseRatio <= 60) score += 4;
    else if (expenseRatio <= 70) score += 3;
    else if (expenseRatio <= 80) score += 2;
    else score += 1;
  } else {
    details.expense_ratio = { status: 'unlock_opportunity', potential_points: 4 };
  }
  
  // Emergency fund adequacy (5 points)
  if (banking?.current_emergency_fund && monthly_expenses?.total) {
    const monthsCovered = banking.current_emergency_fund / monthly_expenses.total;
    details.emergency_fund = {
      value: monthsCovered,
      target: 6,
      status: monthsCovered >= 6 ? 'excellent' : monthsCovered >= 4 ? 'good' : monthsCovered >= 2 ? 'average' : 'poor'
    };
    
    if (monthsCovered >= 6) score += 5;
    else if (monthsCovered >= 4) score += 4;
    else if (monthsCovered >= 3) score += 3;
    else if (monthsCovered >= 2) score += 2;
    else if (monthsCovered >= 1) score += 1;
  } else {
    details.emergency_fund = { status: 'unlock_opportunity', potential_points: 5 };
  }
  
  // Income diversity (3 points)
  if (financial_profile?.other_income && financial_profile?.take_home) {
    const diversityRatio = (financial_profile.other_income / financial_profile.take_home) * 100;
    details.income_diversity = {
      value: diversityRatio,
      status: diversityRatio > 10 ? 'excellent' : diversityRatio > 5 ? 'good' : diversityRatio > 0 ? 'average' : 'poor'
    };
    
    if (diversityRatio > 10) score += 3;
    else if (diversityRatio > 5) score += 2;
    else if (diversityRatio > 0) score += 1;
  } else {
    details.income_diversity = { status: 'single_source', potential_points: 3 };
  }
  
  return { score, max_score: 20, details, category: 'Income & Cash Flow' };
};

/**
 * Calculate Asset Allocation & Investment Score (25 points)
 */
const calculateAssetAllocationScore = (userContext) => {
  const { portfolio, user_profile, investment_profile } = userContext;
  let score = 0;
  const details = {};
  
  if (!portfolio?.summary) {
    return {
      score: 0,
      max_score: 25,
      details: { status: 'no_portfolio' },
      category: 'Asset Allocation & Investments'
    };
  }
  
  const age = user_profile?.age || 30;
  const assetAllocation = portfolio.summary.asset_allocation || {};
  const totalValue = portfolio.summary.total_current_value || 0;
  
  // Equity allocation appropriateness (10 points)
  const equityPercentage = assetAllocation.equity?.percentage || 0;
  const recommendedEquity = getRecommendedEquityAllocation(age);
  
  details.equity_allocation = {
    current: equityPercentage,
    recommended_min: recommendedEquity.min,
    recommended_max: recommendedEquity.max,
    status: equityPercentage >= recommendedEquity.min && equityPercentage <= recommendedEquity.max ? 'optimal' :
            equityPercentage < recommendedEquity.min ? 'too_conservative' : 'too_aggressive'
  };
  
  if (equityPercentage >= recommendedEquity.min && equityPercentage <= recommendedEquity.max) {
    score += 10;
  } else {
    const deviation = Math.min(
      Math.abs(equityPercentage - recommendedEquity.min),
      Math.abs(equityPercentage - recommendedEquity.max)
    );
    score += Math.max(0, 10 - Math.floor(deviation / 5));
  }
  
  // Debt allocation balance (5 points)
  const debtPercentage = assetAllocation.debt?.percentage || 0;
  details.debt_allocation = {
    current: debtPercentage,
    status: debtPercentage >= 10 && debtPercentage <= 40 ? 'balanced' :
            debtPercentage < 10 ? 'too_low' : 'too_high'
  };
  
  if (debtPercentage >= 10 && debtPercentage <= 40) score += 5;
  else if (debtPercentage >= 5 && debtPercentage <= 50) score += 3;
  else score += 1;
  
  // Portfolio liquidity (5 points)
  const liquidPercentage = (assetAllocation.cash?.percentage || 0) + (assetAllocation.debt?.percentage || 0);
  details.liquidity = {
    current: liquidPercentage,
    target: 20,
    status: liquidPercentage >= 20 ? 'adequate' : liquidPercentage >= 10 ? 'moderate' : 'low'
  };
  
  if (liquidPercentage >= 20) score += 5;
  else if (liquidPercentage >= 15) score += 4;
  else if (liquidPercentage >= 10) score += 3;
  else if (liquidPercentage >= 5) score += 2;
  else score += 1;
  
  // Diversification (5 points)
  const holdings = [...(portfolio.stocks || []), ...(portfolio.mutual_funds || [])];
  const largestHolding = holdings.reduce((max, holding) => {
    const percentage = (holding.current_value / totalValue) * 100;
    return Math.max(max, percentage);
  }, 0);
  
  details.diversification = {
    largest_holding_percentage: largestHolding,
    status: largestHolding <= 20 ? 'well_diversified' : largestHolding <= 30 ? 'moderate' : 'concentrated'
  };
  
  if (largestHolding <= 20) score += 5;
  else if (largestHolding <= 30) score += 3;
  else if (largestHolding <= 40) score += 2;
  else score += 1;
  
  return { score, max_score: 25, details, category: 'Asset Allocation & Investments' };
};

/**
 * Calculate Risk Protection Score (15 points)
 */
const calculateRiskProtectionScore = (userContext) => {
  const { user_profile, financial_profile, risk_protection } = userContext;
  let score = 0;
  const details = {};
  
  // Life Insurance (6 points)
  if (risk_protection?.life_insurance?.coverage_amount) {
    const coverage = risk_protection.life_insurance.coverage_amount;
    const targetCoverage = financial_profile?.annual_ctc ? financial_profile.annual_ctc * 10 : 5000000;
    const adequacyRatio = coverage / targetCoverage;
    
    details.life_insurance = {
      value: coverage,
      target_coverage: targetCoverage,
      adequacy_ratio: adequacyRatio,
      insurance_type: risk_protection.life_insurance.insurance_type,
      status: adequacyRatio >= 1 ? 'excellent' : adequacyRatio >= 0.7 ? 'good' : adequacyRatio >= 0.5 ? 'average' : 'poor'
    };
    
    if (adequacyRatio >= 1) score += 6;
    else if (adequacyRatio >= 0.7) score += 5;
    else if (adequacyRatio >= 0.5) score += 4;
    else if (adequacyRatio >= 0.3) score += 3;
    else score += 2;
  } else {
    details.life_insurance = {
      status: 'unlock_opportunity',
      potential_points: 6,
      recommendation: 'Add life insurance details to unlock 6 points',
      target_coverage: financial_profile?.annual_ctc ? financial_profile.annual_ctc * 10 : 'N/A'
    };
  }
  
  // Health Insurance (5 points)
  if (risk_protection?.health_insurance?.coverage_amount) {
    const coverage = risk_protection.health_insurance.coverage_amount;
    const targetCoverage = 1000000; // ₹10L minimum recommended
    
    details.health_insurance = {
      value: coverage,
      target_coverage: targetCoverage,
      coverage_type: risk_protection.health_insurance.coverage_type,
      status: coverage >= 2000000 ? 'excellent' : coverage >= 1000000 ? 'good' : coverage >= 500000 ? 'average' : 'poor'
    };
    
    if (coverage >= 2000000) score += 5;
    else if (coverage >= 1000000) score += 4;
    else if (coverage >= 500000) score += 3;
    else if (coverage >= 300000) score += 2;
    else score += 1;
  } else {
    details.health_insurance = {
      status: 'unlock_opportunity',
      potential_points: 5,
      recommendation: 'Add health insurance details to unlock 5 points',
      target_coverage: '₹10-20L family floater'
    };
  }
  
  // Disability Insurance (4 points) - still unlock opportunity for now
  details.disability_insurance = {
    status: 'unlock_opportunity',
    potential_points: 4,
    recommendation: 'Consider disability insurance to unlock 4 points'
  };
  
  return { score, max_score: 15, details, category: 'Risk Protection' };
};

/**
 * Calculate Liabilities & Credit Score (10 points)
 */
const calculateLiabilitiesScore = (userContext) => {
  const { liabilities, financial_profile } = userContext;
  let score = 0;
  const details = {};
  
  // Credit Score (3 points)
  if (liabilities?.credit_score?.score) {
    const creditScore = liabilities.credit_score.score;
    
    details.credit_score = {
      value: creditScore,
      source: liabilities.credit_score.source,
      status: creditScore >= 750 ? 'excellent' : creditScore >= 700 ? 'good' : creditScore >= 650 ? 'fair' : 'poor'
    };
    
    if (creditScore >= 750) score += 3;
    else if (creditScore >= 700) score += 2;
    else if (creditScore >= 650) score += 1;
    // else 0 points for score < 650
  } else {
    details.credit_score = {
      status: 'unlock_opportunity',
      potential_points: 3,
      recommendation: 'Add CIBIL score to unlock 3 points'
    };
  }
  
  // Debt-to-Income Ratio (4 points)
  const monthlyEMI = (liabilities?.home_loan?.monthly_emi || 0) + 
                    (liabilities?.personal_loan?.monthly_emi || 0);
  
  if (monthlyEMI > 0 && financial_profile?.take_home) {
    const debtToIncomeRatio = (monthlyEMI / financial_profile.take_home) * 100;
    
    details.debt_to_income = {
      value: debtToIncomeRatio,
      monthly_emi: monthlyEMI,
      status: debtToIncomeRatio <= 20 ? 'excellent' : 
              debtToIncomeRatio <= 30 ? 'good' : 
              debtToIncomeRatio <= 40 ? 'fair' : 'poor'
    };
    
    if (debtToIncomeRatio <= 20) score += 4;
    else if (debtToIncomeRatio <= 30) score += 3;
    else if (debtToIncomeRatio <= 40) score += 2;
    else score += 1;
  } else {
    details.debt_to_income = {
      status: 'unlock_opportunity',
      potential_points: 4,
      recommendation: 'Add loan/EMI details to unlock 4 points'
    };
  }
  
  // Credit Utilization (3 points)
  if (liabilities?.credit_card?.outstanding_amount !== undefined) {
    const outstanding = liabilities.credit_card.outstanding_amount;
    
    details.credit_utilization = {
      value: outstanding,
      status: outstanding === 0 ? 'excellent' : 
              outstanding <= 50000 ? 'good' : 
              outstanding <= 100000 ? 'fair' : 'poor'
    };
    
    if (outstanding === 0) score += 3;
    else if (outstanding <= 50000) score += 2;
    else if (outstanding <= 100000) score += 1;
    // else 0 points for high outstanding
  } else {
    details.credit_utilization = {
      status: 'unlock_opportunity',
      potential_points: 3,
      recommendation: 'Add credit card details to unlock 3 points'
    };
  }
  
  return { score, max_score: 10, details, category: 'Liabilities & Credit' };
};

/**
 * Calculate Goal Planning Score (15 points)
 */
const calculateGoalPlanningScore = (userContext) => {
  const { goals } = userContext;
  let score = 0;
  const details = {};
  
  if (!goals?.goals || goals.goals.length === 0) {
    details.goal_clarity = {
      status: 'no_goals',
      potential_points: 5,
      recommendation: 'Define financial goals to unlock 5 points'
    };
    details.goal_funding = {
      status: 'no_goals',
      potential_points: 7,
      recommendation: 'Set up goal funding to unlock 7 points'
    };
    details.retirement_planning = {
      status: 'no_goals',
      potential_points: 3,
      recommendation: 'Add retirement planning to unlock 3 points'
    };
    return { score, max_score: 15, details, category: 'Goal Planning & Progress' };
  }
  
  // Goal clarity (5 points)
  const definedGoals = goals.goals.filter(goal => goal.target_amount && goal.target_date);
  details.goal_clarity = {
    defined_goals: definedGoals.length,
    total_goals: goals.goals.length,
    status: definedGoals.length >= 3 ? 'excellent' : definedGoals.length >= 2 ? 'good' : definedGoals.length >= 1 ? 'average' : 'poor'
  };
  
  if (definedGoals.length >= 3) score += 5;
  else if (definedGoals.length >= 2) score += 4;
  else if (definedGoals.length >= 1) score += 3;
  
  // Goal funding ratio (7 points)
  let totalProgress = 0;
  let goalCount = 0;
  
  definedGoals.forEach(goal => {
    if (goal.progress_percentage !== undefined) {
      totalProgress += goal.progress_percentage;
      goalCount++;
    }
  });
  
  const averageProgress = goalCount > 0 ? totalProgress / goalCount : 0;
  details.goal_funding = {
    average_progress: averageProgress,
    status: averageProgress >= 70 ? 'on_track' : averageProgress >= 50 ? 'moderate' : 'behind'
  };
  
  if (averageProgress >= 70) score += 7;
  else if (averageProgress >= 50) score += 5;
  else if (averageProgress >= 30) score += 3;
  else if (averageProgress >= 10) score += 2;
  
  // Retirement planning (3 points)
  const retirementGoal = goals.goals.find(goal => 
    goal.id.includes('retirement') || goal.name.toLowerCase().includes('retirement')
  );
  
  details.retirement_planning = {
    has_retirement_goal: !!retirementGoal,
    status: retirementGoal ? 'defined' : 'missing'
  };
  
  if (retirementGoal) score += 3;
  
  return { score, max_score: 15, details, category: 'Goal Planning & Progress' };
};

/**
 * Calculate Tax Efficiency Score (10 points)
 */
const calculateTaxEfficiencyScore = (userContext) => {
  const { tax_planning } = userContext;
  let score = 0;
  const details = {};
  
  // Section 80C Investments (5 points)
  if (tax_planning?.section_80c?.annual_investment) {
    const investment = tax_planning.section_80c.annual_investment;
    const maxLimit = 150000; // ₹1.5L annual limit for 80C
    
    details.section_80c = {
      value: investment,
      max_limit: maxLimit,
      utilization_percentage: Math.min((investment / maxLimit) * 100, 100),
      status: investment >= maxLimit ? 'excellent' : 
              investment >= 100000 ? 'good' : 
              investment >= 50000 ? 'moderate' : 'basic'
    };
    
    if (investment >= maxLimit) score += 5;
    else if (investment >= 100000) score += 4;
    else if (investment >= 50000) score += 3;
    else score += 2;
  } else {
    details.section_80c = {
      status: 'unlock_opportunity',
      potential_points: 5,
      recommendation: 'Add Section 80C investments to unlock 5 points'
    };
  }
  
  // Additional Tax Planning Instruments (5 points)
  let additionalInstruments = 0;
  let totalAdditionalInvestment = 0;
  
  // NPS Contributions (80CCD(1B))
  if (tax_planning?.nps?.annual_contribution) {
    additionalInstruments++;
    totalAdditionalInvestment += tax_planning.nps.annual_contribution;
  }
  
  // Health Insurance Premium (80D)
  if (tax_planning?.section_80d?.annual_premium) {
    additionalInstruments++;
    totalAdditionalInvestment += tax_planning.section_80d.annual_premium;
  }
  
  if (additionalInstruments > 0) {
    details.additional_tax_planning = {
      instruments_count: additionalInstruments,
      total_investment: totalAdditionalInvestment,
      status: additionalInstruments >= 2 ? 'comprehensive' : 'basic'
    };
    
    if (additionalInstruments >= 2) score += 5;
    else score += 3;
  } else {
    details.additional_tax_planning = {
      status: 'unlock_opportunity',
      potential_points: 5,
      recommendation: 'Add NPS, health insurance premium details to unlock 5 points'
    };
  }
  
  return { score, max_score: 10, details, category: 'Tax Efficiency & Estate' };
};

/**
 * Calculate Behavioral Discipline Score (5 points)
 */
const calculateBehavioralScore = (userContext) => {
  const { investment_profile, portfolio } = userContext;
  let score = 0;
  const details = {};
  
  // Portfolio review frequency (3 points)
  if (investment_profile?.started_investing) {
    const monthsInvesting = monthsBetween(investment_profile.started_investing, new Date());
    details.investment_experience = {
      months: monthsInvesting,
      status: monthsInvesting >= 24 ? 'experienced' : monthsInvesting >= 12 ? 'intermediate' : 'beginner'
    };
    
    if (monthsInvesting >= 24) score += 2;
    else if (monthsInvesting >= 12) score += 1;
  }
  
  // Rebalancing behavior (2 points)
  if (portfolio?.stocks && portfolio?.mutual_funds) {
    const hasBalance = portfolio.stocks.length > 0 && portfolio.mutual_funds.length > 0;
    details.diversification_behavior = {
      has_mixed_portfolio: hasBalance,
      status: hasBalance ? 'diversified' : 'concentrated'
    };
    
    if (hasBalance) score += 3;
    else score += 1;
  }
  
  return { score, max_score: 5, details, category: 'Behavioral & Monitoring Discipline' };
};

/**
 * Identify unlock opportunities based on missing data
 */
const identifyUnlockOpportunities = (healthData) => {
  const opportunities = [];
  
  // Risk Protection - highest impact
  const riskCategory = healthData.categories.find(cat => cat.category === 'Risk Protection');
  if (riskCategory && riskCategory.score < 10) {
    opportunities.push({
      category: 'Risk Protection',
      title: 'Complete Insurance Profile',
      description: 'Add life and health insurance details',
      potential_gain: 15,
      effort_level: 'medium',
      data_needed: ['life_insurance_amount', 'health_insurance_details'],
      priority: 1
    });
  }
  
  // Liabilities & Credit
  const creditCategory = healthData.categories.find(cat => cat.category === 'Liabilities & Credit');
  if (creditCategory && creditCategory.score < 5) {
    opportunities.push({
      category: 'Liabilities & Credit',
      title: 'Add Credit & Debt Information',
      description: 'Include loan details and credit score',
      potential_gain: 10,
      effort_level: 'easy',
      data_needed: ['loans', 'credit_score', 'emi_details'],
      priority: 2
    });
  }
  
  // Tax Efficiency
  const taxCategory = healthData.categories.find(cat => cat.category === 'Tax Efficiency & Estate');
  if (taxCategory && taxCategory.score < 5) {
    opportunities.push({
      category: 'Tax Efficiency & Estate',
      title: 'Optimize Tax Planning',
      description: 'Review tax-saving investments and estate planning',
      potential_gain: 10,
      effort_level: 'medium',
      data_needed: ['tax_instruments', 'estate_documents'],
      priority: 3
    });
  }
  
  return opportunities.sort((a, b) => b.potential_gain - a.potential_gain);
};

/**
 * Main function to calculate comprehensive financial health score
 */
const calculateFinancialHealth = (userContext) => {
  try {
    // Calculate individual category scores
    const incomeHealth = calculateIncomeHealthScore(userContext);
    const assetHealth = calculateAssetAllocationScore(userContext);
    const riskHealth = calculateRiskProtectionScore(userContext);
    const creditHealth = calculateLiabilitiesScore(userContext);
    const goalHealth = calculateGoalPlanningScore(userContext);
    const taxHealth = calculateTaxEfficiencyScore(userContext);
    const behavioralHealth = calculateBehavioralScore(userContext);
    
    const categories = [
      incomeHealth,
      assetHealth,
      riskHealth,
      creditHealth,
      goalHealth,
      taxHealth,
      behavioralHealth
    ];
    
    // Calculate overall scores
    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
    const maxPossibleScore = categories.reduce((sum, cat) => sum + cat.max_score, 0);
    const potentialScore = maxPossibleScore; // Potential with all data
    
    // Determine score band
    let scoreBand = 'Poor';
    let scoreBandColor = '#ef4444';
    if (totalScore >= 85) {
      scoreBand = 'Excellent';
      scoreBandColor = '#10b981';
    } else if (totalScore >= 70) {
      scoreBand = 'Good';
      scoreBandColor = '#f59e0b';
    } else if (totalScore >= 55) {
      scoreBand = 'Average';
      scoreBandColor = '#f97316';
    }
    
    const healthData = {
      overall_score: Math.round(totalScore),
      potential_score: maxPossibleScore,
      score_band: scoreBand,
      score_band_color: scoreBandColor,
      completion_percentage: Math.round((totalScore / maxPossibleScore) * 100),
      categories,
      last_updated: new Date().toISOString()
    };
    
    // Add unlock opportunities
    healthData.unlock_opportunities = identifyUnlockOpportunities(healthData);
    
    return {
      success: true,
      data: healthData
    };
    
  } catch (error) {
    console.error('Error calculating financial health:', error);
    return {
      success: false,
      error: 'Failed to calculate financial health score',
      details: error.message
    };
  }
};

module.exports = {
  calculateFinancialHealth,
  calculateIncomeHealthScore,
  calculateAssetAllocationScore,
  calculateRiskProtectionScore,
  calculateLiabilitiesScore,
  calculateGoalPlanningScore,
  calculateTaxEfficiencyScore,
  calculateBehavioralScore
};