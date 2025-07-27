/**
 * Central data export module for AI Wealth Advisor Demo
 * Combines all demo data for easy access
 */

const demoUser = require('./demoUser');
const portfolioHoldings = require('./portfolioHoldings');
const transactionHistory = require('./transactionHistory');
const financialGoals = require('./financialGoals');

// Comprehensive user context for AI
const getUserContext = () => {
  return {
    user_profile: demoUser.profile,
    financial_profile: demoUser.income,
    investment_profile: demoUser.investment_profile,
    monthly_expenses: demoUser.monthly_expenses,
    net_worth: demoUser.net_worth,
    portfolio: {
      summary: portfolioHoldings.summary,
      stocks: portfolioHoldings.stocks,
      mutual_funds: portfolioHoldings.mutual_funds,
      elss_funds: portfolioHoldings.elss_funds,
      ppf: portfolioHoldings.ppf,
      epf: portfolioHoldings.epf
    },
    financial_goals: {
      goals: financialGoals.goals,
      summary: financialGoals.goals_summary,
      upcoming_milestones: financialGoals.getUpcomingMilestones()
    },
    recent_transactions: transactionHistory.getTransactionsByDateRange('2024-05-01', '2024-07-26'),
    monthly_spending: transactionHistory.getMonthlySpendingSummary()
  };
};

// Specific data getters
const getPortfolioSummary = () => {
  return {
    total_value: portfolioHoldings.summary.total_current_value,
    total_investment: portfolioHoldings.summary.total_investment,
    total_gains: portfolioHoldings.summary.total_gain_loss,
    gain_percentage: portfolioHoldings.summary.gain_loss_percentage,
    asset_allocation: portfolioHoldings.summary.asset_allocation,
    top_holdings: [
      ...portfolioHoldings.stocks.slice(0, 3),
      ...portfolioHoldings.mutual_funds.slice(0, 2)
    ]
  };
};

const getGoalsOverview = () => {
  return {
    total_goals: financialGoals.goals.length,
    goals_on_track: financialGoals.goals.filter(g => 
      g.actual_monthly_savings >= g.monthly_target * 0.9
    ).length,
    next_milestone: financialGoals.getUpcomingMilestones()[0],
    priority_goals: financialGoals.getGoalsByPriority('High')
  };
};

const getRecentActivity = () => {
  const allTransactions = [
    ...transactionHistory.sip_transactions,
    ...transactionHistory.stock_transactions,
    ...transactionHistory.salary_credits,
    ...transactionHistory.expense_transactions
  ];
  
  return allTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
};

const getMonthlyFinancialSnapshot = () => {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlySpending = transactionHistory.getMonthlySpendingSummary();
  
  return {
    month: currentMonth,
    income: demoUser.income.take_home,
    expenses: demoUser.monthly_expenses.total,
    investments: portfolioHoldings.mutual_funds.reduce((sum, mf) => sum + mf.sip_amount, 0),
    savings_rate: ((demoUser.income.take_home - demoUser.monthly_expenses.total) / demoUser.income.take_home * 100).toFixed(2),
    expense_breakdown: monthlySpending[currentMonth] || {}
  };
};

module.exports = {
  demoUser,
  portfolioHoldings,
  transactionHistory,
  financialGoals,
  getUserContext,
  getPortfolioSummary,
  getGoalsOverview,
  getRecentActivity,
  getMonthlyFinancialSnapshot
};