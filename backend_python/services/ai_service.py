"""
AI service for OpenAI integration and conversation handling with dynamic function calling
"""

import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
import openai
from openai import AsyncOpenAI

from config.settings import get_settings
from models.chat import ChatRequest, ChatResponse
from services.web_search_service import WebSearchService
from services.conversation_service import ConversationService
from services.demo_data_service import DemoDataService
from services.ai_function_service import AIFunctionRegistry
from services.dynamic_context_service import DynamicContextService
from services.smart_search_engine import SmartSearchEngine
from services.inline_citation_service import InlineCitationService, CitationStyle

logger = logging.getLogger(__name__)
settings = get_settings()


class AIService:
    def __init__(self):
        self.web_search_service = WebSearchService()
        self.conversation_service = ConversationService()
        self.demo_data_service = DemoDataService()
        self.ai_function_registry = AIFunctionRegistry()
        self.dynamic_context_service = DynamicContextService()
        self.smart_search_engine = SmartSearchEngine()
        self.citation_service = InlineCitationService(CitationStyle.NUMBERED)
        
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
    
    def _get_available_functions(self) -> List[Dict[str, Any]]:
        """Get available functions for OpenAI function calling"""
        return self.ai_function_registry.get_function_definitions()
    
    async def _execute_function_call(self, function_name: str, arguments: Dict[str, Any], 
                                   user_id: Optional[str] = None) -> Dict[str, Any]:
        """Execute a function call and return results"""
        try:
            # Add user_id to arguments if provided
            call_args = arguments.copy() if arguments else {}
            if user_id:
                call_args['user_id'] = user_id
                
            result = await self.ai_function_registry.call_function(function_name, **call_args)
            return {
                "success": True,
                "result": result,
                "function": function_name
            }
        except Exception as e:
            logger.error(f"Error executing function {function_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "function": function_name
            }
    
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

DYNAMIC FUNCTION CALLING CAPABILITIES:
You have access to powerful function calling capabilities that allow you to:
- Get real-time user portfolio data and holdings information
- Analyze specific stock and mutual fund performance  
- Perform contextual web searches for market news and data
- Access detailed user profile and investment preferences
- Calculate optimal SIP amounts and financial projections
- Get live market data for stocks in user's portfolio
- Perform comparative analysis of investment options

AVAILABLE FUNCTIONS:
You can call functions dynamically when needed. The system will automatically provide relevant functions based on the conversation context. Use these functions to:
- Access current portfolio data when discussing holdings or performance
- Search for specific market news when analyzing stocks or market conditions
- Get user profile details when providing personalized advice
- Calculate financial projections when planning investments

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
        """Process chat message and return AI response with dynamic context loading"""
        
        try:
            # Get conversation history for context analysis
            conversation_history = []
            if conversation_id:
                conv_data = await self.conversation_service.load_conversation(conversation_id)
                if conv_data and 'messages' in conv_data:
                    conversation_history = [msg.get('content', '') for msg in conv_data['messages'][-10:]]
            
            # Analyze what context is needed for this query
            needed_contexts = self.dynamic_context_service.analyze_query_context_needs(
                message, conversation_history
            )
            
            # Load only the needed context dynamically
            effective_user_id = user_id or 'demo-user'
            dynamic_context = await self.dynamic_context_service.load_dynamic_context(
                effective_user_id, needed_contexts
            )
            
            logger.info(f"Dynamic context loaded: {self.dynamic_context_service.get_context_summary(dynamic_context)}")
            
            # Use intelligent search decision engine
            web_search_results = None
            search_sources = []
            citations = []  # Initialize citations list
            
            # Create comprehensive context for search decision
            search_context = {
                'user_profile': dynamic_context.get('user_profile', {}),
                'portfolio': dynamic_context.get('portfolio_summary', {})
            }
            
            # Make intelligent search decision
            search_decision = self.smart_search_engine.analyze_search_need(
                message, search_context, conversation_history
            )
            
            if search_decision.should_search:
                logger.info(f'Smart search triggered: {search_decision.search_intent.value if search_decision.search_intent else "general"} '
                           f'(priority: {search_decision.priority}, relevance: {search_decision.estimated_relevance:.2f})')
                
                # Use the optimized search query from smart engine
                search_query = search_decision.search_query
                logger.info(f'Optimized search query: {search_query}')
                
                # Perform web search with enhanced parameters
                user_location = dynamic_context.get('user_profile', {}).get('location', 'India')
                search_params = {
                    "location": user_location,
                    "num": min(8, 5 + search_decision.priority // 3)  # More results for high-priority searches
                }
                
                search_results = await self.web_search_service.search(search_query, search_params)
                
                if "error" not in search_results:
                    # Process citations for inline integration
                    citations = self.citation_service.process_search_sources(search_results)
                    
                    # Still create web search summary for AI context
                    web_search_results = self.web_search_service.summarize_search_results(search_results)
                    
                    # Extract traditional sources as backup
                    search_sources = self.web_search_service.extract_sources(search_results)
                    
                    logger.info(f'Smart search completed. Found {len(search_sources)} sources and {len(citations)} citations '
                               f'for {search_decision.search_intent.value if search_decision.search_intent else "general"} search')
                else:
                    logger.info(f'Web search error: {search_results.get("error")}')
            else:
                logger.info(f'Smart search engine decided not to search (relevance: {search_decision.estimated_relevance:.2f})')
            
            # Build dynamic system prompt with only loaded context
            system_prompt = self.dynamic_context_service.build_minimal_system_prompt(dynamic_context)
            
            # Enhance system prompt with search results
            if web_search_results:
                system_prompt += f"\n\n{web_search_results}"
            
            # Add conversation context if available
            if conversation_history:
                recent_context = "\n\nRECENT CONVERSATION CONTEXT:\n"
                for i, msg in enumerate(conversation_history[-3:], 1):
                    recent_context += f"{i}. {msg[:100]}...\n"
                system_prompt += recent_context
            
            # Get AI response with function calling support
            ai_response = await self._get_ai_response(message, system_prompt, web_search_results is not None, effective_user_id)
            
            # Apply inline citations if we have processed citations
            if citations:
                ai_response = self.citation_service.add_inline_citations(ai_response, citations)
                
                # Log citation usage
                citation_summary = self.citation_service.get_citation_summary()
                logger.info(f"Citation usage: {citation_summary['used_citations']}/{citation_summary['total_citations']} "
                           f"({citation_summary['usage_rate']:.1%})")
                
                # Clear citations after use to prevent memory buildup
                self.citation_service.clear_citations()
            
            # Fallback to traditional source list if no inline citations were used
            elif search_sources:
                ai_response += "\n\n---\n**Sources:**\n"
                for i, source in enumerate(search_sources, 1):
                    source_text = f"{i}. [{source.get('title', 'Source')}]({source.get('link', '#')})"
                    if source.get('date'):
                        source_text += f" - {source['date']}"
                    ai_response += source_text + '\n'
            
            # Save messages to conversation
            if conversation_id:
                await self.conversation_service.add_message(conversation_id, message, False, effective_user_id)
                await self.conversation_service.add_message(conversation_id, ai_response, True, effective_user_id)
            
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
    
    async def _get_ai_response(self, user_message: str, system_prompt: str, has_search_results: bool = False, 
                             user_id: Optional[str] = None) -> str:
        """Get AI response from OpenAI with function calling support"""
        
        if not self.client:
            logger.warning('OpenAI API key not configured, using demo response')
            demo_response = "I'm currently in demo mode. In production, I would provide AI-powered financial advice using the latest market data and your personal financial context."
            return demo_response
        
        try:
            # Get available functions for this conversation
            available_functions = self._get_available_functions()
            
            # Initialize conversation messages
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
            
            # Execute iterative function calling
            max_iterations = 5  # Prevent infinite loops
            iteration = 0
            
            while iteration < max_iterations:
                iteration += 1
                
                # Make API call with function calling support
                response = await self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    functions=available_functions if available_functions else None,
                    function_call="auto" if available_functions else None,
                    max_tokens=2500 if has_search_results else 1500,
                    temperature=0.7
                )
                
                assistant_message = response.choices[0].message
                
                # Check if the AI wants to call a function
                if assistant_message.function_call:
                    function_name = assistant_message.function_call.name
                    function_arguments = json.loads(assistant_message.function_call.arguments)
                    
                    logger.info(f"AI requesting function call: {function_name} with args: {function_arguments}")
                    
                    # Add the AI's function call message to conversation
                    messages.append({
                        "role": "assistant",
                        "content": None,
                        "function_call": {
                            "name": function_name,
                            "arguments": assistant_message.function_call.arguments
                        }
                    })
                    
                    # Execute the function
                    function_result = await self._execute_function_call(function_name, function_arguments, user_id)
                    
                    # Add function result to conversation
                    messages.append({
                        "role": "function",
                        "name": function_name,
                        "content": json.dumps(function_result)
                    })
                    
                    # Continue the loop to get final response
                    continue
                
                # No function call - we have the final response
                return assistant_message.content or "I apologize, but I couldn't generate a response."
            
            # If we've reached max iterations, return what we have
            logger.warning(f"Reached max iterations ({max_iterations}) in function calling loop")
            return messages[-1].get("content", "I apologize, but I encountered an issue processing your request.")
            
        except Exception as e:
            logger.error(f'OpenAI API error: {str(e)}')
            
            # Provide more specific error messages based on error type
            if "invalid_api_key" in str(e):
                return "I'm experiencing authentication issues with the AI service. Please try again later."
            elif "rate_limit_exceeded" in str(e):
                return "I'm currently handling many requests. Please try again in a moment."
            elif "model_not_found" in str(e):
                return "I'm experiencing technical difficulties with the AI model. Please try again later."
            elif "functions" in str(e).lower():
                logger.warning("Function calling not supported, falling back to regular chat")
                # Fallback to regular chat without functions
                response = await self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message}
                    ],
                    max_tokens=2500 if has_search_results else 1500,
                    temperature=0.7
                )
                return response.choices[0].message.content
            else:
                return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."