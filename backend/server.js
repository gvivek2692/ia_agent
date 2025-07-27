const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const { getUserContext, getPortfolioSummary, getGoalsOverview, getRecentActivity } = require('./data');
const conversationManager = require('./services/conversationManager');
const marketDataService = require('./services/marketDataService');

dotenv.config();

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

// OpenAI client initialization
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Wealth advisor response function as specified in CLAUDE.md
const getWealthAdvisorResponse = async (userMessage, userContext = null, customSystemPrompt = null) => {
  try {
    const systemPrompt = customSystemPrompt || buildSystemPrompt(userContext);
    
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      tools: [{"type": "web_search_preview"}],
      input: `${systemPrompt}

User Question: ${userMessage}`
    });

    return response.output_text;
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to regular chat completion if responses API is not available
    try {
      const systemPrompt = customSystemPrompt || buildSystemPrompt(userContext);
      const fallbackResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });
      return fallbackResponse.choices[0].message.content;
    } catch (fallbackError) {
      console.error('Fallback API error:', fallbackError);
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
- Portfolio analysis and optimization
- Investment recommendations for Indian markets (stocks, mutual funds, bonds)
- Financial goal planning and SIP calculations
- Risk assessment and asset allocation
- Tax planning and optimization
- Market analysis and economic insights
- Expense analysis and budgeting advice

COMMUNICATION STYLE:
- Professional yet conversational
- Clear, actionable advice
- Always include risk warnings where appropriate
- Use current market data when relevant (search the web for latest information)
- Explain financial concepts in simple terms
- Focus on long-term wealth building
- Address the user as "Priya" when appropriate

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
- Stocks: ₹${fullUserContext.portfolio.summary.asset_allocation.stocks.value.toLocaleString()} (${fullUserContext.portfolio.summary.asset_allocation.stocks.percentage}%)
- Mutual Funds: ₹${fullUserContext.portfolio.summary.asset_allocation.mutual_funds.value.toLocaleString()} (${fullUserContext.portfolio.summary.asset_allocation.mutual_funds.percentage}%)
- PPF: ₹${fullUserContext.portfolio.summary.asset_allocation.ppf.value.toLocaleString()} (${fullUserContext.portfolio.summary.asset_allocation.ppf.percentage}%)

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

// Demo data endpoints
app.get('/api/user/context', (req, res) => {
  res.json(getUserContext());
});

app.get('/api/portfolio/summary', (req, res) => {
  res.json(getPortfolioSummary());
});

app.get('/api/goals/overview', (req, res) => {
  res.json(getGoalsOverview());
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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('chat_message', async (data) => {
    try {
      console.log('Received message:', data);
      
      const { message: userMessage, conversationId, conversationHistory } = data;
      const userContext = data.context || null;
      
      // Add user message to conversation
      conversationManager.addMessage(conversationId, userMessage, false);
      
      // Get conversation context for AI
      const conversationContext = conversationManager.buildConversationContext(conversationId);
      
      // Demo responses for testing formatting (will be replaced by actual AI responses)
      let aiResponse;
      
      if (userMessage.toLowerCase().includes('portfolio summary')) {
        const portfolioData = getPortfolioSummary();
        const contextualIntro = conversationContext.includes('portfolio') ? 
          "As we discussed earlier, let me provide an updated view of your portfolio:" :
          "Here's a comprehensive overview of your current portfolio:";
          
        aiResponse = `# 📊 Your Portfolio Summary

${contextualIntro}

**Total Portfolio Value:** ₹${portfolioData.total_value.toLocaleString()} 

**Performance Overview:**
- **Total Investment:** ₹${portfolioData.total_investment.toLocaleString()}
- **Current Value:** ₹${portfolioData.total_value.toLocaleString()}
- **Total Gains:** ₹${portfolioData.total_gains.toLocaleString()} (${portfolioData.gain_percentage}%)

## Asset Allocation

| Asset Class | Value | Allocation |
|-------------|--------|------------|
| **Stocks** | ₹${portfolioData.top_holdings.filter(h => h.symbol).reduce((sum, h) => sum + h.current_value, 0).toLocaleString()} | 17.3% |
| **Mutual Funds** | ₹${portfolioData.top_holdings.filter(h => h.scheme_name).reduce((sum, h) => sum + h.current_value, 0).toLocaleString()} | 24.8% |
| **PPF** | ₹1,85,000 | 32.8% |
| **EPF** | ₹1,25,000 | 22.2% |

## Top Holdings
${portfolioData.top_holdings.slice(0, 3).map(holding => 
  `- **${holding.company_name || holding.scheme_name}**: ₹${holding.current_value.toLocaleString()} (${holding.gain_loss >= 0 ? '+' : ''}₹${holding.gain_loss.toLocaleString()})`
).join('\n')}

## 💡 Key Insights
- Your portfolio is **well-diversified** across equity and debt
- **Strong tax-saving component** with PPF and EPF (55% of portfolio)
- **Consistent SIP discipline** is building wealth systematically
- Consider increasing equity allocation for higher growth potential

*Would you like me to analyze any specific aspect of your portfolio?*`;
      } else if (userMessage.toLowerCase().includes('goals') || userMessage.toLowerCase().includes('goal')) {
        const goalsData = getGoalsOverview();
        const contextualIntro = conversationContext.includes('goals') ? 
          "Building on our previous discussion about your financial goals:" :
          "Let's review your financial goals progress:";
          
        aiResponse = `# 🎯 Your Financial Goals Progress

${contextualIntro}

You have **${goalsData.total_goals} active financial goals** with good progress across priorities.

## Current Status

| Goal | Progress | Current | Target | Status |
|------|----------|---------|--------|--------|
| **Emergency Fund** | 58.3% | ₹3,50,000 | ₹6,00,000 | ✅ On Track |
| **House Down Payment** | 28.3% | ₹4,25,000 | ₹15,00,000 | ⚠️ Behind |
| **Retirement Corpus** | 1.6% | ₹7,85,000 | ₹5,00,00,000 | ✅ Early Stage |
| **Europe Vacation** | 31.3% | ₹1,25,000 | ₹4,00,000 | ✅ On Track |

## 🔥 Next Milestone
**${goalsData.next_milestone.goal_name}**: ₹${goalsData.next_milestone.amount.toLocaleString()} by ${new Date(goalsData.next_milestone.target_date).toLocaleDateString()}

## 📈 Recommendations
- **Emergency Fund**: Great progress! You'll reach your target by Dec 2024
- **House Down Payment**: Consider increasing monthly SIP by ₹10,000 to stay on track
- **Retirement**: Perfect start! Power of compounding will accelerate growth
- **Vacation Fund**: You're ahead of schedule - well done!

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
      
      // Add AI response to conversation
      conversationManager.addMessage(conversationId, aiResponse, true);
      
      const response = {
        id: Date.now(),
        message: aiResponse,
        timestamp: new Date().toISOString(),
        isBot: true
      };

      socket.emit('chat_response', response);
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process message' });
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