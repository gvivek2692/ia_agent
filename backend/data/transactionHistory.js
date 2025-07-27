/**
 * Demo Transaction History - 12 Months of Financial Activity
 * Realistic transactions for a young Indian professional
 */

const transactionHistory = {
  // Monthly SIP Investments
  sip_transactions: [
    // June 2023
    { date: "2023-06-05", type: "SIP", description: "SBI Bluechip Fund SIP", amount: -8000, category: "Investment", balance_after: 242000 },
    { date: "2023-06-10", type: "SIP", description: "Axis Midcap Fund SIP", amount: -5000, category: "Investment", balance_after: 237000 },
    
    // July 2023
    { date: "2023-07-05", type: "SIP", description: "SBI Bluechip Fund SIP", amount: -8000, category: "Investment", balance_after: 229000 },
    { date: "2023-07-10", type: "SIP", description: "Axis Midcap Fund SIP", amount: -5000, category: "Investment", balance_after: 224000 },
    
    // August 2023
    { date: "2023-08-05", type: "SIP", description: "SBI Bluechip Fund SIP", amount: -8000, category: "Investment", balance_after: 216000 },
    { date: "2023-08-10", type: "SIP", description: "Axis Midcap Fund SIP", amount: -5000, category: "Investment", balance_after: 211000 },
    { date: "2023-08-15", type: "SIP", description: "Mirae Asset Large & Midcap Fund SIP", amount: -7000, category: "Investment", balance_after: 204000 },
    
    // September 2023 onwards...
    { date: "2023-09-05", type: "SIP", description: "SBI Bluechip Fund SIP", amount: -8000, category: "Investment", balance_after: 196000 },
    { date: "2023-09-10", type: "SIP", description: "Axis Midcap Fund SIP", amount: -5000, category: "Investment", balance_after: 191000 },
    { date: "2023-09-15", type: "SIP", description: "Mirae Asset Large & Midcap Fund SIP", amount: -7000, category: "Investment", balance_after: 184000 },
    { date: "2023-09-20", type: "SIP", description: "HDFC Hybrid Equity Fund SIP", amount: -6000, category: "Investment", balance_after: 178000 },
    
    // Continue pattern for remaining months...
    { date: "2024-01-25", type: "SIP", description: "Parag Parikh Flexi Cap Fund SIP", amount: -3000, category: "Investment", balance_after: 145000 },
    { date: "2024-06-05", type: "SIP", description: "SBI Bluechip Fund SIP", amount: -8000, category: "Investment", balance_after: 242000 },
    { date: "2024-06-10", type: "SIP", description: "Axis Midcap Fund SIP", amount: -5000, category: "Investment", balance_after: 237000 },
    { date: "2024-06-15", type: "SIP", description: "Mirae Asset Large & Midcap Fund SIP", amount: -7000, category: "Investment", balance_after: 230000 },
    { date: "2024-06-20", type: "SIP", description: "HDFC Hybrid Equity Fund SIP", amount: -6000, category: "Investment", balance_after: 224000 },
    { date: "2024-06-25", type: "SIP", description: "Parag Parikh Flexi Cap Fund SIP", amount: -3000, category: "Investment", balance_after: 221000 }
  ],

  // Stock Purchase Transactions
  stock_transactions: [
    { date: "2023-08-15", type: "Stock Buy", description: "INFY - 10 shares @ ₹1450", amount: -14500, category: "Investment", balance_after: 189500 },
    { date: "2023-09-10", type: "Stock Buy", description: "HDFCBANK - 5 shares @ ₹1680", amount: -8400, category: "Investment", balance_after: 181100 },
    { date: "2023-11-20", type: "Stock Buy", description: "TCS - 5 shares @ ₹3850", amount: -19250, category: "Investment", balance_after: 161850 },
    { date: "2023-12-05", type: "Stock Buy", description: "HDFCBANK - 3 shares @ ₹1680", amount: -5040, category: "Investment", balance_after: 156810 },
    { date: "2024-01-20", type: "Stock Buy", description: "INFY - 5 shares @ ₹1450", amount: -7250, category: "Investment", balance_after: 149560 },
    { date: "2024-02-14", type: "Stock Buy", description: "RELIANCE - 6 shares @ ₹2800", amount: -16800, category: "Investment", balance_after: 132760 },
    { date: "2024-03-10", type: "Stock Buy", description: "BAJFINANCE - 3 shares @ ₹7200", amount: -21600, category: "Investment", balance_after: 111160 }
  ],

  // Salary Credits
  salary_credits: [
    { date: "2023-06-30", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 342000 },
    { date: "2023-07-31", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 324000 },
    { date: "2023-08-31", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 304000 },
    { date: "2023-09-30", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 278000 },
    { date: "2023-10-31", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 252000 },
    { date: "2023-11-30", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 232850 },
    { date: "2023-12-29", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 227810 },
    { date: "2024-01-31", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 220560 },
    { date: "2024-02-29", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 203760 },
    { date: "2024-03-29", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 182160 },
    { date: "2024-04-30", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 207160 },
    { date: "2024-05-31", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 232160 },
    { date: "2024-06-28", type: "Salary", description: "Monthly Salary Credit", amount: 100000, category: "Income", balance_after: 321160 }
  ],

  // Annual Bonus
  bonus_transactions: [
    { date: "2024-03-15", type: "Bonus", description: "Annual Performance Bonus", amount: 150000, category: "Income", balance_after: 261160 }
  ],

  // Monthly Expenses
  expense_transactions: [
    // June 2023 Expenses
    { date: "2023-06-01", type: "Rent", description: "Monthly Rent Payment", amount: -25000, category: "Housing", balance_after: 217000 },
    { date: "2023-06-05", type: "Groceries", description: "Monthly Groceries", amount: -8000, category: "Food", balance_after: 209000 },
    { date: "2023-06-10", type: "Utilities", description: "Electricity & Water Bill", amount: -3000, category: "Utilities", balance_after: 206000 },
    { date: "2023-06-15", type: "Transportation", description: "Fuel & Cab Charges", amount: -6000, category: "Transport", balance_after: 200000 },
    { date: "2023-06-20", type: "Dining", description: "Restaurant & Food Delivery", amount: -4000, category: "Food", balance_after: 196000 },
    
    // July 2023 Expenses
    { date: "2023-07-01", type: "Rent", description: "Monthly Rent Payment", amount: -25000, category: "Housing", balance_after: 299000 },
    { date: "2023-07-08", type: "Shopping", description: "Clothing & Personal Items", amount: -8000, category: "Shopping", balance_after: 291000 },
    { date: "2023-07-12", type: "Entertainment", description: "Movies & Weekend Activities", amount: -3000, category: "Entertainment", balance_after: 288000 },
    { date: "2023-07-18", type: "Healthcare", description: "Medical Checkup", amount: -2000, category: "Healthcare", balance_after: 286000 },
    
    // Pattern continues for other months...
    { date: "2024-06-01", type: "Rent", description: "Monthly Rent Payment", amount: -25000, category: "Housing", balance_after: 296160 },
    { date: "2024-06-08", type: "Groceries", description: "Monthly Groceries", amount: -8000, category: "Food", balance_after: 288160 },
    { date: "2024-06-12", type: "Utilities", description: "Electricity & Water Bill", amount: -3000, category: "Utilities", balance_after: 285160 },
    { date: "2024-06-15", type: "Transportation", description: "Fuel & Public Transport", amount: -6000, category: "Transport", balance_after: 279160 },
    { date: "2024-06-20", type: "Entertainment", description: "Weekend Movies & Dining", amount: -5000, category: "Entertainment", balance_after: 274160 }
  ],

  // Insurance Payments
  insurance_transactions: [
    { date: "2023-07-15", type: "Insurance", description: "Health Insurance Premium", amount: -12000, category: "Insurance", balance_after: 276000 },
    { date: "2023-08-20", type: "Insurance", description: "Term Life Insurance Premium", amount: -15000, category: "Insurance", balance_after: 189000 },
    { date: "2024-07-15", type: "Insurance", description: "Health Insurance Premium Renewal", amount: -13000, category: "Insurance", balance_after: 261160 }
  ],

  // PPF Contributions
  ppf_transactions: [
    { date: "2023-03-31", type: "PPF", description: "Annual PPF Contribution", amount: -150000, category: "Investment", balance_after: 150000 },
    { date: "2024-03-31", type: "PPF", description: "Annual PPF Contribution", amount: -150000, category: "Investment", balance_after: 111160 }
  ],

  // Tax Payments
  tax_transactions: [
    { date: "2023-07-31", type: "Tax", description: "Income Tax Payment", amount: -45000, category: "Tax", balance_after: 279000 },
    { date: "2024-03-31", type: "Tax", description: "Advance Tax Payment", amount: -25000, category: "Tax", balance_after: 86160 }
  ],

  // Other Income
  other_income: [
    { date: "2023-08-30", type: "Freelancing", description: "Website Development Project", amount: 15000, category: "Income", balance_after: 219000 },
    { date: "2023-12-15", type: "Interest", description: "FD Interest Credit", amount: 3500, category: "Income", balance_after: 231310 },
    { date: "2024-04-10", type: "Freelancing", description: "Mobile App Development", amount: 20000, category: "Income", balance_after: 227160 }
  ]
};

// Helper function to get transactions by category
const getTransactionsByCategory = (category) => {
  const allTransactions = [
    ...transactionHistory.sip_transactions,
    ...transactionHistory.stock_transactions,
    ...transactionHistory.salary_credits,
    ...transactionHistory.bonus_transactions,
    ...transactionHistory.expense_transactions,
    ...transactionHistory.insurance_transactions,
    ...transactionHistory.ppf_transactions,
    ...transactionHistory.tax_transactions,
    ...transactionHistory.other_income
  ];
  
  return allTransactions
    .filter(t => t.category === category)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Helper function to get transactions by date range
const getTransactionsByDateRange = (startDate, endDate) => {
  const allTransactions = [
    ...transactionHistory.sip_transactions,
    ...transactionHistory.stock_transactions,
    ...transactionHistory.salary_credits,
    ...transactionHistory.bonus_transactions,
    ...transactionHistory.expense_transactions,
    ...transactionHistory.insurance_transactions,
    ...transactionHistory.ppf_transactions,
    ...transactionHistory.tax_transactions,
    ...transactionHistory.other_income
  ];
  
  return allTransactions
    .filter(t => new Date(t.date) >= new Date(startDate) && new Date(t.date) <= new Date(endDate))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Calculate monthly spending summary
const getMonthlySpendingSummary = () => {
  const expenses = transactionHistory.expense_transactions;
  const monthlyData = {};
  
  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7); // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = {};
    }
    if (!monthlyData[month][expense.category]) {
      monthlyData[month][expense.category] = 0;
    }
    monthlyData[month][expense.category] += Math.abs(expense.amount);
  });
  
  return monthlyData;
};

// Add helper functions to the export
transactionHistory.getTransactionsByCategory = getTransactionsByCategory;
transactionHistory.getTransactionsByDateRange = getTransactionsByDateRange;
transactionHistory.getMonthlySpendingSummary = getMonthlySpendingSummary;

module.exports = transactionHistory;