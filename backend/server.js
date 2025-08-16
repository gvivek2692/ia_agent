const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

// Load environment variables FIRST
const envResult = dotenv.config();
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
}

// Now import modules that depend on environment variables
const { OpenAI } = require('openai');
const { getUserContext, getPortfolioSummary, getGoalsOverview, getRecentActivity } = require('./data');
const conversationManager = require('./services/conversationManager');
const marketDataService = require('./services/marketDataService');
const conversationHistoryService = require('./services/conversationHistoryService');
const authService = require('./services/authService');
const webSearchService = require('./services/webSearchService');
const { users, getUserById, getUserByEmail, getGoalsByUserId, getAllUsers } = require('./data/multipleUsers');
const { getUserTransactions } = require('./data/userTransactions');
const uploadService = require('./services/uploadService');
const { generateCompleteAIInsights } = require('./data/aiInsights');
const { calculateRiskAnalysis } = require('./data/riskCalculations');
const { generatePortfolioRecommendations } = require('./data/portfolioRecommendations');
const { generateMarketAnalysis } = require('./data/marketAnalysis');
const KiteService = require('./services/kiteService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://ia-agent-aguf.onrender.com",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.github\.io$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://localhost:3000", 
    "https://ia-agent-aguf.onrender.com",
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.github\.io$/
  ],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept Excel files only
    if (file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.match(/\.(xls|xlsx)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Wealth advisor response function with web search integration
const getWealthAdvisorResponse = async (userMessage, userContext = null, customSystemPrompt = null) => {
  try {
    let systemPrompt = customSystemPrompt || buildSystemPrompt(userContext);
    let webSearchResults = null;
    let searchSources = [];
    
    // Check if web search is needed for this query
    if (webSearchService.shouldPerformWebSearch(userMessage, userContext)) {
      console.log('Performing web search for query:', userMessage);
      
      // Generate optimized search query
      const searchQuery = webSearchService.generateSearchQuery(userMessage, userContext);
      console.log('Search query:', searchQuery);
      
      // Perform web search
      const searchResults = await webSearchService.search(searchQuery, {
        location: userContext?.user_profile?.location || 'India',
        num: 5
      });
      
      if (!searchResults.error) {
        webSearchResults = webSearchService.summarizeSearchResults(searchResults);
        searchSources = webSearchService.extractSources(searchResults);
        
        console.log('Web search completed. Found', searchSources.length, 'sources');
        
        // Enhance system prompt with search results
        systemPrompt += `\n\n${webSearchResults}`;
      } else {
        console.log('Web search error:', searchResults.error);
      }
    }
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using demo response');
      let demoResponse = "I'm currently in demo mode. In production, I would provide AI-powered financial advice using the latest market data and your personal financial context.";
      
      if (webSearchResults) {
        demoResponse += `\n\nBased on current web search:\n${webSearchResults}`;
      }
      
      return demoResponse;
    }
    
    // Use the standard chat completions API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a valid model name
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: webSearchResults ? 2500 : 1500, // More tokens if we have search results
      temperature: 0.7
    });

    let aiResponse = response.choices[0].message.content;
    
    // Add source citations if we performed web search
    if (searchSources.length > 0) {
      aiResponse += `\n\n---\n**Sources:**\n`;
      searchSources.forEach((source, index) => {
        const sourceNum = index + 1;
        let sourceText = `${sourceNum}. [${source.title}](${source.link})`;
        if (source.date) sourceText += ` - ${source.date}`;
        aiResponse += sourceText + '\n';
      });
    }

    return aiResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Provide more specific error messages based on error type
    if (error.code === 'invalid_api_key') {
      return "I'm experiencing authentication issues with the AI service. Please try again later.";
    } else if (error.code === 'rate_limit_exceeded') {
      return "I'm currently handling many requests. Please try again in a moment.";
    } else if (error.code === 'model_not_found') {
      return "I'm experiencing technical difficulties with the AI model. Please try again later.";
    } else {
      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    }
  }
};

// Build comprehensive system prompt for wealth advisory
const buildSystemPrompt = (userContext, conversationContext = '') => {
  const fullUserContext = userContext || getUserContext();
  
  let prompt = `You are an expert AI wealth advisor specializing in Indian financial markets and investment planning. 
Your role is to provide personalized, actionable financial advice to help users achieve their financial goals.

CORE CAPABILITIES:
- Portfolio analysis and optimization with real-time market data
- Investment recommendations for Indian markets (stocks, mutual funds, bonds)
- Financial goal planning and SIP calculations
- Risk assessment and asset allocation
- Tax planning and optimization
- Live market analysis and economic insights via web search
- Expense analysis and budgeting advice
- Current news analysis affecting user's investments

REAL-TIME DATA ACCESS:
- I have access to live web search for current market prices, news, and economic data
- I automatically search for latest information when discussing market conditions
- I can provide up-to-date analysis of stocks in user's portfolio
- I stay informed about latest RBI policies, budget announcements, and market events

COMMUNICATION STYLE:
- Professional yet conversational
- Clear, actionable advice with current market context
- Always include risk warnings where appropriate
- When web search results are provided, ALWAYS use them prominently in your response
- Reference specific data points, prices, and news from the search results
- Explain financial concepts in simple terms
- Focus on long-term wealth building with current market awareness
- Personalize advice based on user's specific profile and current market conditions

WEB SEARCH INTEGRATION:
- When CURRENT WEB SEARCH RESULTS are provided, they contain the most recent market data
- ALWAYS prioritize this real-time information over general knowledge
- Quote specific prices, percentages, and data from the search results
- Mention when information is "based on latest market data" or "according to recent reports"
- Use the exact figures and details provided in the search results
- Do NOT provide generic market information when current search results are available

INDIAN MARKET FOCUS:
- NSE and BSE listed stocks
- Indian mutual funds (equity, debt, hybrid)
- Indian fixed deposits, bonds, and debt instruments
- Tax implications under Indian tax laws
- Investment limits and regulations (80C, ELSS, etc.)
- Currency considerations (INR-based planning)

CURRENT USER PROFILE:
- Name: ${fullUserContext.user_profile.name}
- Age: ${fullUserContext.user_profile.age}, ${fullUserContext.user_profile.profession}
- Location: ${fullUserContext.user_profile.location}
- Monthly Income: ₹${fullUserContext.financial_profile.take_home.toLocaleString()}
- Risk Profile: ${fullUserContext.investment_profile.risk_tolerance}

CURRENT PORTFOLIO OVERVIEW:
- Total Portfolio Value: ₹${fullUserContext.portfolio.summary.total_current_value.toLocaleString()}
- Total Investment: ₹${fullUserContext.portfolio.summary.total_investment.toLocaleString()}
- Overall Gains: ₹${fullUserContext.portfolio.summary.total_gain_loss.toLocaleString()} (${fullUserContext.portfolio.summary.gain_loss_percentage}%)

ASSET ALLOCATION:
- Stocks: ₹${fullUserContext.portfolio.summary.asset_allocation.stocks?.value?.toLocaleString() || '0'} (${fullUserContext.portfolio.summary.asset_allocation.stocks?.percentage || '0.0'}%)
- Mutual Funds: ₹${fullUserContext.portfolio.summary.asset_allocation.mutual_funds?.value?.toLocaleString() || '0'} (${fullUserContext.portfolio.summary.asset_allocation.mutual_funds?.percentage || '0.0'}%)
- PPF: ₹${fullUserContext.portfolio.summary.asset_allocation.ppf?.value?.toLocaleString() || '0'} (${fullUserContext.portfolio.summary.asset_allocation.ppf?.percentage || '0.0'}%)

FINANCIAL GOALS STATUS:
${fullUserContext.financial_goals.goals.map(goal => 
  `- ${goal.name}: ₹${goal.current_amount.toLocaleString()}/₹${goal.target_amount.toLocaleString()} (${goal.progress_percentage.toFixed(1)}% complete)`
).join('\n')}

RECENT ACTIVITY:
${fullUserContext.recent_transactions.slice(0, 5).map(txn => 
  `- ${txn.date}: ${txn.description} - ₹${Math.abs(txn.amount).toLocaleString()}`
).join('\n')}

${marketDataService.generateMarketInsights(fullUserContext)}

IMPORTANT: Always provide specific, personalized advice based on the user's actual financial situation shown above. Reference specific holdings, goals, and transactions when relevant.

RESPONSE FORMATTING:
- Use markdown formatting for better readability
- Use tables for financial data comparison
- Use bullet points for recommendations
- Include specific numbers with ₹ symbol
- Bold important financial terms and amounts
- Use headings to organize complex responses
- When showing portfolio data, format as tables with current values and percentages

${conversationContext}

CONVERSATION GUIDELINES:
- Reference previous discussion points when relevant
- Build upon earlier recommendations
- Acknowledge user's stated preferences
- Provide continuity in advice across messages
- If this is a follow-up question, connect it to previous context`;

  return prompt;
};

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Wealth Advisor Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.login(email, password);
    const statusCode = result.success ? 200 : 401;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
        code: 'MISSING_SESSION_ID'
      });
    }

    const result = await authService.logout(sessionId);
    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error('Logout endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const sessionId = req.headers['x-session-id'];
  
  if (token) {
    const result = authService.verifyToken(token);
    return res.json(result);
  }
  
  if (sessionId) {
    const result = authService.getSession(sessionId);
    return res.json(result);
  }
  
  res.status(400).json({
    success: false,
    error: 'Token or session ID required',
    code: 'MISSING_AUTH'
  });
});

app.get('/api/auth/session', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'Session ID required',
      code: 'MISSING_SESSION_ID'
    });
  }
  
  const result = authService.getUserBySession(sessionId);
  const statusCode = result.success ? 200 : 404;
  res.status(statusCode).json(result);
});

// User management endpoints
app.get('/api/users', (req, res) => {
  try {
    const allUsers = getAllUsers();
    res.json({
      success: true,
      users: allUsers,
      count: allUsers.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      code: 'SERVER_ERROR'
    });
  }
});

app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Remove password from response
    const { credentials, ...userWithoutPassword } = user;
    const { password, ...credentialsWithoutPassword } = credentials;

    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        credentials: credentialsWithoutPassword
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
      code: 'SERVER_ERROR'
    });
  }
});

// User-specific data endpoints (protected)
app.get('/api/user/:userId/context', (req, res) => {
  try {
    const { userId } = req.params;
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Build user context similar to existing getUserContext but for specific user
    const userContext = {
      user_profile: user.user_profile,
      financial_profile: user.financial_profile,
      investment_profile: user.investment_profile,
      portfolio: user.portfolio,
      financial_goals: {
        goals: getGoalsForUser(userId)
      },
      recent_transactions: getUserTransactions(userId).slice(0, 10)
    };

    res.json(userContext);
  } catch (error) {
    console.error('Get user context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user context',
      code: 'SERVER_ERROR'
    });
  }
});

app.get('/api/user/:userId/transactions', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const transactions = getUserTransactions(userId);
    const paginatedTransactions = transactions.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      success: true,
      transactions: paginatedTransactions,
      total: transactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transactions',
      code: 'SERVER_ERROR'
    });
  }
});

app.get('/api/user/:userId/goals', (req, res) => {
  try {
    const { userId } = req.params;
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const goals = getGoalsByUserId(userId);
    res.json({
      success: true,
      goals: goals,
      count: goals.length
    });
  } catch (error) {
    console.error('Get user goals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve goals',
      code: 'SERVER_ERROR'
    });
  }
});

// Legacy demo data endpoints (for backward compatibility)
app.get('/api/user/context', (req, res) => {
  res.json(getUserContext());
});

app.get('/api/portfolio/summary', (req, res) => {
  res.json(getPortfolioSummary());
});

app.get('/api/goals/overview', (req, res) => {
  res.json(getGoalsOverview());
});

// Upload and User Registration Endpoints
app.post('/api/upload/mf-statement', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check if user already exists
    if (uploadService.checkUserExists(username)) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists',
        code: 'USER_EXISTS'
      });
    }

    console.log('Processing file:', req.file.filename);
    
    // Parse Excel file
    const parseResult = uploadService.parseExcelFile(req.file.path);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error,
        code: 'PARSE_ERROR'
      });
    }

    console.log(`Parsed ${parseResult.validRows} valid transactions from ${parseResult.totalRows} total rows`);

    // Extract user profile
    const userProfile = uploadService.extractUserProfile(parseResult.transactions);
    
    // Generate portfolio
    const portfolio = uploadService.generatePortfolio(parseResult.transactions);
    
    // Create user account
    const createResult = await uploadService.createUser(userProfile, username, password, portfolio);
    
    if (!createResult.success) {
      return res.status(500).json({
        success: false,
        error: createResult.error,
        code: 'USER_CREATION_ERROR'
      });
    }

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Account created successfully',
      userId: createResult.userId,
      portfolio: {
        totalSchemes: portfolio.mutual_funds.length,
        totalInvestment: portfolio.summary.total_investment,
        totalCurrentValue: portfolio.summary.total_current_value,
        totalGainLoss: portfolio.summary.total_gain_loss,
        gainLossPercentage: portfolio.summary.gain_loss_percentage
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && require('fs').existsSync(req.file.path)) {
      require('fs').unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'File processing failed: ' + error.message,
      code: 'PROCESSING_ERROR'
    });
  }
});

// Check username availability
app.post('/api/check-username', (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }

    const exists = uploadService.checkUserExists(username);
    
    res.json({
      success: true,
      available: !exists,
      message: exists ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check username availability'
    });
  }
});

// Web search API endpoint for testing
app.post('/api/search', async (req, res) => {
  try {
    const { query, location, num } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchResults = await webSearchService.search(query, {
      location: location || 'India',
      num: num || 5
    });

    res.json({
      success: !searchResults.error,
      results: searchResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      success: false,
      error: 'Search service unavailable'
    });
  }
});

app.get('/api/transactions/recent', (req, res) => {
  res.json(getRecentActivity());
});

app.get('/api/market/overview', (req, res) => {
  res.json(marketDataService.getMarketOverview());
});

app.get('/api/market/portfolio-impact', (req, res) => {
  const userContext = getUserContext();
  const portfolioMarketData = marketDataService.getPortfolioMarketData(userContext.portfolio.stocks);
  res.json(portfolioMarketData);
});

// Conversation History API Endpoints
app.get('/api/conversations', async (req, res) => {
  try {
    const { limit = 50, offset = 0, userId = 'demo-user' } = req.query;
    const conversations = await conversationHistoryService.getConversations(userId, parseInt(limit), parseInt(offset));
    res.json(conversations);
  } catch (error) {
    console.error('Failed to get conversations:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await conversationHistoryService.loadConversation(id);
    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to get conversation:', error);
    res.status(500).json({ error: 'Failed to retrieve conversation' });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await conversationHistoryService.deleteConversation(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.put('/api/conversations/:id/title', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const success = await conversationHistoryService.renameConversation(id, title);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to rename conversation:', error);
    res.status(500).json({ error: 'Failed to rename conversation' });
  }
});

app.put('/api/conversations/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await conversationHistoryService.archiveConversation(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Conversation not found' });
    }
  } catch (error) {
    console.error('Failed to archive conversation:', error);
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
});

app.get('/api/conversations/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { userId = 'demo-user' } = req.query;
    const results = await conversationHistoryService.searchConversations(query, userId);
    res.json(results);
  } catch (error) {
    console.error('Failed to search conversations:', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

app.get('/api/conversations/stats', async (req, res) => {
  try {
    const { userId = 'demo-user' } = req.query;
    const stats = await conversationHistoryService.getStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Failed to get conversation stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// AI Insights API endpoint - Now fully personalized
// Helper function to get user by ID (supports both demo and Kite users)
function getAnyUserById(userId) {
  // Check if it's a Kite user
  if (userId.startsWith('kite-')) {
    const kiteUserId = userId.replace('kite-', '');
    return kiteUserSessions.get(kiteUserId);
  }
  
  // Handle demo users
  return getUserById(userId);
}

// Helper function to get goals for any user (Kite or demo)
function getGoalsForUser(userId) {
  const user = getAnyUserById(userId);
  if (!user) {
    return [];
  }
  
  // For Kite users, get goals from their session data
  if (userId.startsWith('kite-')) {
    return user.financial_goals?.goals || [];
  }
  
  // For demo/uploaded users, use the existing function
  return getGoalsByUserId(userId);
}

// Default goal generation logic
function generateDefaultGoals(yearlyIncome, age, portfolioValue = 0) {
  // Emergency Fund: 6 months of expenses (assuming expenses are 70% of income)
  const monthlyExpenses = (yearlyIncome * 0.7) / 12;
  const emergencyFundTarget = monthlyExpenses * 6;
  const emergencyFundCurrent = Math.min(portfolioValue * 0.1, emergencyFundTarget); // Assume 10% of portfolio is liquid
  
  // Retirement Planning: Based on age and income
  const retirementAge = 60;
  const yearsToRetirement = Math.max(retirementAge - age, 5); // Minimum 5 years
  const retirementCorpusMultiplier = yearlyIncome * 25; // 25x annual income for retirement
  const retirementCurrent = Math.max(portfolioValue * 0.8, 0); // Assume 80% of portfolio is for retirement
  
  const goals = [
    {
      id: `emergency-fund-${Date.now()}`,
      name: 'Emergency Fund',
      description: `Build emergency fund covering 6 months of expenses (₹${Math.round(monthlyExpenses).toLocaleString('en-IN')} per month)`,
      target_amount: Math.round(emergencyFundTarget),
      current_amount: Math.round(emergencyFundCurrent),
      target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      priority: 'High',
      category: 'Emergency',
      progress_percentage: emergencyFundTarget > 0 ? Math.round((emergencyFundCurrent / emergencyFundTarget) * 100) : 0
    },
    {
      id: `retirement-${Date.now()}`,
      name: 'Retirement Planning',
      description: `Build retirement corpus for financial independence by age ${retirementAge}`,
      target_amount: Math.round(retirementCorpusMultiplier),
      current_amount: Math.round(retirementCurrent),
      target_date: new Date(Date.now() + yearsToRetirement * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'High',
      category: 'Long-term',
      progress_percentage: retirementCorpusMultiplier > 0 ? Math.round((retirementCurrent / retirementCorpusMultiplier) * 100) : 0
    }
  ];
  
  return goals;
}

// Store user financial information (in memory for demo, use database in production)
const userFinancialInfo = new Map();

// Generate default goals endpoint
app.post('/api/generate-default-goals', (req, res) => {
  try {
    const { userId, yearlyIncome, age } = req.body;
    
    if (!userId || !yearlyIncome || !age) {
      return res.status(400).json({ error: 'Missing required fields: userId, yearlyIncome, age' });
    }
    
    if (yearlyIncome <= 0 || age <= 0 || age > 100) {
      return res.status(400).json({ error: 'Invalid financial information provided' });
    }
    
    // Get user's portfolio value
    const user = getAnyUserById(userId);
    const portfolioValue = user?.portfolio?.summary?.total_current_value || 0;
    
    // Generate default goals
    const defaultGoals = generateDefaultGoals(yearlyIncome, age, portfolioValue);
    
    // Store user financial information
    userFinancialInfo.set(userId, {
      yearlyIncome,
      age,
      updatedAt: new Date().toISOString()
    });
    
    // Update user's goals in their context (for AI insights)
    if (user) {
      if (!user.financial_goals) {
        user.financial_goals = {};
      }
      user.financial_goals.goals = defaultGoals;
      
      // Update financial profile with the provided income information
      if (user.financial_profile) {
        user.financial_profile.annual_income_after_tax = yearlyIncome;
        user.financial_profile.monthly_income_after_tax = Math.round(yearlyIncome / 12);
      }
      
      // Update user profile age
      if (user.user_profile) {
        user.user_profile.age = age;
      }
      
      // For Kite users, update the session
      if (userId.startsWith('kite-')) {
        const kiteUserId = userId.replace('kite-', '');
        kiteUserSessions.set(kiteUserId, user);
      }
    }
    
    console.log(`Generated default goals for user ${userId}:`, defaultGoals);
    
    res.json({
      success: true,
      goals: defaultGoals,
      userFinancialInfo: {
        yearlyIncome,
        age,
        portfolioValue
      }
    });
    
  } catch (error) {
    console.error('Error generating default goals:', error);
    res.status(500).json({ error: 'Failed to generate default goals' });
  }
});

// Get user financial information endpoint
app.get('/api/user-financial-info/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const financialInfo = userFinancialInfo.get(userId);
    
    if (!financialInfo) {
      return res.status(404).json({ error: 'Financial information not found for user' });
    }
    
    res.json({
      success: true,
      financialInfo
    });
    
  } catch (error) {
    console.error('Error fetching user financial info:', error);
    res.status(500).json({ error: 'Failed to fetch financial information' });
  }
});

// Update user goals endpoint
app.post('/api/update-user-goals', (req, res) => {
  try {
    const { userId, goals } = req.body;
    
    if (!userId || !goals) {
      return res.status(400).json({ error: 'Missing required fields: userId, goals' });
    }
    
    // Get user and update their goals
    const user = getAnyUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user's goals in their context (for AI insights)
    if (!user.financial_goals) {
      user.financial_goals = {};
    }
    user.financial_goals.goals = goals;
    
    // For Kite users, update the session
    if (userId.startsWith('kite-')) {
      const kiteUserId = userId.replace('kite-', '');
      kiteUserSessions.set(kiteUserId, user);
    }
    
    console.log(`Updated goals for user ${userId}:`, goals.length, 'goals');
    
    res.json({
      success: true,
      message: 'Goals updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user goals:', error);
    res.status(500).json({ error: 'Failed to update goals' });
  }
});

app.get('/api/ai-insights', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Get user-specific personalized insights
      const user = getAnyUserById(userId);
      if (user) {
        // Build complete user context for AI insights generation
        const userContext = {
          user_profile: user.user_profile,
          financial_profile: user.financial_profile,
          investment_profile: user.investment_profile,
          portfolio: user.portfolio,
          financial_goals: {
            goals: getGoalsForUser(userId)
          },
          recent_transactions: getUserTransactions(userId).slice(0, 10)
        };
        
        // Generate completely personalized insights based on user's actual data
        const personalizedInsights = generateCompleteAIInsights(userContext);
        
        res.json(personalizedInsights);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // For demo without userId, use first demo user's data
      const demoUser = users.find(u => u.credentials?.email === 'demo@example.com');
      if (demoUser) {
        const userContext = {
          user_profile: demoUser.user_profile,
          financial_profile: demoUser.financial_profile,
          investment_profile: demoUser.investment_profile,
          portfolio: demoUser.portfolio,
          financial_goals: {
            goals: getGoalsByUserId(demoUser.id)
          },
          recent_transactions: getUserTransactions(demoUser.id).slice(0, 10)
        };
        
        const personalizedInsights = generateCompleteAIInsights(userContext);
        res.json(personalizedInsights);
      } else {
        res.status(404).json({ error: 'Demo user not found' });
      }
    }
  } catch (error) {
    console.error('Failed to get AI insights:', error);
    res.status(500).json({ error: 'Failed to get AI insights' });
  }
});

// Risk analysis endpoint
app.get('/api/risk-analysis', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Get user-specific risk analysis
      const user = getAnyUserById(userId);
      if (user) {
        // Build complete user context for risk analysis
        const userContext = {
          user_profile: user.user_profile,
          financial_profile: user.financial_profile,
          investment_profile: user.investment_profile,
          portfolio: user.portfolio,
          financial_goals: {
            goals: getGoalsForUser(userId)
          }
        };
        
        // Generate personalized risk analysis based on user's actual portfolio
        const riskAnalysis = calculateRiskAnalysis(userContext);
        
        res.json(riskAnalysis);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // For demo without userId, use first demo user's data
      const demoUser = users.find(u => u.credentials?.email === 'demo@example.com');
      if (demoUser) {
        const userContext = {
          user_profile: demoUser.user_profile,
          financial_profile: demoUser.financial_profile,
          investment_profile: demoUser.investment_profile,
          portfolio: demoUser.portfolio,
          financial_goals: {
            goals: getGoalsByUserId(demoUser.id)
          }
        };
        
        const riskAnalysis = calculateRiskAnalysis(userContext);
        res.json(riskAnalysis);
      } else {
        res.status(404).json({ error: 'Demo user not found' });
      }
    }
  } catch (error) {
    console.error('Failed to get risk analysis:', error);
    res.status(500).json({ error: 'Failed to get risk analysis' });
  }
});

// Portfolio recommendations endpoint
app.get('/api/portfolio-recommendations', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Get user-specific portfolio recommendations
      const user = getAnyUserById(userId);
      if (user) {
        // Build complete user context for recommendations
        const userContext = {
          user_profile: user.user_profile,
          financial_profile: user.financial_profile,
          investment_profile: user.investment_profile,
          portfolio: user.portfolio,
          financial_goals: {
            goals: getGoalsForUser(userId)
          }
        };
        
        // Generate personalized recommendations based on user's actual portfolio
        const recommendations = generatePortfolioRecommendations(userContext);
        
        res.json(recommendations);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // For demo without userId, use first demo user's data
      const demoUser = users.find(u => u.credentials?.email === 'demo@example.com');
      if (demoUser) {
        const userContext = {
          user_profile: demoUser.user_profile,
          financial_profile: demoUser.financial_profile,
          investment_profile: demoUser.investment_profile,
          portfolio: demoUser.portfolio,
          financial_goals: {
            goals: getGoalsByUserId(demoUser.id)
          }
        };
        
        const recommendations = generatePortfolioRecommendations(userContext);
        res.json(recommendations);
      } else {
        res.status(404).json({ error: 'Demo user not found' });
      }
    }
  } catch (error) {
    console.error('Failed to get portfolio recommendations:', error);
    res.status(500).json({ error: 'Failed to get portfolio recommendations' });
  }
});

// Market analysis endpoint
app.get('/api/market-analysis', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (userId) {
      // Get user-specific market analysis
      const user = getAnyUserById(userId);
      if (user) {
        // Build complete user context for market analysis
        const userContext = {
          user_profile: user.user_profile,
          financial_profile: user.financial_profile,
          investment_profile: user.investment_profile,
          portfolio: user.portfolio,
          financial_goals: {
            goals: getGoalsForUser(userId)
          }
        };
        
        // Generate personalized market analysis based on user's actual portfolio
        const marketAnalysis = generateMarketAnalysis(userContext);
        
        res.json(marketAnalysis);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      // For demo without userId, use first demo user's data
      const demoUser = users.find(u => u.credentials?.email === 'demo@example.com');
      if (demoUser) {
        const userContext = {
          user_profile: demoUser.user_profile,
          financial_profile: demoUser.financial_profile,
          investment_profile: demoUser.investment_profile,
          portfolio: demoUser.portfolio,
          financial_goals: {
            goals: getGoalsByUserId(demoUser.id)
          }
        };
        
        const marketAnalysis = generateMarketAnalysis(userContext);
        res.json(marketAnalysis);
      } else {
        res.status(404).json({ error: 'Demo user not found' });
      }
    }
  } catch (error) {
    console.error('Failed to get market analysis:', error);
    res.status(500).json({ error: 'Failed to get market analysis' });
  }
});

// Kite Connect Integration
let kiteService;
try {
  kiteService = new KiteService();
} catch (error) {
  console.error('Failed to initialize Kite service:', error);
}

// Store active Kite sessions in memory (in production, use a proper database)
const kiteUserSessions = new Map();

// Kite login endpoint - starts OAuth flow
app.get('/api/kite/login', (req, res) => {
  try {
    if (!kiteService) {
      return res.status(500).json({ error: 'Kite service not available' });
    }
    
    const loginUrl = kiteService.getLoginUrl();
    res.json({ loginUrl });
  } catch (error) {
    console.error('Error generating Kite login URL:', error);
    res.status(500).json({ error: 'Failed to generate login URL' });
  }
});

// Kite callback endpoint - completes OAuth flow
app.post('/api/kite/callback', async (req, res) => {
  try {
    const { request_token } = req.body;
    
    if (!request_token) {
      return res.status(400).json({ error: 'Request token is required' });
    }

    if (!kiteService) {
      return res.status(500).json({ error: 'Kite service not available' });
    }

    console.log('Processing Kite callback with request token:', request_token);

    // Generate session
    const sessionData = await kiteService.generateSession(request_token);
    
    // Set access token for this instance
    kiteService.setAccessToken(sessionData.accessToken);
    
    // Fetch user profile
    const kiteProfile = await kiteService.getUserProfile();
    
    // Fetch portfolio data
    const [holdings, mfHoldings] = await Promise.all([
      kiteService.getPortfolioHoldings(),
      kiteService.getMutualFundHoldings()
    ]);

    // Transform to our portfolio format
    const portfolio = kiteService.transformKiteToPortfolio(holdings, mfHoldings, kiteProfile);
    
    // Create user profile
    const userProfile = kiteService.createUserProfile(kiteProfile, sessionData);
    
    // Create complete user context
    const kiteUser = {
      id: `kite-${sessionData.userId}`,
      ...userProfile,
      portfolio,
      kite_session: {
        access_token: sessionData.accessToken,
        public_token: sessionData.publicToken,
        user_id: sessionData.userId,
        login_time: sessionData.loginTime
      },
      credentials: {
        email: kiteProfile.email || sessionData.email,
        username: sessionData.userShortname,
        provider: 'kite'
      }
    };

    // Store user session
    kiteUserSessions.set(sessionData.userId, kiteUser);
    
    console.log('Kite user authenticated successfully:', sessionData.userId);
    console.log('Portfolio summary:', portfolio.summary);

    res.json({
      success: true,
      user: {
        id: kiteUser.id,
        name: kiteUser.user_profile.name,
        email: kiteUser.user_profile.email,
        kite_user_id: sessionData.userId
      },
      portfolio_summary: portfolio.summary
    });

  } catch (error) {
    console.error('Error in Kite callback:', error);
    res.status(500).json({ 
      error: 'Authentication failed', 
      details: error.message 
    });
  }
});

// Refresh Kite portfolio endpoint
app.post('/api/kite/refresh-portfolio', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId || !userId.startsWith('kite-')) {
      return res.status(400).json({ error: 'Valid Kite user ID is required' });
    }
    
    const kiteUserId = userId.replace('kite-', '');
    const existingUser = kiteUserSessions.get(kiteUserId);
    
    if (!existingUser) {
      return res.status(404).json({ error: 'Kite user session not found. Please login again.' });
    }
    
    if (!kiteService) {
      return res.status(500).json({ error: 'Kite service not available' });
    }
    
    console.log('Refreshing portfolio for Kite user:', kiteUserId);
    
    // Set access token from stored session
    kiteService.setAccessToken(existingUser.kite_session.access_token);
    
    // Fetch fresh portfolio data
    const [holdings, mfHoldings] = await Promise.all([
      kiteService.getPortfolioHoldings(),
      kiteService.getMutualFundHoldings()
    ]);
    
    // Transform to our portfolio format
    const portfolio = kiteService.transformKiteToPortfolio(holdings, mfHoldings, existingUser.user_profile);
    
    // Update user's portfolio in session
    existingUser.portfolio = portfolio;
    existingUser.portfolio.summary.updated_at = new Date().toISOString();
    
    // Update session
    kiteUserSessions.set(kiteUserId, existingUser);
    
    console.log('Portfolio refreshed successfully for user:', kiteUserId);
    
    res.json({
      success: true,
      message: 'Portfolio refreshed successfully',
      portfolio_summary: portfolio.summary,
      updated_at: portfolio.summary.updated_at
    });
    
  } catch (error) {
    console.error('Error refreshing Kite portfolio:', error);
    
    // Handle specific Kite API errors
    if (error.message && error.message.includes('TokenException')) {
      res.status(401).json({ 
        error: 'Session expired', 
        details: 'Please login again to refresh your portfolio.',
        requires_reauth: true
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to refresh portfolio', 
        details: error.message 
      });
    }
  }
});

// Get Kite user data endpoint
app.get('/api/kite/user/:kiteUserId', (req, res) => {
  try {
    const { kiteUserId } = req.params;
    const user = kiteUserSessions.get(kiteUserId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without sensitive session data
    const { kite_session, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching Kite user:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Refresh Kite portfolio endpoint
app.post('/api/kite/refresh-portfolio/:kiteUserId', async (req, res) => {
  try {
    const { kiteUserId } = req.params;
    const user = kiteUserSessions.get(kiteUserId);
    
    if (!user || !user.kite_session) {
      return res.status(404).json({ error: 'User session not found' });
    }

    if (!kiteService) {
      return res.status(500).json({ error: 'Kite service not available' });
    }

    // Set access token for this user
    kiteService.setAccessToken(user.kite_session.access_token);
    
    // Fetch fresh portfolio data
    const [holdings, mfHoldings] = await Promise.all([
      kiteService.getPortfolioHoldings(),
      kiteService.getMutualFundHoldings()
    ]);

    // Transform to our portfolio format
    const portfolio = kiteService.transformKiteToPortfolio(holdings, mfHoldings, user.user_profile);
    
    // Update user's portfolio
    user.portfolio = portfolio;
    user.portfolio.summary.updated_at = new Date().toISOString();
    
    // Update stored session
    kiteUserSessions.set(kiteUserId, user);
    
    console.log('Portfolio refreshed for user:', kiteUserId);
    
    res.json({
      success: true,
      portfolio_summary: portfolio.summary,
      updated_at: portfolio.summary.updated_at
    });

  } catch (error) {
    console.error('Error refreshing Kite portfolio:', error);
    
    // Handle specific Kite API errors
    if (error.message && error.message.includes('TokenException')) {
      res.status(401).json({ 
        error: 'Session expired', 
        details: 'Please login again to refresh your portfolio.',
        requires_reauth: true
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to refresh portfolio', 
        details: error.message 
      });
    }
  }
});

// Get user context endpoint (supports both demo and Kite users)
app.get('/api/user-context', (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = getAnyUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build complete user context with financial goals
    let goals = [];
    
    // Handle goals differently for Kite vs demo users
    if (userId.startsWith('kite-')) {
      // For Kite users, get goals from their session data
      goals = user.financial_goals?.goals || [];
    } else {
      // For demo/uploaded users, use the existing function
      goals = getGoalsForUser(userId);
    }
    
    const userContext = {
      user_profile: user.user_profile,
      financial_profile: user.financial_profile,
      investment_profile: user.investment_profile,
      portfolio: user.portfolio,
      financial_goals: {
        goals: goals
      },
      recent_transactions: getUserTransactions(userId).slice(0, 10)
    };
    
    res.json(userContext);
    
  } catch (error) {
    console.error('Error getting user context:', error);
    res.status(500).json({ error: 'Failed to get user context' });
  }
});

// Get all users (including Kite users) - enhanced endpoint
app.get('/api/users', (req, res) => {
  try {
    const demoUsers = getAllUsers();
    const kiteUsers = Array.from(kiteUserSessions.values()).map(user => ({
      id: user.id,
      name: user.user_profile.name,
      email: user.user_profile.email,
      profession: user.user_profile.profession,
      location: user.user_profile.location,
      age: user.user_profile.age,
      experience_level: user.investment_profile.investment_experience,
      risk_tolerance: user.investment_profile.risk_tolerance,
      provider: 'kite'
    }));
    
    const allUsers = [...demoUsers.map(user => ({
      id: user.id,
      name: user.user_profile.name,
      email: user.user_profile.email,
      profession: user.user_profile.profession,
      location: user.user_profile.location,
      age: user.user_profile.age,
      experience_level: user.investment_profile.investment_experience,
      risk_tolerance: user.investment_profile.risk_tolerance,
      provider: 'demo'
    })), ...kiteUsers];
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Enhanced user context endpoint to support Kite users
app.get('/api/user/:userId/context', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if it's a Kite user
    if (userId.startsWith('kite-')) {
      const kiteUserId = userId.replace('kite-', '');
      const user = kiteUserSessions.get(kiteUserId);
      
      if (user) {
        const { kite_session, ...userContext } = user;
        res.json(userContext);
        return;
      }
    }
    
    // Handle demo users
    const user = getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user context:', error);
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('chat_message', async (data) => {
    try {
      console.log('Received message:', data);
      
      const { message: userMessage, conversationId, conversationHistory, userId } = data;
      let userContext = data.context || null;
      
      // If userId is provided, get specific user context
      if (userId) {
        const user = getAnyUserById(userId);
        if (user) {
          userContext = {
            user_profile: user.user_profile,
            financial_profile: user.financial_profile,
            investment_profile: user.investment_profile,
            portfolio: user.portfolio, // Use user's specific portfolio data
            financial_goals: {
              goals: getGoalsForUser(userId)
            },
            recent_transactions: getUserTransactions(userId).slice(0, 10)
          };
        }
      }
      
      // Add user message to conversation (in-memory)
      conversationManager.addMessage(conversationId, userMessage, false);
      
      // Add user message to persistent history with userId
      await conversationHistoryService.addMessage(conversationId, userMessage, false, userId || 'demo-user');
      
      // Get conversation context for AI
      const conversationContext = conversationManager.buildConversationContext(conversationId);
      
      // Demo responses for testing formatting (will be replaced by actual AI responses)
      let aiResponse;
      
      if (userMessage.toLowerCase().includes('portfolio summary')) {
        // Use user-specific portfolio data from userContext
        const portfolio = userContext?.portfolio || {};
        const userName = userContext?.user_profile?.name || 'User';
        
        const contextualIntro = conversationContext.includes('portfolio') ? 
          "As we discussed earlier, let me provide an updated view of your portfolio:" :
          `Here's a comprehensive overview of your current portfolio, ${userName}:`;
          
        // Generate asset allocation display from user's portfolio
        const assetAllocation = portfolio.summary?.asset_allocation || {};
        const assetAllocationRows = Object.entries(assetAllocation).map(([key, data]) => {
          const assetName = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `| **${assetName}** | ₹${data?.value?.toLocaleString() || 'N/A'} | ${data?.percentage?.toFixed(1) || 'N/A'}% |`;
        }).join('\n');

        // Generate top holdings from user's stocks and mutual funds
        const stocks = portfolio.stocks || [];
        const mutualFunds = portfolio.mutual_funds || [];
        const topHoldings = [...stocks.slice(0, 2), ...mutualFunds.slice(0, 2)];
        
        const holdingsDisplay = topHoldings.map(holding => {
          const name = holding.company_name || holding.scheme_name || 'Unknown';
          const currentValue = holding.current_value || 0;
          const gainLoss = holding.gain_loss || 0;
          const gainLossPercent = holding.gain_loss_percentage || 0;
          return `- **${name}**: ₹${currentValue.toLocaleString()} (${gainLoss >= 0 ? '+' : ''}₹${gainLoss.toLocaleString()}, ${gainLoss >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%)`;
        }).join('\n');
          
        aiResponse = `# 📊 Your Portfolio Summary

${contextualIntro}

**Total Portfolio Value:** ₹${portfolio.summary?.total_current_value?.toLocaleString() || 'N/A'} 

**Performance Overview:**
- **Total Investment:** ₹${portfolio.summary?.total_investment?.toLocaleString() || 'N/A'}
- **Current Value:** ₹${portfolio.summary?.total_current_value?.toLocaleString() || 'N/A'}
- **Total Gains:** ₹${portfolio.summary?.total_gain_loss?.toLocaleString() || 'N/A'} (${portfolio.summary?.gain_loss_percentage?.toFixed(1) || 'N/A'}%)

## Asset Allocation

| Asset Class | Value | Allocation |
|-------------|--------|------------|
${assetAllocationRows}

## Top Holdings
${holdingsDisplay || 'No holdings data available'}

## 💡 Key Insights
- Your portfolio shows **${portfolio.summary?.gain_loss_percentage > 15 ? 'strong' : portfolio.summary?.gain_loss_percentage > 5 ? 'good' : 'steady'}** performance with ${portfolio.summary?.gain_loss_percentage?.toFixed(1)}% overall gains
- **Risk Profile**: ${userContext?.investment_profile?.risk_tolerance || 'Moderate'} investor approach
- **Investment Experience**: ${userContext?.investment_profile?.investment_experience || 'Developing'} in the market
- **Monthly SIP Total**: ₹${mutualFunds.reduce((sum, mf) => sum + (mf.sip_amount || 0), 0).toLocaleString()} across ${mutualFunds.length} funds

*Would you like me to analyze any specific aspect of your portfolio or discuss rebalancing strategies?*`;
      } else if (userMessage.toLowerCase().includes('goals') || userMessage.toLowerCase().includes('goal')) {
        // Use user-specific goals data from userContext
        const userGoals = userContext?.financial_goals?.goals || [];
        const userName = userContext?.user_profile?.name || 'User';
        
        const contextualIntro = conversationContext.includes('goals') ? 
          "Building on our previous discussion about your financial goals:" :
          `Let's review your financial goals progress, ${userName}:`;
          
        // Generate goals table from user's specific goals
        const goalsRows = userGoals.map(goal => {
          const progressIcon = goal.progress_percentage >= 50 ? '✅' : goal.progress_percentage >= 25 ? '⚠️' : '🔴';
          const status = goal.progress_percentage >= 50 ? 'On Track' : goal.progress_percentage >= 25 ? 'Behind' : 'Needs Attention';
          return `| **${goal.name}** | ${goal.progress_percentage}% | ₹${goal.current_amount?.toLocaleString() || 'N/A'} | ₹${goal.target_amount?.toLocaleString() || 'N/A'} | ${progressIcon} ${status} |`;
        }).join('\n');

        // Find next milestone (goal with highest priority and reasonable progress)
        const nextMilestone = userGoals.find(goal => goal.priority === 'High' && goal.progress_percentage < 100) || userGoals[0];
        
        // Generate recommendations based on goals
        const recommendations = userGoals.map(goal => {
          if (goal.progress_percentage >= 75) {
            return `- **${goal.name}**: Excellent progress! You're on track to achieve this goal`;
          } else if (goal.progress_percentage >= 50) {
            return `- **${goal.name}**: Good progress! Consider increasing monthly contributions to accelerate`;
          } else if (goal.progress_percentage >= 25) {
            return `- **${goal.name}**: Behind schedule. Consider increasing SIP by 20-30% to stay on track`;
          } else {
            return `- **${goal.name}**: Needs immediate attention. Consider a dedicated investment plan`;
          }
        }).join('\n');
          
        aiResponse = `# 🎯 Your Financial Goals Progress

${contextualIntro}

You have **${userGoals.length} active financial goals** with varying progress levels.

## Current Status

| Goal | Progress | Current | Target | Status |
|------|----------|---------|--------|--------|
${goalsRows || 'No goals data available'}

${nextMilestone ? `## 🔥 Next Milestone
**${nextMilestone.name}**: ₹${nextMilestone.target_amount?.toLocaleString()} by ${new Date(nextMilestone.target_date).toLocaleDateString()}` : ''}

## 📈 Recommendations
${recommendations || 'Set up specific financial goals to track your progress better'}

*Need help optimizing your goal strategy? I can suggest specific investment adjustments.*`;
      } else if (userMessage.toLowerCase().includes('market') && 
                 (userMessage.toLowerCase().includes('today') || userMessage.toLowerCase().includes('update'))) {
        const marketOverview = marketDataService.getMarketOverview();
        const userContext = getUserContext();
        const portfolioMarketData = marketDataService.getPortfolioMarketData(userContext.portfolio.stocks);
        const relevantNews = marketDataService.getRelevantNews(userContext);
        
        aiResponse = `# 📈 Today's Market Update

## Market Overview
| Index | Current | Change | % Change |
|-------|---------|--------|----------|
| **Nifty 50** | ${marketOverview.indices.nifty50.current.toFixed(0)} | ${marketOverview.indices.nifty50.change >= 0 ? '+' : ''}${marketOverview.indices.nifty50.change.toFixed(2)} | ${marketOverview.indices.nifty50.changePercent >= 0 ? '+' : ''}${marketOverview.indices.nifty50.changePercent.toFixed(2)}% |
| **Sensex** | ${marketOverview.indices.sensex.current.toFixed(0)} | ${marketOverview.indices.sensex.change >= 0 ? '+' : ''}${marketOverview.indices.sensex.change.toFixed(2)} | ${marketOverview.indices.sensex.changePercent >= 0 ? '+' : ''}${marketOverview.indices.sensex.changePercent.toFixed(2)}% |

**Market Sentiment:** ${marketOverview.market_sentiment}

## Your Portfolio Performance Today
| Stock | Current Price | Today's Change | Your Impact |
|-------|---------------|----------------|-------------|
${Object.entries(portfolioMarketData).map(([symbol, data]) => 
  `| **${symbol}** | ₹${data.price.toFixed(2)} | ${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%) | ${data.your_holding} shares |`
).join('\n')}

## 📰 Key Market News
${relevantNews.slice(0, 2).map(news => 
  `### ${news.headline}
${news.summary}

**Impact on your portfolio:** ${news.impact}`
).join('\n\n')}

## 💡 Today's Insight
${marketOverview.market_sentiment === 'Positive' || marketOverview.market_sentiment === 'Bullish' ? 
  'Good day for your equity holdings! Your IT stocks (INFY, TCS) are performing well. Continue your SIP strategy.' :
  'Mixed market conditions today. This is normal volatility - stick to your long-term investment plan.'}

*Would you like me to analyze any specific impact on your portfolio?*`;
      } else {
        // Get AI response using OpenAI with conversation context
        const systemPrompt = buildSystemPrompt(userContext, conversationContext);
        aiResponse = await getWealthAdvisorResponse(userMessage, userContext, systemPrompt);
      }
      
      // Add AI response to conversation (in-memory)
      conversationManager.addMessage(conversationId, aiResponse, true);
      
      // Add AI response to persistent history with userId
      await conversationHistoryService.addMessage(conversationId, aiResponse, true, userId || 'demo-user');
      
      const response = {
        id: Date.now(),
        message: aiResponse,
        timestamp: new Date().toISOString(),
        isBot: true
      };

      socket.emit('chat_response', response);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Provide more detailed error information
      let errorMessage = 'Failed to process message';
      if (error.message) {
        errorMessage = `Processing error: ${error.message}`;
      }
      
      socket.emit('error', { 
        message: errorMessage,
        type: 'chat_processing_error',
        timestamp: new Date().toISOString()
      });
      
      // Send a fallback response to keep the conversation flowing
      const fallbackResponse = {
        id: Date.now(),
        message: "I apologize, but I'm experiencing technical difficulties processing your request. Please try rephrasing your question or try again in a moment.",
        timestamp: new Date().toISOString(),
        isBot: true
      };
      
      socket.emit('chat_response', fallbackResponse);
    }
  });

  socket.on('conversation_cleared', (data) => {
    try {
      const { conversationId } = data;
      conversationManager.clearConversation(conversationId);
      console.log(`Conversation ${conversationId} cleared`);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`OpenAI API Key configured: ${!!process.env.OPENAI_API_KEY}`);
});