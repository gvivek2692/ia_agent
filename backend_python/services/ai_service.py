"""
AI service for OpenAI integration and conversation handling
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import openai
from openai import AsyncOpenAI

from config.settings import get_settings
from models.chat import ChatRequest, ChatResponse
from services.web_search_service import WebSearchService
from services.conversation_service import ConversationService
from services.demo_data_service import DemoDataService

logger = logging.getLogger(__name__)
settings = get_settings()


class AIService:
    def __init__(self):
        self.web_search_service = WebSearchService()
        self.conversation_service = ConversationService()
        self.demo_data_service = DemoDataService()
        
        # Initialize OpenAI client
        if settings.openai_api_key:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
            logger.info("OpenAI client initialized")
        else:
            self.client = None
            logger.warning("OpenAI API key not configured")
    
    def _load_users_data(self) -> List[Dict[str, Any]]:
        """Load users data from JSON file"""
        import json
        import os
        
        users_file = "data/users.json"
        if not os.path.exists(users_file):
            return []
        
        try:
            with open(users_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID from users data or Kite session"""
        # For demo/uploaded users
        users = self._load_users_data()
        for user in users:
            if user.get('id') == user_id:
                return user
        
        # For Kite users (would be stored in session cache in production)
        # This is a placeholder - in production you'd have a session manager
        return None
    
    def _build_user_context(self, user_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """Build user context for AI prompt"""
        if not user_id:
            return None
        
        user = self._get_user_by_id(user_id)
        if not user:
            return None
        
        # Build comprehensive user context
        user_context = {
            "user_profile": user.get("user_profile", {}),
            "financial_profile": user.get("financial_profile", {}),
            "investment_profile": user.get("investment_profile", {}),
            "portfolio": user.get("portfolio", {}),
            "financial_goals": user.get("financial_goals", {"goals": []}),
            "recent_transactions": user.get("recent_transactions", [])
        }
        
        return user_context
    
    def _build_system_prompt(self, user_context: Optional[Dict[str, Any]] = None, conversation_context: str = "") -> str:
        """Build comprehensive system prompt for wealth advisory"""
        
        if not user_context:
            # Use comprehensive demo data if no specific user context
            user_context = self.demo_data_service.get_complete_user_context()
        
        current_time = datetime.now()
        current_hour = current_time.hour
        day_of_week = current_time.weekday()  # 0=Monday, 6=Sunday
        is_weekend = day_of_week >= 5  # Saturday=5, Sunday=6
        is_market_hours = current_hour >= 9 and current_hour < 15  # 9 AM to 3 PM
        
        if is_weekend:
            market_status = 'Markets are closed (Weekend)'
        elif is_market_hours:
            market_status = 'Markets are OPEN (9:15 AM - 3:30 PM IST)'
        elif current_hour < 9:
            market_status = 'Markets will open at 9:15 AM IST'
        else:
            market_status = 'Markets are closed (After hours)'
        
        prompt = f"""You are an expert AI wealth advisor specializing in Indian financial markets and investment planning. 
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

CURRENT DATE AND TIME:
- Today's Date: {current_time.strftime('%A, %B %d, %Y')}
- Current Time: {current_time.strftime('%I:%M %p IST')}
- Market Status: {market_status}

INDIAN MARKET FOCUS:
- NSE and BSE listed stocks
- Indian mutual funds (equity, debt, hybrid)
- Indian fixed deposits, bonds, and debt instruments
- Tax implications under Indian tax laws
- Investment limits and regulations (80C, ELSS, etc.)
- Currency considerations (INR-based planning)

CURRENT USER PROFILE:
- Name: {user_context.get('user_profile', {}).get('name', 'User')}
- Age: {user_context.get('user_profile', {}).get('age', 35)}, {user_context.get('user_profile', {}).get('profession', 'Professional')}
- Location: {user_context.get('user_profile', {}).get('location', 'India')}
- Monthly Income: ₹{user_context.get('financial_profile', {}).get('take_home', 80000):,}
- Risk Profile: {user_context.get('investment_profile', {}).get('risk_tolerance', 'Moderate')}

CURRENT PORTFOLIO OVERVIEW:
- Total Portfolio Value: ₹{user_context.get('portfolio', {}).get('summary', {}).get('total_current_value', 0):,}
- Total Investment: ₹{user_context.get('portfolio', {}).get('summary', {}).get('total_investment', 0):,}
- Overall Gains: ₹{user_context.get('portfolio', {}).get('summary', {}).get('total_gain_loss', 0):,} ({user_context.get('portfolio', {}).get('summary', {}).get('gain_loss_percentage', 0):.1f}%)

ASSET ALLOCATION:"""

        # Add asset allocation details
        asset_allocation = user_context.get('portfolio', {}).get('summary', {}).get('asset_allocation', {})
        if isinstance(asset_allocation, dict):
            for asset_type, allocation in asset_allocation.items():
                if isinstance(allocation, dict):
                    value = allocation.get('value', 0)
                    percentage = allocation.get('percentage', 0)
                    asset_name = asset_type.replace('_', ' ').title()
                    prompt += f"\n- {asset_name}: ₹{value:,} ({percentage:.1f}%)"

        # Add detailed holdings
        prompt += "\n\nDETAILED STOCK HOLDINGS:"
        stocks = user_context.get('portfolio', {}).get('stocks', [])
        if stocks and isinstance(stocks, list):
            for stock in stocks[:5]:  # Limit to top 5
                if isinstance(stock, dict):
                    company_name = stock.get('company_name', stock.get('symbol', ''))
                    symbol = stock.get('symbol', '')
                    quantity = stock.get('quantity', 0)
                    current_price = stock.get('current_price', 0)
                    current_value = stock.get('current_value', 0)
                    gain_loss_percentage = stock.get('gain_loss_percentage', 0)
                    prompt += f"\n- {company_name} ({symbol}): {quantity} shares @ ₹{current_price} = ₹{current_value:,} ({gain_loss_percentage:+.2f}%)"
        else:
            prompt += "\nNo stock holdings"

        prompt += "\n\nDETAILED MUTUAL FUND HOLDINGS:"
        mutual_funds = user_context.get('portfolio', {}).get('mutual_funds', [])
        if mutual_funds and isinstance(mutual_funds, list):
            for mf in mutual_funds[:5]:  # Limit to top 5
                if isinstance(mf, dict):
                    scheme_name = mf.get('scheme_name', '')
                    units = mf.get('units', 0)
                    nav = mf.get('nav', 0)
                    current_value = mf.get('current_value', 0)
                    gain_loss_percentage = mf.get('gain_loss_percentage', 0)
                    sip_amount = mf.get('sip_amount', 0)
                    prompt += f"\n- {scheme_name}: {units:.2f} units @ ₹{nav} NAV = ₹{current_value:,} ({gain_loss_percentage:+.2f}%) | SIP: ₹{sip_amount}/month"
        else:
            prompt += "\nNo mutual fund holdings"

        # Add financial goals
        prompt += "\n\nFINANCIAL GOALS STATUS:"
        goals = user_context.get('financial_goals', {}).get('goals', [])
        if goals and isinstance(goals, list):
            for goal in goals[:3]:  # Limit to top 3
                if isinstance(goal, dict):
                    name = goal.get('name', '')
                    current_amount = goal.get('current_amount', 0)
                    target_amount = goal.get('target_amount', 0)
                    progress_percentage = goal.get('progress_percentage', 0)
                    prompt += f"\n- {name}: ₹{current_amount:,}/₹{target_amount:,} ({progress_percentage:.1f}% complete)"
        else:
            prompt += "\nNo financial goals set"

        # Add recent transactions
        prompt += "\n\nRECENT ACTIVITY:"
        transactions = user_context.get('recent_transactions', [])
        if transactions:
            for txn in transactions[:5]:  # Limit to 5 recent transactions
                date = txn.get('date', '')
                description = txn.get('description', '')
                amount = txn.get('amount', 0)
                prompt += f"\n- {date}: {description} - ₹{abs(amount):,}"
        else:
            prompt += "\nNo recent transactions"

        prompt += f"""

IMPORTANT: Always provide specific, personalized advice based on the user's actual financial situation shown above. Reference specific holdings, goals, and transactions when relevant.

CRITICAL DATA USAGE INSTRUCTION:
- ALWAYS use the EXACT VALUES from the portfolio data provided above
- NEVER use placeholder values like "XXX,XXX" or generic amounts
- When showing mutual fund values, use the specific current_value, investment_amount, and gain_loss from the detailed holdings
- When showing stock values, use the specific current_value, quantity, and current_price from the detailed holdings
- All monetary amounts should be the ACTUAL numbers from the user's portfolio data
- When asked about "today", "current date", or time-related queries, ALWAYS refer to the CURRENT DATE AND TIME provided above
- Use the exact date format provided above when mentioning today's date in responses

RESPONSE FORMATTING:
- Use markdown formatting for better readability
- Use tables for financial data comparison
- Use bullet points for recommendations
- Include specific numbers with ₹ symbol
- Bold important financial terms and amounts
- Use headings to organize complex responses
- When showing portfolio data, format as tables with current values and percentages

{conversation_context}

CONVERSATION GUIDELINES:
- Reference previous discussion points when relevant
- Build upon earlier recommendations
- Acknowledge user's stated preferences
- Provide continuity in advice across messages
- If this is a follow-up question, connect it to previous context"""

        return prompt
    
    async def process_chat_message(self, message: str, user_id: Optional[str] = None, 
                                 conversation_id: Optional[str] = None, 
                                 context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Process chat message and return AI response"""
        
        try:
            # Build user context - fallback to demo data if no user context found
            user_context = None
            if user_id:
                user_context = self._build_user_context(user_id)
            elif context:
                user_context = context
            
            # Fallback to demo data if no user context available
            if not user_context:
                user_context = self.demo_data_service.get_complete_user_context()
            
            # Build conversation context
            conversation_context = ""
            if conversation_id:
                conversation_context = self.conversation_service.build_conversation_context(conversation_id)
            
            # Check if web search is needed
            web_search_results = None
            search_sources = []
            
            if self.web_search_service.should_perform_web_search(message, user_context):
                logger.info(f'Performing web search for query: {message}')
                
                # Generate optimized search query
                search_query = self.web_search_service.generate_search_query(message, user_context)
                logger.info(f'Search query: {search_query}')
                
                # Perform web search
                search_results = await self.web_search_service.search(search_query, {
                    "location": user_context.get('user_profile', {}).get('location', 'India') if user_context else 'India',
                    "num": 5
                })
                
                if "error" not in search_results:
                    web_search_results = self.web_search_service.summarize_search_results(search_results)
                    search_sources = self.web_search_service.extract_sources(search_results)
                    logger.info(f'Web search completed. Found {len(search_sources)} sources')
                else:
                    logger.info(f'Web search error: {search_results.get("error")}')
            
            # Build system prompt
            system_prompt = self._build_system_prompt(user_context, conversation_context)
            
            # Enhance system prompt with search results
            if web_search_results:
                system_prompt += f"\n\n{web_search_results}"
            
            # Get AI response
            ai_response = await self._get_ai_response(message, system_prompt, web_search_results is not None)
            
            # Add source citations if we performed web search
            if search_sources:
                ai_response += "\n\n---\n**Sources:**\n"
                for i, source in enumerate(search_sources, 1):
                    source_text = f"{i}. [{source.get('title', 'Source')}]({source.get('link', '#')})"
                    if source.get('date'):
                        source_text += f" - {source['date']}"
                    ai_response += source_text + '\n'
            
            # Save messages to conversation
            if conversation_id:
                await self.conversation_service.add_message(conversation_id, message, False, user_id or 'demo-user')
                await self.conversation_service.add_message(conversation_id, ai_response, True, user_id or 'demo-user')
            
            return {
                "id": str(datetime.now().timestamp()),
                "message": ai_response,
                "timestamp": datetime.now().isoformat(),
                "is_bot": True,
                "sources": search_sources if search_sources else None
            }
            
        except Exception as e:
            logger.error(f"Error processing chat message: {str(e)}")
            
            # Return error response
            return {
                "id": str(datetime.now().timestamp()),
                "message": "I apologize, but I'm experiencing technical difficulties processing your request. Please try rephrasing your question or try again in a moment.",
                "timestamp": datetime.now().isoformat(),
                "is_bot": True,
                "error": str(e)
            }
    
    async def _get_ai_response(self, user_message: str, system_prompt: str, has_search_results: bool = False) -> str:
        """Get AI response from OpenAI"""
        
        if not self.client:
            logger.warning('OpenAI API key not configured, using demo response')
            demo_response = "I'm currently in demo mode. In production, I would provide AI-powered financial advice using the latest market data and your personal financial context."
            return demo_response
        
        try:
            # Use the chat completions API
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using a valid model name
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=2500 if has_search_results else 1500,  # More tokens if we have search results
                temperature=0.7
            )

            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f'OpenAI API error: {str(e)}')
            
            # Provide more specific error messages based on error type
            if "invalid_api_key" in str(e):
                return "I'm experiencing authentication issues with the AI service. Please try again later."
            elif "rate_limit_exceeded" in str(e):
                return "I'm currently handling many requests. Please try again in a moment."
            elif "model_not_found" in str(e):
                return "I'm experiencing technical difficulties with the AI model. Please try again later."
            else:
                return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."