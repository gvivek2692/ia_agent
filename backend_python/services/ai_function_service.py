"""
AI Function Service - Dynamic function calling system for intelligent AI responses
Provides the AI with callable functions to fetch user data, analyze portfolios, and search intelligently
"""

import logging
import json
import asyncio
from typing import Dict, Any, List, Optional, Callable, Union
from datetime import datetime, timedelta
from dataclasses import dataclass

from services.demo_data_service import DemoDataService
from services.web_search_service import WebSearchService
from services.holdings_news_correlator import HoldingsNewsCorrelator
from services.personalized_recommendation_engine import PersonalizedRecommendationEngine

logger = logging.getLogger(__name__)


@dataclass
class AIFunction:
    """Definition of a function the AI can call"""
    name: str
    description: str
    parameters: Dict[str, Any]
    function: Callable
    category: str
    cache_duration: Optional[int] = None  # Cache duration in seconds


class AIFunctionRegistry:
    """Registry for AI-callable functions with intelligent caching"""
    
    def __init__(self):
        self.functions: Dict[str, AIFunction] = {}
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.demo_service = DemoDataService()
        self.web_search = WebSearchService()
        self.news_correlator = HoldingsNewsCorrelator()
        self.recommendation_engine = PersonalizedRecommendationEngine()
        
        # Initialize all available functions
        self._register_user_data_functions()
        self._register_portfolio_functions()
        self._register_search_functions()
        self._register_analysis_functions()
        self._register_recommendation_functions()
        
        logger.info(f"AI Function Registry initialized with {len(self.functions)} functions")
    
    def _register_user_data_functions(self):
        """Register functions for fetching user profile and financial data"""
        
        # Get fresh user context
        self.register_function(
            AIFunction(
                name="get_user_context",
                description="Get complete user profile including financial data, investment profile, and current portfolio. Use when user asks about their personal information, profile, or when you need their complete financial picture.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID to get context for"},
                        "include_portfolio": {"type": "boolean", "description": "Whether to include detailed portfolio data", "default": True},
                        "include_transactions": {"type": "boolean", "description": "Whether to include recent transactions", "default": False}
                    },
                    "required": ["user_id"]
                },
                function=self._get_user_context,
                category="user_data",
                cache_duration=300  # Cache for 5 minutes
            )
        )
        
        # Get financial goals with progress
        self.register_function(
            AIFunction(
                name="get_financial_goals",
                description="Get user's financial goals with current progress and timeline analysis. Use when user asks about their goals, progress towards goals, or planning discussions.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID to get goals for"}
                    },
                    "required": ["user_id"]
                },
                function=self._get_financial_goals,
                category="user_data",
                cache_duration=600  # Cache for 10 minutes
            )
        )
    
    def _register_portfolio_functions(self):
        """Register functions for portfolio analysis and performance"""
        
        # Analyze specific holding performance
        self.register_function(
            AIFunction(
                name="analyze_holding_performance",
                description="Deep analysis of a specific stock or mutual fund in user's portfolio. Use when user asks about performance of specific holdings or wants detailed analysis of their investments.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "symbol": {"type": "string", "description": "Stock symbol or mutual fund scheme code"},
                        "include_news": {"type": "boolean", "description": "Whether to fetch recent news about this holding", "default": True}
                    },
                    "required": ["user_id", "symbol"]
                },
                function=self._analyze_holding_performance,
                category="portfolio",
                cache_duration=180  # Cache for 3 minutes (market data changes frequently)
            )
        )
        
        # Portfolio market impact analysis
        self.register_function(
            AIFunction(
                name="analyze_portfolio_market_impact",
                description="Analyze how current market conditions affect user's portfolio. Use when user asks about market impact on their investments or overall portfolio performance.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "time_period": {"type": "string", "description": "Time period for analysis", "enum": ["today", "week", "month", "quarter"], "default": "today"}
                    },
                    "required": ["user_id"]
                },
                function=self._analyze_portfolio_market_impact,
                category="portfolio",
                cache_duration=300  # Cache for 5 minutes
            )
        )
        
        # Get portfolio allocation analysis
        self.register_function(
            AIFunction(
                name="get_portfolio_allocation",
                description="Get detailed portfolio allocation analysis including sector-wise, asset-wise breakdowns and diversification metrics. Use when user asks about portfolio allocation or diversification.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "include_recommendations": {"type": "boolean", "description": "Whether to include rebalancing recommendations", "default": True}
                    },
                    "required": ["user_id"]
                },
                function=self._get_portfolio_allocation,
                category="portfolio",
                cache_duration=600  # Cache for 10 minutes
            )
        )
        
        # Correlate holdings with market news
        self.register_function(
            AIFunction(
                name="analyze_holdings_news_correlation",
                description="Analyze correlation between user's portfolio holdings and relevant market news, providing personalized news insights",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "search_scope": {"type": "string", "enum": ["focused", "comprehensive"], "description": "Scope of news search", "default": "focused"}
                    },
                    "required": ["user_id"]
                },
                function=self._analyze_holdings_news_correlation,
                category="portfolio",
                cache_duration=300  # 5 minutes cache due to news volatility
            )
        )
    
    def _register_search_functions(self):
        """Register functions for intelligent web search"""
        
        # Context-aware market search
        self.register_function(
            AIFunction(
                name="search_market_news",
                description="Search for current market news and data relevant to user's portfolio and interests. Use for current market conditions, news affecting user's holdings, or general market updates.",
                parameters={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"},
                        "user_context": {"type": "object", "description": "User context to personalize search"},
                        "focus": {"type": "string", "description": "Focus area for search", "enum": ["general", "user_holdings", "sectors", "economic"], "default": "general"}
                    },
                    "required": ["query"]
                },
                function=self._search_market_news,
                category="search",
                cache_duration=600  # Cache for 10 minutes
            )
        )
        
        # Specific stock/fund research
        self.register_function(
            AIFunction(
                name="research_investment",
                description="Research a specific investment (stock, mutual fund, etc.) with comprehensive analysis including news, performance, and recommendations.",
                parameters={
                    "type": "object",
                    "properties": {
                        "investment": {"type": "string", "description": "Investment name or symbol to research"},
                        "analysis_type": {"type": "string", "description": "Type of analysis needed", "enum": ["performance", "news", "comprehensive"], "default": "comprehensive"}
                    },
                    "required": ["investment"]
                },
                function=self._research_investment,
                category="search",
                cache_duration=900  # Cache for 15 minutes
            )
        )
    
    def _register_analysis_functions(self):
        """Register functions for financial analysis and planning"""
        
        # SIP calculation and optimization
        self.register_function(
            AIFunction(
                name="calculate_sip_optimization",
                description="Calculate optimal SIP amounts for user's goals and provide investment recommendations. Use when user asks about SIP planning or investment optimization.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "goal_id": {"type": "string", "description": "Specific goal ID if optimizing for a particular goal", "default": None},
                        "available_amount": {"type": "number", "description": "Additional amount available for investment", "default": None}
                    },
                    "required": ["user_id"]
                },
                function=self._calculate_sip_optimization,
                category="analysis",
                cache_duration=1800  # Cache for 30 minutes
            )
        )
        
        # Risk analysis
        self.register_function(
            AIFunction(
                name="analyze_portfolio_risk",
                description="Comprehensive risk analysis of user's portfolio including concentration risk, market risk, and recommendations. Use when user asks about portfolio risk or safety.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "include_recommendations": {"type": "boolean", "description": "Whether to include risk reduction recommendations", "default": True}
                    },
                    "required": ["user_id"]
                },
                function=self._analyze_portfolio_risk,
                category="analysis",
                cache_duration=3600  # Cache for 1 hour
            )
        )
    
    def _register_recommendation_functions(self):
        """Register functions for personalized recommendations"""
        
        # Generate personalized recommendations
        self.register_function(
            AIFunction(
                name="get_personalized_recommendations",
                description="Generate personalized investment recommendations based on user's portfolio, goals, and market conditions. Use when user asks for investment advice, portfolio suggestions, or what they should do with their investments.",
                parameters={
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "User ID"},
                        "max_recommendations": {"type": "integer", "description": "Maximum number of recommendations to generate", "default": 5},
                        "focus_area": {"type": "string", "description": "Focus area for recommendations", "enum": ["general", "rebalancing", "new_investments", "goal_planning", "risk_management"], "default": "general"}
                    },
                    "required": ["user_id"]
                },
                function=self._get_personalized_recommendations,
                category="recommendations",
                cache_duration=1800  # Cache for 30 minutes
            )
        )
    
    def register_function(self, ai_function: AIFunction):
        """Register a new AI function"""
        self.functions[ai_function.name] = ai_function
        logger.info(f"Registered AI function: {ai_function.name} ({ai_function.category})")
    
    def get_function_definitions(self) -> List[Dict[str, Any]]:
        """Get OpenAI function definitions for all registered functions"""
        definitions = []
        for func in self.functions.values():
            definitions.append({
                "name": func.name,
                "description": func.description,
                "parameters": func.parameters
            })
        return definitions
    
    def _get_cache_key(self, function_name: str, **kwargs) -> str:
        """Generate cache key for function call"""
        # Sort kwargs for consistent cache keys
        sorted_kwargs = sorted(kwargs.items())
        return f"{function_name}:{json.dumps(sorted_kwargs, sort_keys=True)}"
    
    def _is_cache_valid(self, cache_key: str, cache_duration: int) -> bool:
        """Check if cached result is still valid"""
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key].get("timestamp")
        if not cached_time:
            return False
        
        expiry_time = datetime.fromisoformat(cached_time) + timedelta(seconds=cache_duration)
        return datetime.now() < expiry_time
    
    async def call_function(self, function_name: str, **kwargs) -> Dict[str, Any]:
        """Call an AI function with intelligent caching"""
        if function_name not in self.functions:
            logger.error(f"Unknown function: {function_name}")
            return {"error": f"Function {function_name} not found"}
        
        func_def = self.functions[function_name]
        
        # Check cache if function supports caching
        if func_def.cache_duration:
            cache_key = self._get_cache_key(function_name, **kwargs)
            if self._is_cache_valid(cache_key, func_def.cache_duration):
                logger.info(f"Returning cached result for {function_name}")
                return self.cache[cache_key]["result"]
        
        try:
            # Call the function
            logger.info(f"Calling AI function: {function_name} with args: {kwargs}")
            result = await func_def.function(**kwargs)
            
            # Cache the result if caching is enabled
            if func_def.cache_duration:
                self.cache[cache_key] = {
                    "result": result,
                    "timestamp": datetime.now().isoformat()
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error calling function {function_name}: {str(e)}")
            return {"error": f"Function execution failed: {str(e)}"}
    
    # Implementation of AI functions
    
    async def _get_user_context(self, user_id: str, include_portfolio: bool = True, include_transactions: bool = False) -> Dict[str, Any]:
        """Get fresh user context"""
        context = self.demo_service.get_complete_user_context(user_id)
        
        if not include_portfolio and "portfolio" in context:
            del context["portfolio"]
        
        if not include_transactions and "recent_transactions" in context:
            del context["recent_transactions"]
        
        return {
            "function": "get_user_context",
            "success": True,
            "data": context,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _get_financial_goals(self, user_id: str) -> Dict[str, Any]:
        """Get financial goals with progress analysis"""
        goals_data = self.demo_service.get_goal_progress_summary(user_id)
        
        return {
            "function": "get_financial_goals", 
            "success": True,
            "data": goals_data,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _analyze_holding_performance(self, user_id: str, symbol: str, include_news: bool = True) -> Dict[str, Any]:
        """Analyze performance of a specific holding"""
        # Get user's portfolio
        user_context = self.demo_service.get_complete_user_context(user_id)
        portfolio = user_context.get("portfolio", {})
        
        # Find the holding
        holding = None
        holding_type = None
        
        # Check stocks
        for stock in portfolio.get("stocks", []):
            if stock.get("symbol", "").lower() == symbol.lower():
                holding = stock
                holding_type = "stock"
                break
        
        # Check mutual funds if not found in stocks
        if not holding:
            for mf in portfolio.get("mutual_funds", []):
                if symbol.lower() in mf.get("scheme_name", "").lower() or mf.get("scheme_code", "").lower() == symbol.lower():
                    holding = mf
                    holding_type = "mutual_fund"
                    break
        
        if not holding:
            return {
                "function": "analyze_holding_performance",
                "success": False,
                "error": f"Holding {symbol} not found in user's portfolio"
            }
        
        analysis = {
            "holding": holding,
            "holding_type": holding_type,
            "performance_analysis": {
                "current_value": holding.get("current_value", 0),
                "investment_amount": holding.get("investment_amount", holding.get("invested_amount", 0)),
                "gain_loss": holding.get("gain_loss", 0),
                "gain_loss_percentage": holding.get("gain_loss_percentage", 0)
            }
        }
        
        # Fetch news if requested
        if include_news:
            if holding_type == "stock":
                search_query = f"{holding.get('company_name', symbol)} stock price news India"
            else:
                search_query = f"{holding.get('scheme_name', symbol)} mutual fund performance India"
            
            news_results = await self.web_search.search(search_query, {"location": "India", "num": 3})
            analysis["recent_news"] = news_results
        
        return {
            "function": "analyze_holding_performance",
            "success": True,
            "data": analysis,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _analyze_portfolio_market_impact(self, user_id: str, time_period: str = "today") -> Dict[str, Any]:
        """Analyze how current market affects user's portfolio"""
        # Get user's portfolio
        user_context = self.demo_service.get_complete_user_context(user_id)
        portfolio = user_context.get("portfolio", {})
        
        # Get market data
        market_query = f"Nifty Sensex {time_period} performance India stock market"
        market_data = await self.web_search.search(market_query, {"location": "India", "num": 5})
        
        # Analyze sector exposure
        sector_analysis = self.demo_service.get_sector_wise_allocation(user_id)
        
        return {
            "function": "analyze_portfolio_market_impact",
            "success": True,
            "data": {
                "portfolio_summary": portfolio.get("summary", {}),
                "market_data": market_data,
                "sector_analysis": sector_analysis,
                "time_period": time_period,
                "impact_analysis": {
                    "description": f"Portfolio impact analysis for {time_period} period",
                    "total_value": portfolio.get("summary", {}).get("total_current_value", 0),
                    "overall_performance": portfolio.get("summary", {}).get("gain_loss_percentage", 0)
                }
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _get_portfolio_allocation(self, user_id: str, include_recommendations: bool = True) -> Dict[str, Any]:
        """Get portfolio allocation analysis"""
        allocation_data = self.demo_service.get_sector_wise_allocation(user_id)
        user_context = self.demo_service.get_complete_user_context(user_id)
        
        return {
            "function": "get_portfolio_allocation",
            "success": True,
            "data": {
                "sector_allocation": allocation_data,
                "asset_allocation": user_context.get("portfolio", {}).get("summary", {}).get("asset_allocation", {}),
                "diversification_score": allocation_data.get("diversification_score", 0),
                "recommendations_included": include_recommendations
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _search_market_news(self, query: str, user_context: Optional[Dict] = None, focus: str = "general", user_id: Optional[str] = None) -> Dict[str, Any]:
        """Search for market news with user context"""
        
        # Enhance query based on focus and user context
        enhanced_query = query
        
        if focus == "user_holdings" and user_context:
            # Add user's top holdings to search
            portfolio = user_context.get("portfolio", {})
            stocks = portfolio.get("stocks", [])[:3]  # Top 3 holdings
            if stocks:
                symbols = [stock.get("symbol", "") for stock in stocks]
                enhanced_query += f" {' '.join(symbols)}"
        
        enhanced_query += " India market news"
        
        search_results = await self.web_search.search(enhanced_query, {"location": "India", "num": 8})
        
        return {
            "function": "search_market_news",
            "success": True,
            "data": {
                "original_query": query,
                "enhanced_query": enhanced_query,
                "search_results": search_results,
                "focus": focus
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _research_investment(self, investment: str, analysis_type: str = "comprehensive", user_id: Optional[str] = None) -> Dict[str, Any]:
        """Research a specific investment"""
        
        # Generate appropriate search queries based on analysis type
        queries = []
        
        if analysis_type in ["performance", "comprehensive"]:
            queries.append(f"{investment} performance analysis India stock market")
        
        if analysis_type in ["news", "comprehensive"]:
            queries.append(f"{investment} news latest India market")
        
        if analysis_type == "comprehensive":
            queries.append(f"{investment} financial analysis recommendation India")
        
        # Perform searches
        search_results = {}
        for i, query in enumerate(queries):
            results = await self.web_search.search(query, {"location": "India", "num": 5})
            search_results[f"query_{i+1}"] = {
                "query": query,
                "results": results
            }
        
        return {
            "function": "research_investment",
            "success": True,
            "data": {
                "investment": investment,
                "analysis_type": analysis_type,
                "research_results": search_results
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _calculate_sip_optimization(self, user_id: str, goal_id: Optional[str] = None, available_amount: Optional[float] = None) -> Dict[str, Any]:
        """Calculate SIP optimization recommendations"""
        
        user_context = self.demo_service.get_complete_user_context(user_id)
        goals = self.demo_service.get_goal_progress_summary(user_id)
        sip_summary = self.demo_service.get_sip_summary(user_id)
        
        # Calculate recommendations
        financial_profile = user_context.get("financial_profile", {})
        monthly_savings = financial_profile.get("take_home", 0) - financial_profile.get("monthly_expenses", 0)
        
        recommendations = {
            "current_sip_amount": sip_summary.get("total_monthly_sip", 0),
            "available_for_sip": available_amount or max(0, monthly_savings * 0.3),  # 30% of surplus
            "optimization_suggestions": []
        }
        
        return {
            "function": "calculate_sip_optimization",
            "success": True,
            "data": {
                "current_sips": sip_summary,
                "goals_status": goals,
                "recommendations": recommendations,
                "monthly_capacity": monthly_savings
            },
            "timestamp": datetime.now().isoformat()
        }
    
    async def _analyze_portfolio_risk(self, user_id: str, include_recommendations: bool = True) -> Dict[str, Any]:
        """Analyze portfolio risk"""
        
        user_context = self.demo_service.get_complete_user_context(user_id)
        portfolio = user_context.get("portfolio", {})
        sector_allocation = self.demo_service.get_sector_wise_allocation(user_id)
        
        # Calculate basic risk metrics
        risk_analysis = {
            "concentration_risk": {
                "description": "Analysis of portfolio concentration",
                "diversification_score": sector_allocation.get("diversification_score", 0),
                "sector_allocation": sector_allocation.get("sector_allocation", {})
            },
            "market_risk": {
                "equity_percentage": 0,  # Calculate from portfolio
                "debt_percentage": 0
            },
            "overall_risk_score": user_context.get("investment_profile", {}).get("risk_tolerance", "moderate")
        }
        
        return {
            "function": "analyze_portfolio_risk",
            "success": True,
            "data": {
                "portfolio_summary": portfolio.get("summary", {}),
                "risk_analysis": risk_analysis,
                "recommendations_included": include_recommendations
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def get_function_categories(self) -> Dict[str, List[str]]:
        """Get functions grouped by category"""
        categories = {}
        for func_name, func_def in self.functions.items():
            if func_def.category not in categories:
                categories[func_def.category] = []
            categories[func_def.category].append(func_name)
        return categories
    
    async def _analyze_holdings_news_correlation(self, user_id: str, search_scope: str = "focused") -> Dict[str, Any]:
        """Analyze correlation between user's holdings and market news"""
        
        # Get user's portfolio
        user_context = self.demo_service.get_complete_user_context(user_id)
        portfolio = user_context.get("portfolio", {})
        
        # Extract holdings for correlation
        stocks = portfolio.get("stocks", [])
        mutual_funds = portfolio.get("mutual_funds", [])
        
        if not stocks and not mutual_funds:
            return {
                "function": "analyze_holdings_news_correlation",
                "success": False,
                "error": "No holdings found in user's portfolio"
            }
        
        try:
            # Use the holdings news correlator
            correlation_results = await self.news_correlator.correlate_holdings_with_news(
                stocks=stocks,
                mutual_funds=mutual_funds,
                search_scope=search_scope
            )
            
            return {
                "function": "analyze_holdings_news_correlation",
                "success": True,
                "data": {
                    "correlation_results": correlation_results,
                    "portfolio_summary": {
                        "total_stocks": len(stocks),
                        "total_mutual_funds": len(mutual_funds),
                        "total_value": portfolio.get("summary", {}).get("total_current_value", 0)
                    },
                    "search_scope": search_scope,
                    "analysis_timestamp": datetime.now().isoformat()
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in holdings-news correlation: {str(e)}")
            return {
                "function": "analyze_holdings_news_correlation",
                "success": False,
                "error": f"Correlation analysis failed: {str(e)}"
            }
    
    async def _get_personalized_recommendations(self, user_id: str, max_recommendations: int = 5, focus_area: str = "general") -> Dict[str, Any]:
        """Generate personalized investment recommendations"""
        
        try:
            # Generate recommendations using the recommendation engine
            recommendations = await self.recommendation_engine.generate_personalized_recommendations(
                user_id=user_id, 
                max_recommendations=max_recommendations
            )
            
            # Format recommendations for AI consumption
            formatted_recommendations = []
            for rec in recommendations:
                formatted_rec = {
                    "id": rec.id,
                    "type": rec.type.value,
                    "title": rec.title,
                    "description": rec.description,
                    "reasoning": rec.reasoning,
                    "priority": rec.priority,
                    "risk_level": rec.risk_level.value,
                    "time_horizon": rec.time_horizon,
                    "investment_amount": rec.investment_amount,
                    "potential_return": rec.potential_return,
                    "action_steps": rec.action_steps or [],
                    "confidence_score": rec.confidence_score,
                    "personalization_factors": rec.personalization_factors or [],
                    "formatted_text": self.recommendation_engine.format_recommendation_for_ai(rec)
                }
                formatted_recommendations.append(formatted_rec)
            
            # Get summary
            summary = self.recommendation_engine.get_recommendation_summary(recommendations)
            
            return {
                "function": "get_personalized_recommendations",
                "success": True,
                "data": {
                    "recommendations": formatted_recommendations,
                    "summary": summary,
                    "focus_area": focus_area,
                    "total_generated": len(recommendations)
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {str(e)}")
            return {
                "function": "get_personalized_recommendations",
                "success": False,
                "error": f"Failed to generate recommendations: {str(e)}"
            }
    
    def clear_cache(self, pattern: Optional[str] = None):
        """Clear function cache, optionally by pattern"""
        if pattern:
            keys_to_remove = [k for k in self.cache.keys() if pattern in k]
            for key in keys_to_remove:
                del self.cache[key]
            logger.info(f"Cleared {len(keys_to_remove)} cached results matching '{pattern}'")
        else:
            self.cache.clear()
            logger.info("Cleared all cached function results")