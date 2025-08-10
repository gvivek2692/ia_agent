/**
 * Demo Portfolio Holdings - Realistic Indian Investment Portfolio
 * Mix of stocks, mutual funds, and other instruments
 */

const portfolioHoldings = {
  // Stock Holdings - Major Indian Companies
  stocks: [
    {
      symbol: "INFY",
      company_name: "Infosys Limited",
      quantity: 15,
      avg_purchase_price: 1450,
      current_price: 1520,
      investment_amount: 21750,
      current_value: 22800,
      gain_loss: 1050,
      gain_loss_percentage: 4.83,
      sector: "Information Technology",
      exchange: "NSE",
      purchase_dates: ["2023-08-15", "2024-01-20"]
    },
    {
      symbol: "HDFCBANK",
      company_name: "HDFC Bank Limited",
      quantity: 8,
      avg_purchase_price: 1680,
      current_price: 1750,
      investment_amount: 13440,
      current_value: 14000,
      gain_loss: 560,
      gain_loss_percentage: 4.17,
      sector: "Banking",
      exchange: "NSE",
      purchase_dates: ["2023-09-10", "2023-12-05"]
    },
    {
      symbol: "RELIANCE",
      company_name: "Reliance Industries Limited",
      quantity: 6,
      avg_purchase_price: 2800,
      current_price: 2920,
      investment_amount: 16800,
      current_value: 17520,
      gain_loss: 720,
      gain_loss_percentage: 4.29,
      sector: "Oil & Gas",
      exchange: "NSE",
      purchase_dates: ["2024-02-14"]
    },
    {
      symbol: "TCS",
      company_name: "Tata Consultancy Services",
      quantity: 5,
      avg_purchase_price: 3850,
      current_price: 4100,
      investment_amount: 19250,
      current_value: 20500,
      gain_loss: 1250,
      gain_loss_percentage: 6.49,
      sector: "Information Technology",
      exchange: "NSE",
      purchase_dates: ["2023-11-20"]
    },
    {
      symbol: "BAJFINANCE",
      company_name: "Bajaj Finance Limited",
      quantity: 3,
      avg_purchase_price: 7200,
      current_price: 7650,
      investment_amount: 21600,
      current_value: 22950,
      gain_loss: 1350,
      gain_loss_percentage: 6.25,
      sector: "Financial Services",
      exchange: "NSE",
      purchase_dates: ["2024-03-10"]
    }
  ],

  // Mutual Fund Holdings
  mutual_funds: [
    {
      scheme_name: "SBI Bluechip Fund - Direct Growth",
      scheme_code: "SBI-BC-DG",
      units: 450.75,
      nav: 78.50,
      current_value: 35384,
      investment_amount: 32000,
      gain_loss: 3384,
      gain_loss_percentage: 10.58,
      category: "Large Cap",
      fund_house: "SBI Mutual Fund",
      sip_amount: 8000,
      sip_date: 5,
      sip_start_date: "2023-06-05",
      expense_ratio: 0.65
    },
    {
      scheme_name: "Axis Midcap Fund - Direct Growth",
      scheme_code: "AXIS-MC-DG",
      units: 380.25,
      nav: 65.20,
      current_value: 24792,
      investment_amount: 22000,
      gain_loss: 2792,
      gain_loss_percentage: 12.69,
      category: "Mid Cap",
      fund_house: "Axis Mutual Fund",
      sip_amount: 5000,
      sip_date: 10,
      sip_start_date: "2023-07-10",
      expense_ratio: 0.85
    },
    {
      scheme_name: "Mirae Asset Large & Midcap Fund - Direct Growth",
      scheme_code: "MIRAE-LM-DG",
      units: 285.60,
      nav: 125.80,
      current_value: 35928,
      investment_amount: 30000,
      gain_loss: 5928,
      gain_loss_percentage: 19.76,
      category: "Large & Mid Cap",
      fund_house: "Mirae Asset",
      sip_amount: 7000,
      sip_date: 15,
      sip_start_date: "2023-08-15",
      expense_ratio: 0.75
    },
    {
      scheme_name: "HDFC Hybrid Equity Fund - Direct Growth",
      scheme_code: "HDFC-HE-DG",
      units: 320.90,
      nav: 95.60,
      current_value: 30678,
      investment_amount: 28000,
      gain_loss: 2678,
      gain_loss_percentage: 9.56,
      category: "Hybrid",
      fund_house: "HDFC Mutual Fund",
      sip_amount: 6000,
      sip_date: 20,
      sip_start_date: "2023-09-20",
      expense_ratio: 0.68
    },
    {
      scheme_name: "Parag Parikh Flexi Cap Fund - Direct Growth",
      scheme_code: "PPFAS-FC-DG",
      units: 180.45,
      nav: 78.90,
      current_value: 14238,
      investment_amount: 12000,
      gain_loss: 2238,
      gain_loss_percentage: 18.65,
      category: "Flexi Cap",
      fund_house: "PPFAS Mutual Fund",
      sip_amount: 3000,
      sip_date: 25,
      sip_start_date: "2024-01-25",
      expense_ratio: 0.72
    }
  ],

  // ELSS Funds (Tax Saving)
  elss_funds: [
    {
      scheme_name: "Axis Long Term Equity Fund - Direct Growth",
      scheme_code: "AXIS-LTE-DG",
      units: 220.35,
      nav: 68.40,
      current_value: 15072,
      investment_amount: 12000,
      gain_loss: 3072,
      gain_loss_percentage: 25.60,
      category: "ELSS",
      fund_house: "Axis Mutual Fund",
      lock_in_period: "3 years",
      investment_date: "2023-03-31",
      tax_benefit: 12000
    }
  ],

  // PPF Account
  ppf: {
    account_number: "PPF123456789",
    current_balance: 185000,
    annual_contribution: 150000,
    years_completed: 1.5,
    maturity_date: "2038-04-01",
    estimated_maturity_value: 4500000,
    last_contribution: "2024-03-31",
    interest_rate: 7.1
  },

  // EPF Account
  epf: {
    account_number: "EPF987654321",
    current_balance: 125000,
    monthly_contribution: 4320, // Employee + Employer
    years_of_service: 2.5,
    last_contribution: "2024-06-30",
    interest_rate: 8.15
  }
};

// Portfolio Summary Calculations
const calculatePortfolioSummary = () => {
  const stocksValue = portfolioHoldings.stocks.reduce((sum, stock) => sum + stock.current_value, 0);
  const mfValue = portfolioHoldings.mutual_funds.reduce((sum, mf) => sum + mf.current_value, 0);
  const elssValue = portfolioHoldings.elss_funds.reduce((sum, elss) => sum + elss.current_value, 0);
  const ppfValue = portfolioHoldings.ppf.current_balance;
  const epfValue = portfolioHoldings.epf.current_balance;

  const totalInvestment = 
    portfolioHoldings.stocks.reduce((sum, stock) => sum + stock.investment_amount, 0) +
    portfolioHoldings.mutual_funds.reduce((sum, mf) => sum + mf.investment_amount, 0) +
    portfolioHoldings.elss_funds.reduce((sum, elss) => sum + elss.investment_amount, 0) +
    ppfValue + epfValue;

  const totalCurrentValue = stocksValue + mfValue + elssValue + ppfValue + epfValue;
  const totalGainLoss = totalCurrentValue - totalInvestment;

  return {
    total_investment: totalInvestment,
    total_current_value: totalCurrentValue,
    total_gain_loss: totalGainLoss,
    gain_loss_percentage: Math.round(((totalGainLoss / totalInvestment) * 100) * 100) / 100,
    asset_allocation: {
      stocks: {
        value: stocksValue,
        percentage: Math.round(((stocksValue / totalCurrentValue) * 100) * 100) / 100
      },
      mutual_funds: {
        value: mfValue,
        percentage: Math.round(((mfValue / totalCurrentValue) * 100) * 100) / 100
      },
      elss: {
        value: elssValue,
        percentage: Math.round(((elssValue / totalCurrentValue) * 100) * 100) / 100
      },
      ppf: {
        value: ppfValue,
        percentage: Math.round(((ppfValue / totalCurrentValue) * 100) * 100) / 100
      },
      epf: {
        value: epfValue,
        percentage: Math.round(((epfValue / totalCurrentValue) * 100) * 100) / 100
      }
    },
    sector_allocation: {
      technology: Math.round(((portfolioHoldings.stocks.filter(s => s.sector === "Information Technology")
        .reduce((sum, s) => sum + s.current_value, 0) / stocksValue) * 100) * 100) / 100,
      banking: Math.round(((portfolioHoldings.stocks.filter(s => s.sector === "Banking")
        .reduce((sum, s) => sum + s.current_value, 0) / stocksValue) * 100) * 100) / 100,
      financial_services: Math.round(((portfolioHoldings.stocks.filter(s => s.sector === "Financial Services")
        .reduce((sum, s) => sum + s.current_value, 0) / stocksValue) * 100) * 100) / 100,
      oil_gas: Math.round(((portfolioHoldings.stocks.filter(s => s.sector === "Oil & Gas")
        .reduce((sum, s) => sum + s.current_value, 0) / stocksValue) * 100) * 100) / 100
    }
  };
};

portfolioHoldings.summary = calculatePortfolioSummary();

module.exports = portfolioHoldings;