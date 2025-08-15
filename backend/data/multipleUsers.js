const fs = require('fs');
const path = require('path');
const { demoUser } = require('./demoUser');
const { getUserContext } = require('./index');
const { generatePersonalizedPortfolio, calculatePortfolioSummary } = require('./personalizedPortfolios');

// Helper function to create demo user with personalized portfolio
function createDemoUser(profile, variations = {}) {
  const baseContext = getUserContext();
  
  // Apply variations to the base context
  const modifiedContext = JSON.parse(JSON.stringify(baseContext)); // deep clone
  
  // Update user profile
  if (variations.user_profile) {
    Object.assign(modifiedContext.user_profile, variations.user_profile);
  }
  
  // Update financial profile
  if (variations.financial_profile) {
    Object.assign(modifiedContext.financial_profile, variations.financial_profile);
  }
  
  // Update investment profile
  if (variations.investment_profile) {
    Object.assign(modifiedContext.investment_profile, variations.investment_profile);
  }
  
  // Generate personalized portfolio based on risk profile and target amount
  if (variations.portfolio_target_amount && variations.risk_profile) {
    const portfolioHoldings = generatePersonalizedPortfolio(
      variations.risk_profile, 
      variations.portfolio_target_amount
    );
    
    // Calculate portfolio summary
    const portfolioSummary = calculatePortfolioSummary(
      portfolioHoldings.stocks, 
      portfolioHoldings.mutual_funds
    );
    
    // Update portfolio data
    modifiedContext.portfolio.stocks = portfolioHoldings.stocks;
    modifiedContext.portfolio.mutual_funds = portfolioHoldings.mutual_funds;
    modifiedContext.portfolio.summary = portfolioSummary;
  } else if (variations.portfolio_multiplier) {
    // Fallback to old method for backward compatibility
    const multiplier = variations.portfolio_multiplier;
    modifiedContext.portfolio.summary.total_investment = Math.round(modifiedContext.portfolio.summary.total_investment * multiplier);
    modifiedContext.portfolio.summary.total_current_value = Math.round(modifiedContext.portfolio.summary.total_current_value * multiplier);
    modifiedContext.portfolio.summary.total_gain_loss = modifiedContext.portfolio.summary.total_current_value - modifiedContext.portfolio.summary.total_investment;
    modifiedContext.portfolio.summary.gain_loss_percentage = Math.round(((modifiedContext.portfolio.summary.total_gain_loss / modifiedContext.portfolio.summary.total_investment) * 100) * 100) / 100;
  }
  
  return {
    id: profile.id,
    ...modifiedContext,
    credentials: profile.credentials
  };
}

// Demo users with diverse profiles and personalized portfolios
const demoUsers = [
  // Priya Sharma - Conservative Software Engineer
  createDemoUser({
    id: 'priya-sharma',
    credentials: {
      email: 'priya.sharma@email.com',
      username: 'priya.sharma',
      password: 'demo123'
    }
  }, {
    user_profile: {
      name: 'Priya Sharma',
      age: 28,
      profession: 'Software Engineer',
      location: 'Bangalore, Karnataka'
    },
    investment_profile: {
      risk_tolerance: 'conservative',
      investment_experience: 'beginner'
    },
    risk_profile: 'conservative',
    portfolio_target_amount: 550000
  }),
  
  // Rajesh Kumar - Aggressive Business Owner
  createDemoUser({
    id: 'rajesh-kumar',
    credentials: {
      email: 'rajesh.kumar@email.com',
      username: 'rajesh.kumar',
      password: 'demo123'
    }
  }, {
    user_profile: {
      name: 'Rajesh Kumar',
      age: 35,
      profession: 'Business Owner',
      location: 'Mumbai, Maharashtra'
    },
    financial_profile: {
      monthly_salary: 200000,
      annual_ctc: 2500000,
      take_home: 180000
    },
    investment_profile: {
      risk_tolerance: 'aggressive',
      investment_experience: 'advanced'
    },
    risk_profile: 'aggressive',
    portfolio_target_amount: 1400000
  }),
  
  // Dr. Anita Desai - Moderate Medical Professional
  createDemoUser({
    id: 'anita-desai',
    credentials: {
      email: 'anita.desai@email.com',
      username: 'anita.desai',
      password: 'demo123'
    }
  }, {
    user_profile: {
      name: 'Dr. Anita Desai',
      age: 32,
      profession: 'Medical Doctor',
      location: 'Delhi, NCR'
    },
    financial_profile: {
      monthly_salary: 150000,
      annual_ctc: 2000000,
      take_home: 130000
    },
    investment_profile: {
      risk_tolerance: 'moderate',
      investment_experience: 'intermediate'
    },
    risk_profile: 'moderate',
    portfolio_target_amount: 980000
  }),
  
  // Arjun Singh - Young Aggressive Tech Professional
  createDemoUser({
    id: 'arjun-singh',
    credentials: {
      email: 'arjun.singh@email.com',
      username: 'arjun.singh',
      password: 'demo123'
    }
  }, {
    user_profile: {
      name: 'Arjun Singh',
      age: 26,
      profession: 'Software Developer',
      location: 'Pune, Maharashtra'
    },
    financial_profile: {
      monthly_salary: 95000,
      annual_ctc: 1300000,
      take_home: 80000
    },
    investment_profile: {
      risk_tolerance: 'aggressive',
      investment_experience: 'intermediate'
    },
    risk_profile: 'aggressive',
    portfolio_target_amount: 320000
  }),
  
  // Meera Patel - Conservative Senior Manager
  createDemoUser({
    id: 'meera-patel',
    credentials: {
      email: 'meera.patel@email.com',
      username: 'meera.patel',
      password: 'demo123'
    }
  }, {
    user_profile: {
      name: 'Meera Patel',
      age: 38,
      profession: 'Senior Manager',
      location: 'Ahmedabad, Gujarat'
    },
    financial_profile: {
      monthly_salary: 175000,
      annual_ctc: 2300000,
      take_home: 145000
    },
    investment_profile: {
      risk_tolerance: 'conservative',
      investment_experience: 'advanced'
    },
    risk_profile: 'conservative',
    portfolio_target_amount: 1200000
  }),
  
  // Keep the original demo user for backward compatibility
  {
    id: 'demo-user',
    ...getUserContext(),
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