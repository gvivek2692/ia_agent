// Market Analysis Engine - Generate personalized market impact based on user's portfolio

// Generate portfolio-specific sector analysis
const generateSectorAnalysis = (userContext) => {
  const { portfolio } = userContext;
  const stocks = portfolio.stocks || [];
  const sectors = [];
  const portfolioValue = portfolio.summary.total_current_value;
  
  // Calculate user's sector exposure
  const sectorExposure = {};
  stocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!sectorExposure[sector]) {
      sectorExposure[sector] = { value: 0, percentage: 0, stocks: [] };
    }
    sectorExposure[sector].value += stock.current_value;
    sectorExposure[sector].stocks.push(stock);
  });
  
  // Calculate percentages
  Object.keys(sectorExposure).forEach(sector => {
    sectorExposure[sector].percentage = (sectorExposure[sector].value / portfolioValue) * 100;
  });
  
  // Generate market performance data based on user's actual exposure
  const sectorMarketData = {
    'Information Technology': { 
      performance: 1.6, 
      outlook: 'bullish', 
      recommendation: 'Strong Buy',
      reasoning: 'AI adoption driving growth, strong export demand'
    },
    'Banking': { 
      performance: -0.3, 
      outlook: 'neutral', 
      recommendation: 'Hold',
      reasoning: 'Credit growth slowing, NPA concerns persist'
    },
    'Oil & Gas': { 
      performance: 2.1, 
      outlook: 'bullish', 
      recommendation: 'Buy',
      reasoning: 'Refining margins improving, stable crude prices'
    },
    'FMCG': { 
      performance: -0.5, 
      outlook: 'bearish', 
      recommendation: 'Sell',
      reasoning: 'Rural demand weakness, margin pressure'
    },
    'Healthcare': { 
      performance: 0.8, 
      outlook: 'bullish', 
      recommendation: 'Buy',
      reasoning: 'Generic drug demand stable, export growth'
    },
    'Financial Services': { 
      performance: -0.2, 
      outlook: 'neutral', 
      recommendation: 'Hold',
      reasoning: 'Interest rate cycle peaking, asset quality stable'
    },
    'Telecom': { 
      performance: 1.2, 
      outlook: 'bullish', 
      recommendation: 'Buy',
      reasoning: '5G rollout driving capex, ARPU improvement'
    },
    'Chemicals': { 
      performance: 0.3, 
      outlook: 'neutral', 
      recommendation: 'Hold',
      reasoning: 'China +1 benefit offset by pricing pressure'
    },
    'Textiles': { 
      performance: -1.2, 
      outlook: 'bearish', 
      recommendation: 'Sell',
      reasoning: 'Global demand slowdown, cotton price volatility'
    },
    'Retail': { 
      performance: 0.9, 
      outlook: 'bullish', 
      recommendation: 'Buy',
      reasoning: 'Festive season demand, omnichannel growth'
    }
  };
  
  // Generate sector analysis based on user's actual holdings
  Object.entries(sectorExposure).forEach(([sector, data]) => {
    const marketInfo = sectorMarketData[sector] || {
      performance: Math.random() * 2 - 1, // Random between -1 and 1
      outlook: 'neutral',
      recommendation: 'Hold',
      reasoning: 'Mixed sector fundamentals'
    };
    
    sectors.push({
      name: sector,
      user_exposure: data.percentage,
      performance: marketInfo.performance,
      outlook: marketInfo.outlook,
      recommendation: marketInfo.recommendation,
      reasoning: marketInfo.reasoning,
      stocks_held: data.stocks.map(s => s.symbol).join(', '),
      impact_on_portfolio: (data.percentage * marketInfo.performance) / 100
    });
  });
  
  // Sort by user exposure (most relevant sectors first)
  return sectors.sort((a, b) => b.user_exposure - a.user_exposure);
};

// Calculate portfolio impact from market movements
const calculatePortfolioImpact = (userContext) => {
  const { portfolio } = userContext;
  const stocks = portfolio.stocks || [];
  const portfolioValue = portfolio.summary.total_current_value;
  
  // Calculate sector-wise impact
  let totalPositiveImpact = 0;
  let totalNegativeImpact = 0;
  let sectorImpacts = [];
  
  const sectorExposure = {};
  stocks.forEach(stock => {
    const sector = stock.sector || 'Other';
    if (!sectorExposure[sector]) {
      sectorExposure[sector] = { value: 0, percentage: 0 };
    }
    sectorExposure[sector].value += stock.current_value;
  });
  
  // Sample market movements (in real implementation, this would come from market data API)
  const sectorMovements = {
    'Information Technology': 1.6,
    'Banking': -0.3,
    'Oil & Gas': 2.1,
    'FMCG': -0.5,
    'Healthcare': 0.8,
    'Financial Services': -0.2,
    'Telecom': 1.2,
    'Chemicals': 0.3,
    'Textiles': -1.2,
    'Retail': 0.9
  };
  
  Object.entries(sectorExposure).forEach(([sector, data]) => {
    const movement = sectorMovements[sector] || 0;
    const impact = (data.value * movement) / 100;
    
    if (impact > 0) totalPositiveImpact += impact;
    else totalNegativeImpact += Math.abs(impact);
    
    sectorImpacts.push({
      sector,
      movement,
      impact,
      value: data.value
    });
  });
  
  return {
    total_impact: totalPositiveImpact - totalNegativeImpact,
    positive_impact: totalPositiveImpact,
    negative_impact: totalNegativeImpact,
    sector_impacts: sectorImpacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  };
};

// Generate market sentiment based on user's portfolio characteristics
const generateMarketSentiment = (userContext) => {
  const { portfolio, investment_profile } = userContext;
  const riskTolerance = investment_profile.risk_tolerance || 'moderate';
  const assetAllocation = portfolio.summary.asset_allocation;
  
  const equityPercentage = (assetAllocation.stocks?.percentage || 0) + 
    (assetAllocation.mutual_funds?.percentage || 0) * 0.7; // Assuming 70% of MFs are equity
  
  let sentimentScore = 65; // Base sentiment
  let factors = [];
  
  // Adjust sentiment based on portfolio characteristics
  if (equityPercentage > 70) {
    sentimentScore += 10;
    factors.push('High equity exposure benefits from market rally');
  } else if (equityPercentage < 40) {
    sentimentScore -= 5;
    factors.push('Conservative allocation limits upside participation');
  }
  
  // Risk tolerance impact
  if (riskTolerance === 'aggressive') {
    sentimentScore += 5;
    factors.push('Aggressive risk profile aligns with market momentum');
  } else if (riskTolerance === 'conservative') {
    sentimentScore -= 5;
    factors.push('Conservative approach provides downside protection');
  }
  
  // Add general market factors
  factors.push('Strong corporate earnings growth');
  factors.push('Stable inflation and interest rates');
  factors.push('Positive foreign institutional investor flows');
  
  const trend = sentimentScore > 70 ? 'bullish' : sentimentScore < 50 ? 'bearish' : 'neutral';
  
  return {
    score: Math.min(100, Math.max(0, sentimentScore)),
    trend,
    factors: factors.slice(0, 4)
  };
};

// Generate personalized news based on user's holdings
const generatePersonalizedNews = (userContext) => {
  const { portfolio } = userContext;
  const stocks = portfolio.stocks || [];
  const mutualFunds = portfolio.mutual_funds || [];
  const news = [];
  
  // Generate news based on user's actual holdings
  const sectors = [...new Set(stocks.map(s => s.sector))];
  
  // Base market news
  news.push({
    title: 'Indian markets show resilience amid global volatility',
    impact: 'positive',
    source: 'Economic Times',
    relevance: 'high'
  });
  
  // Sector-specific news based on user's holdings
  if (sectors.includes('Information Technology')) {
    news.push({
      title: 'IT sector shows strong Q3 results, AI adoption accelerating',
      impact: 'positive',
      source: 'Moneycontrol',
      relevance: 'high',
      reason: 'You hold IT stocks: ' + stocks.filter(s => s.sector === 'Information Technology').map(s => s.symbol).join(', ')
    });
  }
  
  if (sectors.includes('Banking') || sectors.includes('Financial Services')) {
    news.push({
      title: 'RBI maintains accommodative stance, banking sector relief',
      impact: 'positive',
      source: 'Business Standard',
      relevance: 'high',
      reason: 'You hold banking/financial stocks: ' + stocks.filter(s => s.sector === 'Banking' || s.sector === 'Financial Services').map(s => s.symbol).join(', ')
    });
  }
  
  if (sectors.includes('Oil & Gas')) {
    news.push({
      title: 'Crude oil prices stabilize, refining margins improve',
      impact: 'positive',
      source: 'Reuters',
      relevance: 'medium',
      reason: 'You hold oil & gas stocks: ' + stocks.filter(s => s.sector === 'Oil & Gas').map(s => s.symbol).join(', ')
    });
  }
  
  // Mutual fund related news
  if (mutualFunds.some(mf => mf.category.toLowerCase().includes('international'))) {
    news.push({
      title: 'Global markets show resilience, USD strengthening',
      impact: 'positive',
      source: 'Financial Express',
      relevance: 'medium',
      reason: 'You hold international funds'
    });
  }
  
  if (mutualFunds.some(mf => mf.category.toLowerCase().includes('debt'))) {
    news.push({
      title: 'Debt market outlook stable with rate cycle peaking',
      impact: 'neutral',
      source: 'Mint',
      relevance: 'medium',
      reason: 'You hold debt funds'
    });
  }
  
  return news.slice(0, 5); // Return top 5 relevant news items
};

// Generate historical chart data with portfolio correlation
const generateChartData = (userContext) => {
  const { portfolio } = userContext;
  const portfolioReturn = ((portfolio.summary.total_current_value - portfolio.summary.total_investment) / portfolio.summary.total_investment) * 100;
  
  // Generate 30 days of data
  const chartData = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);
  
  let niftyBase = 19350;
  let sensexBase = 65000;
  let portfolioBase = 100; // Portfolio index starting at 100
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    // Generate realistic market movements
    const marketMovement = (Math.random() - 0.5) * 2; // ±1% daily movement
    niftyBase *= (1 + marketMovement / 100);
    sensexBase *= (1 + marketMovement / 100);
    
    // Portfolio movement correlated but with user's beta
    const portfolioBeta = 1.1; // Slightly more volatile than market
    const portfolioMovement = marketMovement * portfolioBeta + (Math.random() - 0.5) * 0.5;
    portfolioBase *= (1 + portfolioMovement / 100);
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      nifty: Math.round(niftyBase),
      sensex: Math.round(sensexBase),
      portfolio: Math.round(portfolioBase * 100) / 100
    });
  }
  
  return chartData;
};

// Main function to generate complete market analysis
const generateMarketAnalysis = (userContext) => {
  const sectorAnalysis = generateSectorAnalysis(userContext);
  const portfolioImpact = calculatePortfolioImpact(userContext);
  const marketSentiment = generateMarketSentiment(userContext);
  const personalizedNews = generatePersonalizedNews(userContext);
  const chartData = generateChartData(userContext);
  
  // Current market indices (in real implementation, fetch from market data API)
  const indices = {
    nifty50: { value: 19856.50, change: 245.30, change_percent: 1.25 },
    sensex: { value: 66598.20, change: 823.45, change_percent: 1.25 },
    nifty_bank: { value: 44234.10, change: -156.80, change_percent: -0.35 },
    nifty_it: { value: 29567.30, change: 467.20, change_percent: 1.60 }
  };
  
  return {
    indices,
    sectors: sectorAnalysis,
    market_sentiment: marketSentiment,
    portfolio_impact: portfolioImpact,
    chart_data: chartData,
    news_summary: personalizedNews,
    last_updated: new Date().toISOString(),
    user_specific: true
  };
};

module.exports = {
  generateMarketAnalysis,
  generateSectorAnalysis,
  calculatePortfolioImpact,
  generateMarketSentiment,
  generatePersonalizedNews
};