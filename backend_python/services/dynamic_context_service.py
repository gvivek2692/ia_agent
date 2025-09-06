"""
Dynamic Context Service - Intelligent context loading based on conversation analysis
Replaces static context loading with smart, need-based context fetching
"""

import logging
import re
from typing import Dict, Any, List, Optional, Set, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from services.demo_data_service import DemoDataService
from services.web_search_service import WebSearchService

logger = logging.getLogger(__name__)


class ContextType(Enum):
    """Types of context that can be loaded"""
    USER_PROFILE = "user_profile"
    FINANCIAL_PROFILE = "financial_profile" 
    INVESTMENT_PROFILE = "investment_profile"
    PORTFOLIO_SUMMARY = "portfolio_summary"
    PORTFOLIO_STOCKS = "portfolio_stocks"
    PORTFOLIO_MUTUAL_FUNDS = "portfolio_mutual_funds"
    FINANCIAL_GOALS = "financial_goals"
    RECENT_TRANSACTIONS = "recent_transactions"
    MARKET_DATA = "market_data"
    NEWS_CONTEXT = "news_context"


@dataclass
class ContextRequest:
    """Request for specific context data"""
    context_type: ContextType
    priority: int  # 1-10, higher = more important
    query_indicators: List[str]  # Keywords that indicate this context is needed
    cache_duration: int  # Cache duration in seconds
    dependencies: List[ContextType] = None  # Other contexts this depends on


class DynamicContextService:
    """Intelligently loads only the context needed for each conversation"""
    
    def __init__(self):
        self.demo_service = DemoDataService()
        self.web_search = WebSearchService()
        self.context_cache: Dict[str, Dict[str, Any]] = {}
        
        # Define context loading patterns
        self.context_patterns = self._initialize_context_patterns()
        
        logger.info("Dynamic Context Service initialized")
    
    def _initialize_context_patterns(self) -> Dict[ContextType, ContextRequest]:
        """Define patterns for when different context types are needed"""
        
        return {
            ContextType.USER_PROFILE: ContextRequest(
                context_type=ContextType.USER_PROFILE,
                priority=8,
                query_indicators=[
                    "my profile", "about me", "personal", "age", "location", "profession",
                    "experience", "background", "details about me", "tell me about myself"
                ],
                cache_duration=3600  # 1 hour
            ),
            
            ContextType.FINANCIAL_PROFILE: ContextRequest(
                context_type=ContextType.FINANCIAL_PROFILE,
                priority=7,
                query_indicators=[
                    "income", "salary", "earnings", "financial situation", "budget",
                    "expenses", "spending", "savings rate", "monthly income"
                ],
                cache_duration=1800  # 30 minutes
            ),
            
            ContextType.INVESTMENT_PROFILE: ContextRequest(
                context_type=ContextType.INVESTMENT_PROFILE,
                priority=6,
                query_indicators=[
                    "risk", "conservative", "aggressive", "investment style", "risk tolerance",
                    "investment experience", "investment horizon", "risk appetite"
                ],
                cache_duration=3600  # 1 hour
            ),
            
            ContextType.PORTFOLIO_SUMMARY: ContextRequest(
                context_type=ContextType.PORTFOLIO_SUMMARY,
                priority=10,
                query_indicators=[
                    "portfolio", "investment", "total value", "gains", "losses", "performance",
                    "returns", "how am i doing", "portfolio value", "overall performance"
                ],
                cache_duration=300  # 5 minutes
            ),
            
            ContextType.PORTFOLIO_STOCKS: ContextRequest(
                context_type=ContextType.PORTFOLIO_STOCKS,
                priority=9,
                query_indicators=[
                    "stocks", "shares", "equity", "companies", "stock market", "holdings",
                    "infy", "tcs", "reliance", "hdfc", "wipro", "stock performance"
                ],
                cache_duration=300,  # 5 minutes
                dependencies=[ContextType.PORTFOLIO_SUMMARY]
            ),
            
            ContextType.PORTFOLIO_MUTUAL_FUNDS: ContextRequest(
                context_type=ContextType.PORTFOLIO_MUTUAL_FUNDS,
                priority=9,
                query_indicators=[
                    "mutual funds", "mf", "sip", "systematic investment", "fund",
                    "scheme", "nav", "fund performance", "mutual fund returns"
                ],
                cache_duration=300,  # 5 minutes
                dependencies=[ContextType.PORTFOLIO_SUMMARY]
            ),
            
            ContextType.FINANCIAL_GOALS: ContextRequest(
                context_type=ContextType.FINANCIAL_GOALS,
                priority=8,
                query_indicators=[
                    "goals", "target", "objective", "planning", "future", "retirement",
                    "house", "emergency fund", "save for", "financial goals", "goal planning"
                ],
                cache_duration=1800  # 30 minutes
            ),
            
            ContextType.RECENT_TRANSACTIONS: ContextRequest(
                context_type=ContextType.RECENT_TRANSACTIONS,
                priority=6,
                query_indicators=[
                    "recent", "transactions", "activity", "bought", "sold", "invested",
                    "recent activity", "latest transactions", "what did i do"
                ],
                cache_duration=600  # 10 minutes
            ),
            
            ContextType.MARKET_DATA: ContextRequest(
                context_type=ContextType.MARKET_DATA,
                priority=7,
                query_indicators=[
                    "market", "nifty", "sensex", "current", "today", "market performance",
                    "market update", "market status", "indices", "market news"
                ],
                cache_duration=180  # 3 minutes
            ),
            
            ContextType.NEWS_CONTEXT: ContextRequest(
                context_type=ContextType.NEWS_CONTEXT,
                priority=5,
                query_indicators=[
                    "news", "latest", "recent", "update", "current events", "what's happening",
                    "market news", "economic news", "financial news"
                ],
                cache_duration=300  # 5 minutes
            )
        }
    
    def analyze_query_context_needs(self, user_message: str, conversation_history: Optional[List[str]] = None) -> List[ContextType]:
        """Analyze user query to determine what context is needed"""
        
        message_lower = user_message.lower()
        needed_contexts = []
        
        # Score each context type based on query indicators
        context_scores = {}
        
        for context_type, pattern in self.context_patterns.items():
            score = 0
            
            # Check direct keyword matches
            for indicator in pattern.query_indicators:
                if indicator in message_lower:
                    score += pattern.priority
                    
            # Boost score for exact matches
            for indicator in pattern.query_indicators:
                if re.search(r'\b' + re.escape(indicator) + r'\b', message_lower):
                    score += pattern.priority * 0.5
            
            if score > 0:
                context_scores[context_type] = score
        
        # Add contextual intelligence based on conversation patterns
        context_scores = self._apply_conversational_context(context_scores, user_message, conversation_history)
        
        # Sort by score and return high-scoring contexts
        sorted_contexts = sorted(context_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Return contexts with score above threshold
        threshold = 3  # Minimum score to load context
        needed_contexts = [ctx for ctx, score in sorted_contexts if score >= threshold]
        
        # Always include portfolio summary for investment-related queries
        if any(keyword in message_lower for keyword in ["invest", "portfolio", "stock", "fund", "money"]):
            if ContextType.PORTFOLIO_SUMMARY not in needed_contexts:
                needed_contexts.insert(0, ContextType.PORTFOLIO_SUMMARY)
        
        logger.info(f"Context analysis for query '{user_message[:50]}...': {[ctx.value for ctx in needed_contexts]}")
        return needed_contexts
    
    def _apply_conversational_context(self, context_scores: Dict[ContextType, float], 
                                    current_message: str, conversation_history: Optional[List[str]]) -> Dict[ContextType, float]:
        """Apply conversational intelligence to boost relevant context scores"""
        
        if not conversation_history:
            return context_scores
        
        recent_messages = conversation_history[-5:]  # Last 5 messages
        recent_text = " ".join(recent_messages).lower()
        
        # If recent conversation mentioned portfolio, boost portfolio contexts
        if any(word in recent_text for word in ["portfolio", "stock", "investment", "fund"]):
            for ctx in [ContextType.PORTFOLIO_SUMMARY, ContextType.PORTFOLIO_STOCKS, ContextType.PORTFOLIO_MUTUAL_FUNDS]:
                if ctx in context_scores:
                    context_scores[ctx] *= 1.3
                else:
                    context_scores[ctx] = 2.0
        
        # If discussing goals, boost goal and financial contexts
        if any(word in recent_text for word in ["goal", "plan", "target", "save", "future"]):
            for ctx in [ContextType.FINANCIAL_GOALS, ContextType.FINANCIAL_PROFILE]:
                if ctx in context_scores:
                    context_scores[ctx] *= 1.2
                else:
                    context_scores[ctx] = 1.5
        
        # If discussing market conditions, boost market contexts
        if any(word in recent_text for word in ["market", "economy", "nifty", "sensex", "economic"]):
            for ctx in [ContextType.MARKET_DATA, ContextType.NEWS_CONTEXT]:
                if ctx in context_scores:
                    context_scores[ctx] *= 1.2
                else:
                    context_scores[ctx] = 1.5
        
        return context_scores
    
    def _get_cache_key(self, user_id: str, context_type: ContextType) -> str:
        """Generate cache key for context data"""
        return f"{user_id}:{context_type.value}"
    
    def _is_cache_valid(self, cache_key: str, cache_duration: int) -> bool:
        """Check if cached context is still valid"""
        if cache_key not in self.context_cache:
            return False
        
        cache_entry = self.context_cache[cache_key]
        cache_time = datetime.fromisoformat(cache_entry["timestamp"])
        return datetime.now() - cache_time < timedelta(seconds=cache_duration)
    
    async def load_dynamic_context(self, user_id: str, needed_contexts: List[ContextType]) -> Dict[str, Any]:
        """Load only the needed context data efficiently"""
        
        context_data = {}
        
        # Process contexts in priority order
        contexts_by_priority = sorted(
            [(ctx, self.context_patterns[ctx].priority) for ctx in needed_contexts],
            key=lambda x: x[1], reverse=True
        )
        
        for context_type, priority in contexts_by_priority:
            cache_key = self._get_cache_key(user_id, context_type)
            pattern = self.context_patterns[context_type]
            
            # Check cache first
            if self._is_cache_valid(cache_key, pattern.cache_duration):
                context_data[context_type.value] = self.context_cache[cache_key]["data"]
                logger.info(f"Using cached context: {context_type.value}")
                continue
            
            # Load fresh context data
            try:
                fresh_data = await self._load_context_data(user_id, context_type)
                if fresh_data:
                    context_data[context_type.value] = fresh_data
                    
                    # Cache the data
                    self.context_cache[cache_key] = {
                        "data": fresh_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                    logger.info(f"Loaded fresh context: {context_type.value}")
                
            except Exception as e:
                logger.error(f"Error loading context {context_type.value}: {str(e)}")
        
        return context_data
    
    async def _load_context_data(self, user_id: str, context_type: ContextType) -> Optional[Dict[str, Any]]:
        """Load specific context data based on type"""
        
        # Get base user context from demo service
        user_context = self.demo_service.get_complete_user_context(user_id)
        
        if context_type == ContextType.USER_PROFILE:
            return user_context.get("user_profile", {})
            
        elif context_type == ContextType.FINANCIAL_PROFILE:
            return user_context.get("financial_profile", {})
            
        elif context_type == ContextType.INVESTMENT_PROFILE:
            return user_context.get("investment_profile", {})
            
        elif context_type == ContextType.PORTFOLIO_SUMMARY:
            portfolio = user_context.get("portfolio", {})
            return portfolio.get("summary", {})
            
        elif context_type == ContextType.PORTFOLIO_STOCKS:
            portfolio = user_context.get("portfolio", {})
            return {"stocks": portfolio.get("stocks", [])}
            
        elif context_type == ContextType.PORTFOLIO_MUTUAL_FUNDS:
            portfolio = user_context.get("portfolio", {})
            return {"mutual_funds": portfolio.get("mutual_funds", [])}
            
        elif context_type == ContextType.FINANCIAL_GOALS:
            return user_context.get("financial_goals", {})
            
        elif context_type == ContextType.RECENT_TRANSACTIONS:
            return {"recent_transactions": user_context.get("recent_transactions", [])}
            
        elif context_type == ContextType.MARKET_DATA:
            # This could integrate with live market data APIs
            return {
                "timestamp": datetime.now().isoformat(),
                "indices": {
                    "nifty50": {"current": 21800.0, "change": 125.50, "changePercent": 0.58},
                    "sensex": {"current": 72000.0, "change": 400.25, "changePercent": 0.56}
                },
                "market_status": "Open" if 9 <= datetime.now().hour < 15 else "Closed"
            }
            
        elif context_type == ContextType.NEWS_CONTEXT:
            # This could integrate with web search for recent news
            return {
                "last_updated": datetime.now().isoformat(),
                "economic_highlights": [
                    "RBI maintains repo rate at 6.5%",
                    "IT sector shows strong Q3 results", 
                    "FPI inflows surge in equity markets"
                ]
            }
        
        return None
    
    def build_minimal_system_prompt(self, context_data: Dict[str, Any]) -> str:
        """Build a lean system prompt with only loaded context"""
        
        current_time = datetime.now()
        
        prompt = f"""You are an expert AI wealth advisor specializing in Indian financial markets.

DYNAMIC FUNCTION CALLING CAPABILITIES:
You have access to powerful function calling capabilities. Use functions to get real-time data, perform analysis, and provide personalized advice.

CURRENT DATE AND TIME:
- Today: {current_time.strftime('%A, %B %d, %Y')}
- Time: {current_time.strftime('%I:%M %p IST')}

AVAILABLE CONTEXT:"""
        
        # Add only the loaded context data
        for context_type, data in context_data.items():
            if context_type == "user_profile" and data:
                prompt += f"""

USER PROFILE:
- Name: {data.get('name', 'User')}
- Age: {data.get('age', 'N/A')}, {data.get('profession', 'Professional')}
- Location: {data.get('location', 'India')}"""
                
            elif context_type == "financial_profile" and data:
                prompt += f"""

FINANCIAL PROFILE:
- Monthly Income: ₹{data.get('take_home', 0):,}
- Savings Rate: {data.get('savings_rate', 0)}%"""
                
            elif context_type == "investment_profile" and data:
                prompt += f"""

INVESTMENT PROFILE:
- Risk Tolerance: {data.get('risk_tolerance', 'Moderate')}
- Experience: {data.get('investment_experience', 'Intermediate')}"""
                
            elif context_type == "portfolio_summary" and data:
                prompt += f"""

PORTFOLIO SUMMARY:
- Total Value: ₹{data.get('total_current_value', 0):,}
- Total Investment: ₹{data.get('total_investment', 0):,}
- Overall Gains: ₹{data.get('total_gain_loss', 0):,} ({data.get('gain_loss_percentage', 0):.1f}%)"""
                
            elif context_type == "financial_goals" and data:
                goals = data.get('goals', [])
                if goals:
                    prompt += "\n\nFINANCIAL GOALS:"
                    for goal in goals[:3]:
                        name = goal.get('name', '')
                        current = goal.get('current_amount', 0)
                        target = goal.get('target_amount', 0)
                        progress = goal.get('progress_percentage', 0)
                        prompt += f"\n- {name}: ₹{current:,}/₹{target:,} ({progress:.1f}%)"
        
        prompt += """

RESPONSE GUIDELINES:
- Use function calling when you need specific, current data
- Provide personalized advice based on available context
- Reference specific data points from the loaded context
- Use clear, actionable recommendations
- Include risk warnings when appropriate
- When referencing current market data, prices, or news, state facts clearly and directly
- Use specific figures, percentages, and concrete information when available
- Structure responses so factual claims are in clear, citation-friendly sentences"""
        
        return prompt
    
    def get_context_summary(self, context_data: Dict[str, Any]) -> str:
        """Get a summary of what context was loaded"""
        loaded_types = list(context_data.keys())
        return f"Loaded context: {', '.join(loaded_types)}"
    
    def clear_user_cache(self, user_id: str, context_types: Optional[List[ContextType]] = None):
        """Clear cached context for a user"""
        if context_types:
            for ctx_type in context_types:
                cache_key = self._get_cache_key(user_id, ctx_type)
                self.context_cache.pop(cache_key, None)
        else:
            # Clear all user cache
            keys_to_remove = [key for key in self.context_cache.keys() if key.startswith(f"{user_id}:")]
            for key in keys_to_remove:
                self.context_cache.pop(key, None)
        
        logger.info(f"Cleared cache for user {user_id}")