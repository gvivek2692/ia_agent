/**
 * Demo User Profile - Realistic Young Indian Professional
 * Represents a typical user for the AI Wealth Advisor demo
 */

const demoUser = {
  // Personal Information
  profile: {
    name: "Priya Sharma",
    age: 28,
    location: "Bangalore, Karnataka",
    profession: "Software Engineer",
    company: "Tech Solutions Pvt Ltd",
    experience: "5 years",
    education: "B.Tech Computer Science"
  },

  // Financial Profile
  income: {
    monthly_salary: 120000, // ₹1.2L per month
    annual_ctc: 1600000, // ₹16L CTC
    take_home: 100000, // ₹1L after taxes and deductions
    bonus_frequency: "annual",
    last_bonus: 150000, // ₹1.5L annual bonus
    other_income: 5000 // ₹5K from freelancing
  },

  // Investment Profile
  investment_profile: {
    risk_tolerance: "moderate", // conservative, moderate, aggressive
    investment_experience: "intermediate", // beginner, intermediate, advanced
    investment_horizon: "long_term", // short_term, medium_term, long_term
    preferred_instruments: ["mutual_funds", "stocks", "ppf", "elss"],
    investment_knowledge_score: 7, // out of 10
    started_investing: "2021-03-01"
  },

  // Banking Details
  banking: {
    primary_bank: "HDFC Bank",
    salary_account: "HDFC Bank",
    savings_balance: 250000, // ₹2.5L in savings
    fd_amount: 100000, // ₹1L in FD
    emergency_fund_target: 600000, // 6 months of expenses
    current_emergency_fund: 350000
  },

  // Monthly Expenses Breakdown
  monthly_expenses: {
    rent: 25000,
    food_dining: 12000,
    transportation: 8000,
    utilities: 3000,
    entertainment: 6000,
    shopping: 8000,
    healthcare: 2000,
    insurance: 4000,
    subscriptions: 2000,
    miscellaneous: 5000,
    total: 75000
  },

  // Current Financial Status
  net_worth: {
    total_assets: 1450000,
    total_liabilities: 0, // No major debt
    liquid_assets: 350000,
    invested_assets: 1100000,
    net_worth: 1450000
  }
};

module.exports = demoUser;