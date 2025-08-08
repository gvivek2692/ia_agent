const fs = require('fs');
const path = require('path');
const { demoUser } = require('./demoUser');

// Demo users (existing functionality)
const demoUsers = [
  {
    id: 'demo-user',
    ...demoUser,
    credentials: {
      email: 'demo@example.com',
      username: 'demo',
      password: 'demo123'
    }
  }
];

// Load uploaded users from file
function loadUploadedUsers() {
  const usersFilePath = path.join(__dirname, 'users.json');
  
  if (!fs.existsSync(usersFilePath)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading uploaded users:', error);
    return [];
  }
}

// Get all users (demo + uploaded)
function getAllUsers() {
  const uploadedUsers = loadUploadedUsers();
  return [...demoUsers, ...uploadedUsers];
}

// Get user by ID
function getUserById(userId) {
  const allUsers = getAllUsers();
  return allUsers.find(user => user.id === userId);
}

// Get user by email
function getUserByEmail(email) {
  const allUsers = getAllUsers();
  return allUsers.find(user => 
    user.credentials.email === email || 
    user.credentials.username === email
  );
}

// Get goals for a specific user
function getGoalsByUserId(userId) {
  const user = getUserById(userId);
  
  if (!user) {
    return [];
  }
  
  // For uploaded users, generate some default goals if not present
  if (!user.financial_goals || !user.financial_goals.goals) {
    // Generate goals based on portfolio value
    const portfolioValue = user.portfolio?.summary?.total_current_value || 500000;
    
    return [
      {
        id: 'emergency-fund',
        name: 'Emergency Fund',
        description: 'Build emergency fund for 6 months expenses',
        target_amount: 300000,
        current_amount: Math.min(50000, portfolioValue * 0.1),
        target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'High',
        category: 'Safety',
        progress_percentage: Math.min(16.67, (portfolioValue * 0.1 / 300000) * 100)
      },
      {
        id: 'house-purchase',
        name: 'House Purchase',
        description: 'Down payment for house purchase',
        target_amount: 2000000,
        current_amount: Math.min(portfolioValue, portfolioValue * 0.6),
        target_date: new Date(Date.now() + 1095 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'High',
        category: 'Investment',
        progress_percentage: Math.min(100, (portfolioValue * 0.6 / 2000000) * 100)
      },
      {
        id: 'retirement',
        name: 'Retirement Fund',
        description: 'Build corpus for comfortable retirement',
        target_amount: 50000000,
        current_amount: Math.min(portfolioValue, portfolioValue * 0.8),
        target_date: new Date(Date.now() + 10950 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'Medium',
        category: 'Long-term',
        progress_percentage: Math.min(100, (portfolioValue * 0.8 / 50000000) * 100)
      }
    ];
  }
  
  return user.financial_goals.goals || [];
}

// Generate transaction history for uploaded users
function getUserTransactions(userId) {
  const user = getUserById(userId);
  
  if (!user) {
    return [];
  }
  
  // If user has existing transactions, return them
  if (user.transaction_history) {
    return user.transaction_history;
  }
  
  // For uploaded users, load from separate transactions file
  const transactionsPath = path.join(__dirname, '../data/portfolioTransactions', `${userId}.json`);
  
  if (fs.existsSync(transactionsPath)) {
    try {
      const data = fs.readFileSync(transactionsPath, 'utf8');
      const portfolioTransactions = JSON.parse(data);
      
      // Convert portfolio transactions to general transaction format
      return portfolioTransactions.transactions.map(txn => ({
        id: txn.id,
        date: txn.date,
        description: `${txn.transaction_type} - ${txn.scheme_name}`,
        amount: txn.transaction_type === 'Purchase' ? -txn.amount : txn.amount,
        category: 'Investment',
        type: txn.transaction_type === 'Purchase' ? 'debit' : 'credit',
        balance: 0 // Will be calculated if needed
      }));
    } catch (error) {
      console.error('Error loading user transactions:', error);
    }
  }
  
  // Generate some default transactions based on portfolio
  const portfolio = user.portfolio;
  if (!portfolio || !portfolio.mutual_funds) {
    return [];
  }
  
  const transactions = [];
  
  // Generate transactions from mutual fund data
  portfolio.mutual_funds.forEach(fund => {
    // Add investment transaction
    transactions.push({
      id: `txn-${fund.folio_number}-1`,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: `SIP Investment - ${fund.scheme_name}`,
      amount: -(fund.sip_amount || 5000),
      category: 'Investment',
      type: 'debit',
      balance: 0
    });
  });
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = {
  users: demoUsers, // For backward compatibility
  getAllUsers,
  getUserById,
  getUserByEmail,
  getGoalsByUserId,
  getUserTransactions
};