# Claude Code Instructions: AI Wealth Advisor Demo

## Project Overview
Create a comprehensive demo of an AI wealth advisor that uses realistic simulated financial data to showcase intelligent, multi-turn conversations with web search capabilities, market analysis, and personalized financial planning for Indian investors.

## Technology Stack
- **Backend**: Node.js with Express.js, Socket.io for real-time chat
- **Frontend**: React with TypeScript, Tailwind CSS, Recharts for visualizations
- **AI**: OpenAI GPT-4.1 Mini with web search preview tool
- **Data**: In-memory simulated financial data (no database required)

## GPT-4.1 Mini with Web Search Integration

The core AI implementation should use this exact pattern:

```javascript
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const getWealthAdvisorResponse = async (userMessage, userContext) => {
    const response = await client.responses.create({
        model: "gpt-4.1-mini",
        tools: [{"type": "web_search_preview"}],
        input: `[Build comprehensive prompt with user context here]

User Question: ${userMessage}`
    });

    return response.output_text;
};
```

---

## Phase 1: Project Foundation & Setup

### 1.1 Project Structure Creation
Create the basic project structure with separate backend and frontend folders. Set up package.json files for both with appropriate dependencies for Node.js/Express backend and React/TypeScript frontend.

### 1.2 Environment Configuration
Configure environment variables for OpenAI API key in a .env file. The backend should load this using dotenv package. Set up CORS and basic Express server configuration. Ensure proper error handling and logging setup.

Create .env file in backend folder with:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 1.3 Socket.io Integration
Implement real-time WebSocket connection between frontend and backend. Set up basic message passing infrastructure for chat functionality.

### 1.4 Basic Chat Interface
Create a clean, professional chat interface using React components. Include message bubbles, input field, send button, and basic styling with Tailwind CSS.

**Deliverables Phase 1:**
- Working chat interface with real-time messaging
- Basic project structure and environment setup
- OpenAI API connection established
- Socket.io communication working

---

## Phase 2: Demo Data Generation & Financial Context

### 2.1 User Profile Generation
Create a realistic demo user profile representing a typical young Indian professional. Include demographics (name, age, location, profession), income details, risk tolerance, and investment experience level.

### 2.2 Portfolio Holdings Simulation
Generate realistic portfolio data including:
- Stock holdings with major Indian companies (INFY, HDFCBANK, RELIANCE, TCS, etc.)
- Mutual fund investments across different categories (large cap, mid cap, debt funds)
- Quantities, purchase prices, current values for each holding
- Sector diversification and market cap distribution

### 2.3 Transaction History Creation
Build 12 months of transaction history including:
- Monthly SIP investments in mutual funds
- Occasional stock purchases and sales
- Salary credits and bonus payments
- Monthly expense categories (rent, food, transport, etc.)
- Credit card transactions and bill payments

### 2.4 Financial Goals Setup
Define 3-4 realistic financial goals for the demo user:
- Emergency fund target with current progress
- House purchase down payment goal
- Retirement planning with long-term timeline
- Any additional goals like vacation or car purchase

**Deliverables Phase 2:**
- Complete demo user financial profile
- Realistic portfolio holdings across stocks and mutual funds
- 12 months of detailed transaction history
- Well-defined financial goals with progress tracking

---

## Phase 3: AI Wealth Advisor Implementation

### 3.1 System Prompt Engineering
Design comprehensive system prompts that establish the AI an expert wealth advisor specializing in Indian markets. Include user context injection, portfolio overview, goals summary, and recent transaction activity in every prompt.

### 3.2 GPT-4.1 Mini Integration
Implement the core AI function using GPT-4.1 Mini with web search preview tool. Ensure the AI automatically searches for current market data, economic news, and investment opportunities when relevant to user queries.

### 3.3 Context-Aware Response Generation
Build the system to include user's complete financial picture in every AI interaction. This includes current portfolio value, asset allocation, goal progress, recent activity, and risk profile.

### 3.4 Conversation Memory Implementation
Set up conversation history tracking so the AI can reference previous discussions, maintain context across multiple exchanges, and provide continuity in advice and recommendations.

**Deliverables Phase 3:**
- Functional AI wealth advisor with GPT-4.1 Mini
- Web search integration for real-time market data
- Context-aware responses based on user's financial situation
- Multi-turn conversation capabilities with memory

---

## Phase 4: Financial Analysis & Calculations

### 4.1 Portfolio Analysis Engine
Create functions to analyze the demo portfolio including:
- Total portfolio value calculation
- Asset allocation breakdown (equity vs debt vs others)
- Sector-wise distribution analysis
- Performance calculation vs benchmarks
- Risk assessment based on holdings

### 4.2 Goal Planning Calculations
Implement financial planning calculations:
- SIP amount calculations for each goal
- Timeline feasibility analysis
- Monthly savings requirements
- Goal prioritization recommendations
- Progress tracking against targets

### 4.3 Market Context Integration
Ensure the AI can discuss:
- Current Nifty 50 and Sensex levels (via web search)
- Sector performance relative to user's holdings
- Economic indicators impact on investments
- Recent market news affecting portfolio
- Interest rate changes and their implications

### 4.4 Expense Analysis Capabilities
Build analysis for user's spending patterns:
- Monthly expense breakdown by category
- Savings rate calculation
- Budget optimization suggestions
- Emergency fund adequacy assessment
- Cash flow analysis

**Deliverables Phase 4:**
- Complete portfolio analysis functionality
- Goal-based financial planning calculations
- Real-time market data integration via web search
- Comprehensive expense and savings analysis

---

## Phase 5: Advanced Conversation Scenarios

### 5.1 Portfolio Review Conversations
Implement scenarios where users can ask:
- "How is my portfolio performing?"
- "Should I rebalance my investments?"
- "What's my asset allocation?"
- "How are my mutual funds doing?"

### 5.2 Goal Planning Discussions
Enable conversations about:
- "Am I on track for my house purchase goal?"
- "Should I increase my SIP amount?"
- "How much should I invest for retirement?"
- "Can I achieve my goals faster?"

### 5.3 Market-Driven Conversations
Support discussions about:
- "Should I invest more during this market dip?"
- "How is the recent budget affecting my investments?"
- "What's happening with IT sector stocks?"
- "Should I worry about market volatility?"

### 5.4 Educational Interactions
Provide explanations for:
- Financial terms and concepts
- Investment strategy rationale
- Risk management principles
- Tax implications of investments

**Deliverables Phase 5:**
- Natural conversation flows for all major financial topics
- Educational explanations integrated into advice
- Market-aware recommendations with current context
- Personalized suggestions based on user's specific situation

---

## Phase 6: UI/UX Enhancement & Visualizations

### 6.1 Professional Chat Interface Design
Create a polished chat interface that looks like a professional financial application. Include proper typography, spacing, color scheme suitable for financial discussions, and mobile responsiveness.

### 6.2 Portfolio Visualization Integration
Add charts and graphs within the chat interface:
- Portfolio allocation pie charts
- Goal progress bars
- Performance line charts
- Asset allocation breakdowns
- Historical investment tracking

### 6.3 Interactive Elements
Implement interactive features:
- Quick reply buttons for common questions
- Portfolio refresh functionality
- Goal adjustment capabilities
- Source citation display for web search results
- Export conversation functionality

### 6.4 Real-time Updates
Ensure the interface shows:
- Typing indicators during AI processing
- Real-time portfolio value updates
- Live market data integration
- Smooth message animations
- Loading states for calculations

**Deliverables Phase 6:**
- Professional-grade chat interface
- Integrated financial visualizations
- Interactive elements for better engagement
- Real-time updates and smooth user experience

---

## Phase 7: Testing & Demo Scenarios

### 7.1 End-to-End Testing
Test complete conversation flows from initial greeting through complex financial planning discussions. Verify that web search integration works properly and provides relevant market context.

### 7.2 Demo Scenario Creation
Prepare specific demo scenarios that showcase:
- New user onboarding conversation
- Portfolio health check discussion
- Goal planning session
- Market volatility response
- Investment recommendation flow

### 7.3 AI Response Quality Assurance
Ensure AI responses are:
- Contextually relevant to user's financial situation
- Include current market data when appropriate
- Provide specific, actionable recommendations
- Maintain professional yet conversational tone
- Include proper risk warnings and disclaimers

### 7.4 Performance Optimization
Optimize for:
- Fast response times (under 3 seconds)
- Smooth real-time chat experience
- Efficient data loading and calculations
- Proper error handling and fallbacks
- Mobile device compatibility

**Deliverables Phase 7:**
- Fully tested demo application
- Prepared demo scenarios for presentations
- Quality-assured AI responses
- Optimized performance across devices

---

## Success Metrics for Demo

### Technical Performance
- AI response time under 3 seconds
- Successful web search integration in 90%+ of relevant queries
- Zero critical errors during demo sessions
- Smooth real-time chat functionality

### Conversation Quality
- Contextually relevant responses based on user's portfolio
- Appropriate use of current market data
- Natural conversation flow with memory retention
- Professional financial advice tone

### Demo Effectiveness
- Clear demonstration of AI-powered financial insights
- Obvious value proposition for users
- Professional presentation suitable for investors/partners
- Showcase of competitive advantages over existing solutions

### User Experience
- Intuitive chat interface
- Fast, responsive interactions
- Clear visualization of financial data
- Professional appearance suitable for financial services

This phased approach ensures systematic development of a comprehensive AI wealth advisor demo that effectively showcases the potential of GPT-4.1 Mini with web search capabilities for personalized financial planning and investment advice.