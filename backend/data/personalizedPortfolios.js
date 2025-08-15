/**
 * Personalized Portfolio Holdings - Different portfolios for different demo users
 * Each user gets holdings that match their risk profile and investment style
 */

// Stock universe - Available stocks for portfolio creation
const availableStocks = {
  // Large Cap - Lower Risk
  largeCap: [
    { symbol: "TCS", company_name: "Tata Consultancy Services", sector: "Information Technology", basePrice: 4100 },
    { symbol: "INFY", company_name: "Infosys Limited", sector: "Information Technology", basePrice: 1520 },
    { symbol: "HDFCBANK", company_name: "HDFC Bank Limited", sector: "Banking", basePrice: 1750 },
    { symbol: "ICICIBANK", company_name: "ICICI Bank Limited", sector: "Banking", basePrice: 1200 },
    { symbol: "RELIANCE", company_name: "Reliance Industries Limited", sector: "Oil & Gas", basePrice: 2920 },
    { symbol: "BHARTIARTL", company_name: "Bharti Airtel Limited", sector: "Telecom", basePrice: 1650 },
    { symbol: "ITC", company_name: "ITC Limited", sector: "FMCG", basePrice: 470 },
    { symbol: "HINDUNILVR", company_name: "Hindustan Unilever Limited", sector: "FMCG", basePrice: 2800 }
  ],
  // Mid Cap - Medium Risk
  midCap: [
    { symbol: "BAJFINANCE", company_name: "Bajaj Finance Limited", sector: "Financial Services", basePrice: 7650 },
    { symbol: "PIDILITIND", company_name: "Pidilite Industries Limited", sector: "Chemicals", basePrice: 3200 },
    { symbol: "PAGEIND", company_name: "Page Industries Limited", sector: "Textiles", basePrice: 42000 },
    { symbol: "DMART", company_name: "Avenue Supermarts Limited", sector: "Retail", basePrice: 4800 },
    { symbol: "MCDOWELL-N", company_name: "United Spirits Limited", sector: "Beverages", basePrice: 1100 },
    { symbol: "APOLLOHOSP", company_name: "Apollo Hospitals Enterprise", sector: "Healthcare", basePrice: 6500 }
  ],
  // Small Cap - Higher Risk
  smallCap: [
    { symbol: "TATACHEM", company_name: "Tata Chemicals Limited", sector: "Chemicals", basePrice: 1200 },
    { symbol: "DIXON", company_name: "Dixon Technologies Limited", sector: "Electronics", basePrice: 15000 },
    { symbol: "CAMS", company_name: "Computer Age Management Services", sector: "Financial Services", basePrice: 4500 },
    { symbol: "ROUTE", company_name: "Route Mobile Limited", sector: "Technology", basePrice: 2100 },
    { symbol: "HAPPSTMNDS", company_name: "Happiest Minds Technologies", sector: "Technology", basePrice: 1000 }
  ]
};

// Mutual Fund universe - Available funds for portfolio creation
const availableMutualFunds = {
  // Large Cap Funds
  largeCap: [
    { name: "SBI Bluechip Fund - Direct Growth", code: "SBI-BC-DG", category: "Large Cap", expense_ratio: 0.65, nav: 78.50 },
    { name: "Mirae Asset Large Cap Fund - Direct Growth", code: "MA-LC-DG", category: "Large Cap", expense_ratio: 0.52, nav: 95.30 },
    { name: "Nippon India Large Cap Fund - Direct Growth", code: "NI-LC-DG", category: "Large Cap", expense_ratio: 0.68, nav: 67.80 }
  ],
  // Mid Cap Funds
  midCap: [
    { name: "Axis Midcap Fund - Direct Growth", code: "AXIS-MC-DG", category: "Mid Cap", expense_ratio: 0.73, nav: 112.40 },
    { name: "Kotak Emerging Equity Fund - Direct Growth", code: "KOTAK-EE-DG", category: "Mid Cap", expense_ratio: 0.65, nav: 78.90 },
    { name: "DSP Midcap Fund - Direct Growth", code: "DSP-MC-DG", category: "Mid Cap", expense_ratio: 0.71, nav: 156.20 }
  ],
  // Small Cap Funds
  smallCap: [
    { name: "SBI Small Cap Fund - Direct Growth", code: "SBI-SC-DG", category: "Small Cap", expense_ratio: 0.82, nav: 98.70 },
    { name: "Axis Small Cap Fund - Direct Growth", code: "AXIS-SC-DG", category: "Small Cap", expense_ratio: 0.78, nav: 86.50 },
    { name: "Nippon India Small Cap Fund - Direct Growth", code: "NI-SC-DG", category: "Small Cap", expense_ratio: 0.85, nav: 134.60 }
  ],
  // Debt Funds
  debt: [
    { name: "HDFC Corporate Bond Fund - Direct Growth", code: "HDFC-CB-DG", category: "Corporate Bond", expense_ratio: 0.28, nav: 26.80 },
    { name: "ICICI Prudential Corporate Bond Fund - Direct Growth", code: "ICICI-CB-DG", category: "Corporate Bond", expense_ratio: 0.32, nav: 31.50 },
    { name: "SBI Magnum Medium Duration Fund - Direct Growth", code: "SBI-MD-DG", category: "Medium Duration", expense_ratio: 0.45, nav: 45.20 }
  ],
  // Hybrid Funds
  hybrid: [
    { name: "HDFC Balanced Advantage Fund - Direct Growth", code: "HDFC-BA-DG", category: "Balanced Advantage", expense_ratio: 0.42, nav: 68.90 },
    { name: "ICICI Prudential Equity & Debt Fund - Direct Growth", code: "ICICI-ED-DG", category: "Aggressive Hybrid", expense_ratio: 0.58, nav: 234.70 }
  ],
  // International Funds
  international: [
    { name: "Motilal Oswal Nasdaq 100 Fund - Direct Growth", code: "MO-NASDAQ-DG", category: "International", expense_ratio: 0.65, nav: 45.60 },
    { name: "PPFAS Long Term Equity Fund - Direct Growth", code: "PPFAS-LTE-DG", category: "International", expense_ratio: 0.73, nav: 67.80 }
  ]
};

// Generate random variation for prices (±5%)
const generatePriceVariation = (basePrice) => {
  const variation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
  return Math.round(basePrice * variation);
};

// Generate stock holding with more varied performance
const generateStockHolding = (stock, investmentAmount) => {
  // More varied price movements (-15% to +25%)
  const priceMultiplier = 0.85 + Math.random() * 0.4;
  const currentPrice = Math.round(stock.basePrice * priceMultiplier);
  
  // Purchase price with more variation
  const purchasePriceMultiplier = 0.8 + Math.random() * 0.3;
  const avgPurchasePrice = Math.round(currentPrice * purchasePriceMultiplier);
  
  const quantity = Math.floor(investmentAmount / avgPurchasePrice);
  const actualInvestment = quantity * avgPurchasePrice;
  const currentValue = quantity * currentPrice;
  const gainLoss = currentValue - actualInvestment;
  const gainLossPercentage = (gainLoss / actualInvestment) * 100;

  return {
    symbol: stock.symbol,
    company_name: stock.company_name,
    quantity: quantity,
    avg_purchase_price: avgPurchasePrice,
    current_price: currentPrice,
    investment_amount: actualInvestment,
    current_value: currentValue,
    gain_loss: gainLoss,
    gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
    sector: stock.sector,
    exchange: "NSE",
    purchase_dates: ["2023-08-15", "2024-01-20"]
  };
};

// Generate mutual fund holding with varied performance
const generateMutualFundHolding = (fund, investmentAmount, sipAmount = 0) => {
  // More varied NAV performance (-8% to +18%)
  const navMultiplier = 0.92 + Math.random() * 0.26;
  const currentNAV = fund.nav * navMultiplier;
  
  // Average purchase NAV with variation
  const avgNAVMultiplier = 0.85 + Math.random() * 0.2;
  const avgPurchaseNAV = currentNAV * avgNAVMultiplier;
  
  const units = investmentAmount / avgPurchaseNAV;
  const currentValue = units * currentNAV;
  const gainLoss = currentValue - investmentAmount;
  const gainLossPercentage = (gainLoss / investmentAmount) * 100;

  return {
    scheme_name: fund.name,
    scheme_code: fund.code,
    units: Math.round(units * 100) / 100,
    nav: Math.round(currentNAV * 100) / 100,
    current_value: Math.round(currentValue),
    investment_amount: investmentAmount,
    gain_loss: Math.round(gainLoss),
    gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
    category: fund.category,
    fund_house: fund.name.split(' ')[0] + " Mutual Fund",
    sip_amount: sipAmount,
    sip_date: Math.floor(Math.random() * 28) + 1,
    sip_start_date: "2023-06-05",
    expense_ratio: fund.expense_ratio
  };
};

// Portfolio generators for different user types
const generateConservativePortfolio = (totalAmount) => {
  const stocks = [];
  const mutualFunds = [];
  
  // Conservative: 40% Large Cap Stocks, 45% Large Cap + Debt MFs, 15% Debt
  const stockAmount = totalAmount * 0.40;
  const mutualFundAmount = totalAmount * 0.60;
  
  // Add 3-4 large cap stocks
  const selectedStocks = availableStocks.largeCap.sort(() => 0.5 - Math.random()).slice(0, 4);
  const stockAmountPerHolding = stockAmount / selectedStocks.length;
  
  selectedStocks.forEach(stock => {
    stocks.push(generateStockHolding(stock, stockAmountPerHolding));
  });
  
  // Add mutual funds - mostly large cap and debt
  const largeCap = availableMutualFunds.largeCap[Math.floor(Math.random() * availableMutualFunds.largeCap.length)];
  const debt = availableMutualFunds.debt[Math.floor(Math.random() * availableMutualFunds.debt.length)];
  const hybrid = availableMutualFunds.hybrid[Math.floor(Math.random() * availableMutualFunds.hybrid.length)];
  
  mutualFunds.push(generateMutualFundHolding(largeCap, mutualFundAmount * 0.5, 8000));
  mutualFunds.push(generateMutualFundHolding(debt, mutualFundAmount * 0.3, 5000));
  mutualFunds.push(generateMutualFundHolding(hybrid, mutualFundAmount * 0.2, 3000));
  
  return { stocks, mutual_funds: mutualFunds };
};

const generateModeratePortfolio = (totalAmount) => {
  const stocks = [];
  const mutualFunds = [];
  
  // Moderate: 50% Stocks (Mix of Large+Mid), 50% MFs (Mix of categories)
  const stockAmount = totalAmount * 0.50;
  const mutualFundAmount = totalAmount * 0.50;
  
  // Mix of large cap and mid cap stocks
  const largeCaps = availableStocks.largeCap.sort(() => 0.5 - Math.random()).slice(0, 3);
  const midCaps = availableStocks.midCap.sort(() => 0.5 - Math.random()).slice(0, 2);
  const allStocks = [...largeCaps, ...midCaps];
  const stockAmountPerHolding = stockAmount / allStocks.length;
  
  allStocks.forEach(stock => {
    stocks.push(generateStockHolding(stock, stockAmountPerHolding));
  });
  
  // Diversified mutual funds
  const largeCap = availableMutualFunds.largeCap[Math.floor(Math.random() * availableMutualFunds.largeCap.length)];
  const midCap = availableMutualFunds.midCap[Math.floor(Math.random() * availableMutualFunds.midCap.length)];
  const debt = availableMutualFunds.debt[Math.floor(Math.random() * availableMutualFunds.debt.length)];
  const international = availableMutualFunds.international[Math.floor(Math.random() * availableMutualFunds.international.length)];
  
  mutualFunds.push(generateMutualFundHolding(largeCap, mutualFundAmount * 0.35, 10000));
  mutualFunds.push(generateMutualFundHolding(midCap, mutualFundAmount * 0.25, 7000));
  mutualFunds.push(generateMutualFundHolding(debt, mutualFundAmount * 0.25, 5000));
  mutualFunds.push(generateMutualFundHolding(international, mutualFundAmount * 0.15, 3000));
  
  return { stocks, mutual_funds: mutualFunds };
};

const generateAggressivePortfolio = (totalAmount) => {
  const stocks = [];
  const mutualFunds = [];
  
  // Aggressive: 70% Stocks (Mix of all caps), 30% MFs (Growth focused)
  const stockAmount = totalAmount * 0.70;
  const mutualFundAmount = totalAmount * 0.30;
  
  // Mix of all categories with emphasis on growth
  const largeCaps = availableStocks.largeCap.sort(() => 0.5 - Math.random()).slice(0, 2);
  const midCaps = availableStocks.midCap.sort(() => 0.5 - Math.random()).slice(0, 3);
  const smallCaps = availableStocks.smallCap.sort(() => 0.5 - Math.random()).slice(0, 2);
  const allStocks = [...largeCaps, ...midCaps, ...smallCaps];
  const stockAmountPerHolding = stockAmount / allStocks.length;
  
  allStocks.forEach(stock => {
    stocks.push(generateStockHolding(stock, stockAmountPerHolding));
  });
  
  // Growth-focused mutual funds
  const midCap = availableMutualFunds.midCap[Math.floor(Math.random() * availableMutualFunds.midCap.length)];
  const smallCap = availableMutualFunds.smallCap[Math.floor(Math.random() * availableMutualFunds.smallCap.length)];
  const international = availableMutualFunds.international[Math.floor(Math.random() * availableMutualFunds.international.length)];
  
  mutualFunds.push(generateMutualFundHolding(midCap, mutualFundAmount * 0.4, 12000));
  mutualFunds.push(generateMutualFundHolding(smallCap, mutualFundAmount * 0.4, 10000));
  mutualFunds.push(generateMutualFundHolding(international, mutualFundAmount * 0.2, 5000));
  
  return { stocks, mutual_funds: mutualFunds };
};

// Main function to generate personalized portfolio
const generatePersonalizedPortfolio = (riskProfile, totalAmount) => {
  switch (riskProfile) {
    case 'conservative':
      return generateConservativePortfolio(totalAmount);
    case 'moderate':
      return generateModeratePortfolio(totalAmount);
    case 'aggressive':
      return generateAggressivePortfolio(totalAmount);
    default:
      return generateModeratePortfolio(totalAmount);
  }
};

// Calculate portfolio summary
const calculatePortfolioSummary = (stocks, mutualFunds) => {
  const stockInvestment = stocks.reduce((sum, stock) => sum + stock.investment_amount, 0);
  const stockCurrentValue = stocks.reduce((sum, stock) => sum + stock.current_value, 0);
  const stockGainLoss = stockCurrentValue - stockInvestment;
  
  const mfInvestment = mutualFunds.reduce((sum, mf) => sum + mf.investment_amount, 0);
  const mfCurrentValue = mutualFunds.reduce((sum, mf) => sum + mf.current_value, 0);
  const mfGainLoss = mfCurrentValue - mfInvestment;
  
  const totalInvestment = stockInvestment + mfInvestment;
  const totalCurrentValue = stockCurrentValue + mfCurrentValue;
  const totalGainLoss = totalCurrentValue - totalInvestment;
  const gainLossPercentage = (totalGainLoss / totalInvestment) * 100;
  
  // Calculate asset allocation
  const stocksPercentage = (stockCurrentValue / totalCurrentValue) * 100;
  const mutualFundsPercentage = (mfCurrentValue / totalCurrentValue) * 100;
  
  return {
    total_investment: Math.round(totalInvestment),
    total_current_value: Math.round(totalCurrentValue),
    total_gain_loss: Math.round(totalGainLoss),
    gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
    updated_at: new Date().toISOString(),
    asset_allocation: {
      stocks: {
        value: Math.round(stockCurrentValue),
        percentage: Math.round(stocksPercentage * 100) / 100
      },
      mutual_funds: {
        value: Math.round(mfCurrentValue),
        percentage: Math.round(mutualFundsPercentage * 100) / 100
      }
    }
  };
};

module.exports = {
  generatePersonalizedPortfolio,
  calculatePortfolioSummary,
  availableStocks,
  availableMutualFunds
};