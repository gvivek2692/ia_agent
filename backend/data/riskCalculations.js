// Real risk calculations based on user's actual portfolio data

// Calculate sector concentration risk
const calculateSectorRisk = (stocks, portfolioValue) => {
  const sectorExposure = {};
  let maxSectorExposure = 0;
  
  stocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!sectorExposure[sector]) {
      sectorExposure[sector] = 0;
    }
    sectorExposure[sector] += stock.current_value;
  });
  
  // Calculate percentages and find max exposure
  Object.keys(sectorExposure).forEach(sector => {
    const percentage = (sectorExposure[sector] / portfolioValue) * 100;
    maxSectorExposure = Math.max(maxSectorExposure, percentage);
  });
  
  // Risk score: 0-30 (low), 31-50 (moderate), 51+ (high)
  return Math.min(100, Math.round(maxSectorExposure * 2));
};

// Calculate concentration risk based on individual holdings
const calculateConcentrationRisk = (holdings, portfolioValue) => {
  let maxHoldingPercentage = 0;
  let top3HoldingsPercentage = 0;
  
  const holdingPercentages = holdings
    .map(holding => (holding.current_value / portfolioValue) * 100)
    .sort((a, b) => b - a);
  
  maxHoldingPercentage = holdingPercentages[0] || 0;
  top3HoldingsPercentage = holdingPercentages.slice(0, 3).reduce((sum, p) => sum + p, 0);
  
  // Risk score based on concentration
  let riskScore = 0;
  if (maxHoldingPercentage > 25) riskScore += 40;
  else if (maxHoldingPercentage > 15) riskScore += 25;
  else if (maxHoldingPercentage > 10) riskScore += 15;
  
  if (top3HoldingsPercentage > 60) riskScore += 30;
  else if (top3HoldingsPercentage > 40) riskScore += 20;
  else if (top3HoldingsPercentage > 30) riskScore += 10;
  
  return Math.min(100, riskScore);
};

// Calculate volatility risk based on asset types and performance
const calculateVolatilityRisk = (stocks, mutualFunds) => {
  let volatilityScore = 30; // Base score
  
  // Small cap exposure increases volatility
  const smallCapFunds = mutualFunds.filter(mf => 
    mf.category && mf.category.toLowerCase().includes('small')
  ).length;
  volatilityScore += smallCapFunds * 15;
  
  // Mid cap exposure
  const midCapFunds = mutualFunds.filter(mf => 
    mf.category && mf.category.toLowerCase().includes('mid')
  ).length;
  volatilityScore += midCapFunds * 10;
  
  // Direct stock exposure
  volatilityScore += Math.min(stocks.length * 5, 25);
  
  // Performance volatility (wide range of returns indicates higher volatility)
  const allReturns = [
    ...stocks.map(s => s.gain_loss_percentage),
    ...mutualFunds.map(mf => mf.gain_loss_percentage)
  ];
  
  if (allReturns.length > 0) {
    const maxReturn = Math.max(...allReturns);
    const minReturn = Math.min(...allReturns);
    const returnSpread = maxReturn - minReturn;
    
    if (returnSpread > 30) volatilityScore += 20;
    else if (returnSpread > 20) volatilityScore += 15;
    else if (returnSpread > 10) volatilityScore += 10;
  }
  
  return Math.min(100, Math.round(volatilityScore));
};

// Calculate credit risk based on debt fund quality
const calculateCreditRisk = (mutualFunds) => {
  const debtFunds = mutualFunds.filter(mf => 
    mf.category && (
      mf.category.toLowerCase().includes('debt') || 
      mf.category.toLowerCase().includes('bond') ||
      mf.category.toLowerCase().includes('duration')
    )
  );
  
  if (debtFunds.length === 0) return 20; // No debt exposure = low credit risk
  
  // Assume AAA-rated funds have lower risk
  // Higher expense ratio might indicate riskier credit exposure
  const avgExpenseRatio = debtFunds.reduce((sum, mf) => sum + (mf.expense_ratio || 0.5), 0) / debtFunds.length;
  
  let creditRisk = 25; // Base risk
  if (avgExpenseRatio > 0.6) creditRisk += 15;
  if (avgExpenseRatio > 0.8) creditRisk += 10;
  
  return Math.min(100, creditRisk);
};

// Calculate liquidity risk
const calculateLiquidityRisk = (stocks, mutualFunds, portfolioValue) => {
  const stockValue = stocks.reduce((sum, stock) => sum + stock.current_value, 0);
  const stockPercentage = (stockValue / portfolioValue) * 100;
  
  // Listed stocks are generally liquid
  let liquidityRisk = Math.max(0, 40 - stockPercentage); // Lower risk with more stocks
  
  // Mutual funds are generally liquid (T+1 to T+3)
  liquidityRisk = Math.max(10, liquidityRisk - 10);
  
  // Small cap funds have lower liquidity
  const smallCapValue = mutualFunds
    .filter(mf => mf.category && mf.category.toLowerCase().includes('small'))
    .reduce((sum, mf) => sum + mf.current_value, 0);
  const smallCapPercentage = (smallCapValue / portfolioValue) * 100;
  
  liquidityRisk += smallCapPercentage * 0.5;
  
  return Math.min(100, Math.round(liquidityRisk));
};

// Calculate currency risk (international exposure)
const calculateCurrencyRisk = (mutualFunds, portfolioValue) => {
  const internationalValue = mutualFunds
    .filter(mf => mf.category && mf.category.toLowerCase().includes('international'))
    .reduce((sum, mf) => sum + mf.current_value, 0);
  
  const internationalPercentage = (internationalValue / portfolioValue) * 100;
  
  // Currency risk increases with international exposure
  return Math.min(100, Math.round(internationalPercentage * 2));
};

// Generate risk factors analysis
const generateRiskFactors = (portfolio) => {
  const { stocks, mutual_funds, summary } = portfolio;
  const portfolioValue = summary.total_current_value;
  
  const concentrationRisk = calculateConcentrationRisk([...stocks, ...mutual_funds], portfolioValue);
  const sectorRisk = calculateSectorRisk(stocks, portfolioValue);
  const volatilityRisk = calculateVolatilityRisk(stocks, mutual_funds);
  const creditRisk = calculateCreditRisk(mutual_funds);
  const liquidityRisk = calculateLiquidityRisk(stocks, mutual_funds, portfolioValue);
  const currencyRisk = calculateCurrencyRisk(mutual_funds, portfolioValue);
  
  const factors = [];
  
  // Portfolio Concentration
  let concentrationStatus = 'good';
  let concentrationDesc = 'Well diversified portfolio with balanced position sizes';
  let concentrationRec = 'Current allocation is optimal';
  
  if (concentrationRisk > 60) {
    concentrationStatus = 'high';
    concentrationDesc = 'High concentration in few holdings increases portfolio risk';
    concentrationRec = 'Consider diversifying by reducing large positions and adding more holdings';
  } else if (concentrationRisk > 30) {
    concentrationStatus = 'moderate';
    concentrationDesc = 'Moderate concentration risk - some holdings are significantly large';
    concentrationRec = 'Monitor large positions and consider gradual rebalancing';
  }
  
  factors.push({
    name: 'Portfolio Concentration',
    score: concentrationRisk,
    status: concentrationStatus,
    description: concentrationDesc,
    recommendation: concentrationRec
  });
  
  // Sector Risk
  let sectorStatus = 'good';
  let sectorDesc = 'Good sector diversification across multiple industries';
  let sectorRec = 'Continue maintaining balanced sector allocation';
  
  if (sectorRisk > 50) {
    sectorStatus = 'high';
    sectorDesc = 'High exposure to single sector creates concentration risk';
    sectorRec = 'Diversify across sectors to reduce single-sector dependency';
  } else if (sectorRisk > 30) {
    sectorStatus = 'moderate';
    sectorDesc = 'Moderate sector concentration - one sector dominates portfolio';
    sectorRec = 'Consider reducing exposure to dominant sector';
  }
  
  factors.push({
    name: 'Sector Allocation',
    score: sectorRisk,
    status: sectorStatus,
    description: sectorDesc,
    recommendation: sectorRec
  });
  
  // Market Cap Risk
  const smallCapValue = mutual_funds.filter(mf => 
    mf.category && mf.category.toLowerCase().includes('small')
  ).reduce((sum, mf) => sum + mf.current_value, 0);
  const smallCapPercentage = (smallCapValue / portfolioValue) * 100;
  
  let marketCapStatus = 'good';
  let marketCapDesc = 'Balanced allocation across market capitalizations';
  let marketCapRec = 'Current market cap allocation is appropriate';
  
  if (smallCapPercentage > 30) {
    marketCapStatus = 'high';
    marketCapDesc = 'High small-cap exposure increases volatility risk';
    marketCapRec = 'Consider reducing small-cap allocation below 20%';
  } else if (smallCapPercentage > 20) {
    marketCapStatus = 'moderate';
    marketCapDesc = 'Moderate small-cap exposure - monitor for volatility';
    marketCapRec = 'Small-cap exposure is at upper limit, consider rebalancing';
  }
  
  factors.push({
    name: 'Market Cap Risk',
    score: Math.min(100, smallCapPercentage * 3),
    status: marketCapStatus,
    description: marketCapDesc,
    recommendation: marketCapRec
  });
  
  // Credit Quality
  factors.push({
    name: 'Credit Quality',
    score: creditRisk,
    status: creditRisk > 50 ? 'high' : creditRisk > 30 ? 'moderate' : 'good',
    description: creditRisk > 50 ? 'Debt funds may have credit quality concerns' :
                creditRisk > 30 ? 'Moderate credit risk in debt allocation' :
                'High quality debt funds with good credit ratings',
    recommendation: creditRisk > 50 ? 'Review debt fund credit quality and consider AAA-rated funds' :
                   creditRisk > 30 ? 'Monitor debt fund performance closely' :
                   'Maintain current credit quality standards'
  });
  
  // Liquidity Profile
  factors.push({
    name: 'Liquidity Profile',
    score: liquidityRisk,
    status: liquidityRisk > 50 ? 'high' : liquidityRisk > 30 ? 'moderate' : 'good',
    description: liquidityRisk > 50 ? 'Lower liquidity due to small-cap heavy allocation' :
                liquidityRisk > 30 ? 'Moderate liquidity with some illiquid holdings' :
                'High liquidity portfolio suitable for emergency needs',
    recommendation: liquidityRisk > 50 ? 'Increase allocation to large-cap and liquid funds' :
                   liquidityRisk > 30 ? 'Maintain some allocation to liquid funds' :
                   'Excellent liquidity for emergencies'
  });
  
  return factors;
};

// Calculate VaR and risk metrics
const calculateVaRAnalysis = (portfolio, userProfile) => {
  const { summary } = portfolio;
  const totalReturn = ((summary.total_current_value - summary.total_investment) / summary.total_investment) * 100;
  
  // Simplified VaR calculation based on portfolio composition and historical volatility
  const equityPercentage = summary.asset_allocation?.stocks?.percentage || 0;
  const baseVolatility = 15; // Base annual volatility
  
  // Adjust volatility based on portfolio composition
  let portfolioVolatility = baseVolatility * (equityPercentage / 100);
  portfolioVolatility += 5; // Add debt volatility
  
  // Daily VaR at 95% confidence (assuming normal distribution)
  const dailyVolatility = portfolioVolatility / Math.sqrt(252); // 252 trading days
  const dailyVaR95 = dailyVolatility * 1.645; // 95% confidence z-score
  const dailyVaR99 = dailyVolatility * 2.33; // 99% confidence z-score
  
  // Monthly VaR
  const monthlyVaR95 = dailyVaR95 * Math.sqrt(21); // 21 trading days per month
  
  // Max drawdown estimation
  const maxDrawdown = Math.min(25, Math.max(5, portfolioVolatility * 0.8));
  
  // Sharpe ratio calculation
  const riskFreeRate = 6.5; // Current Indian risk-free rate
  const excessReturn = totalReturn - riskFreeRate;
  const sharpeRatio = portfolioVolatility > 0 ? excessReturn / portfolioVolatility : 0;
  
  // Beta calculation (vs market)
  const marketVolatility = 18; // Nifty volatility
  const beta = portfolioVolatility / marketVolatility;
  
  return {
    daily_var_95: Math.round(dailyVaR95 * 100) / 100,
    daily_var_99: Math.round(dailyVaR99 * 100) / 100,
    monthly_var_95: Math.round(monthlyVaR95 * 100) / 100,
    max_drawdown: Math.round(maxDrawdown * 100) / 100,
    sharpe_ratio: Math.round(sharpeRatio * 100) / 100,
    beta: Math.round(beta * 100) / 100
  };
};

// Generate stress test scenarios
const generateStressTestScenarios = (portfolio) => {
  const { summary } = portfolio;
  const equityPercentage = summary.asset_allocation?.stocks?.percentage || 0;
  const mutualFundsPercentage = summary.asset_allocation?.mutual_funds?.percentage || 0;
  
  return [
    {
      scenario: 'Market Crash (-30%)',
      impact: Math.round(-((equityPercentage * 0.3 + mutualFundsPercentage * 0.25) * 0.01) * 100) / 100,
      probability: 'Low (2-5%)'
    },
    {
      scenario: 'Sector Rotation Impact',
      impact: Math.round(-(equityPercentage * 0.15 * 0.01) * 100) / 100,
      probability: 'Medium (15-20%)'
    },
    {
      scenario: 'Interest Rate Hike (+200bps)',
      impact: Math.round(-((mutualFundsPercentage * 0.08 + equityPercentage * 0.05) * 0.01) * 100) / 100,
      probability: 'High (30-40%)'
    },
    {
      scenario: 'Currency Devaluation (-15%)',
      impact: Math.round(-(equityPercentage * 0.05 * 0.01) * 100) / 100,
      probability: 'Medium (10-15%)'
    },
    {
      scenario: 'Inflation Spike (>7%)',
      impact: Math.round(-((equityPercentage * 0.08 + mutualFundsPercentage * 0.06) * 0.01) * 100) / 100,
      probability: 'Medium (20-25%)'
    }
  ];
};

// Generate radar chart data for risk profile
const generateRiskRadarData = (riskFactors) => {
  return riskFactors.map(factor => ({
    category: factor.name.split(' ')[0], // Shortened names for radar
    current: factor.score,
    optimal: factor.score > 50 ? 30 : factor.score > 30 ? 25 : factor.score // Optimal is lower risk
  }));
};

// Main function to calculate comprehensive risk analysis
const calculateRiskAnalysis = (userContext) => {
  const { portfolio, user_profile } = userContext;
  const { stocks, mutual_funds, summary } = portfolio;
  
  // Calculate individual risk scores
  const concentrationRisk = calculateConcentrationRisk([...stocks, ...mutual_funds], summary.total_current_value);
  const sectorRisk = calculateSectorRisk(stocks, summary.total_current_value);
  const volatilityRisk = calculateVolatilityRisk(stocks, mutual_funds);
  const creditRisk = calculateCreditRisk(mutual_funds);
  const liquidityRisk = calculateLiquidityRisk(stocks, mutual_funds, summary.total_current_value);
  const currencyRisk = calculateCurrencyRisk(mutual_funds, summary.total_current_value);
  
  // Calculate overall risk score
  const overallRisk = Math.round((concentrationRisk + sectorRisk + volatilityRisk + creditRisk + liquidityRisk + currencyRisk) / 6);
  
  const riskMetrics = {
    overall_score: overallRisk,
    risk_level: overallRisk > 70 ? 'aggressive' : overallRisk > 40 ? 'moderate' : 'conservative',
    volatility_score: volatilityRisk,
    concentration_risk: concentrationRisk,
    sector_risk: sectorRisk,
    credit_risk: creditRisk,
    liquidity_risk: liquidityRisk,
    currency_risk: currencyRisk
  };
  
  const riskFactors = generateRiskFactors(portfolio);
  const varAnalysis = calculateVaRAnalysis(portfolio, user_profile);
  const stressTest = generateStressTestScenarios(portfolio);
  const radarData = generateRiskRadarData(riskFactors);
  
  return {
    metrics: riskMetrics,
    factors: riskFactors,
    var_analysis: varAnalysis,
    stress_test: stressTest,
    radar_data: radarData
  };
};

module.exports = {
  calculateRiskAnalysis,
  calculateSectorRisk,
  calculateConcentrationRisk,
  calculateVolatilityRisk,
  generateRiskFactors
};