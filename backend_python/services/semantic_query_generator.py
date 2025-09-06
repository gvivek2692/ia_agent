"""
Semantic Query Generator - LLM-powered dynamic search query generation
Replaces hardcoded templates with intelligent, context-aware query generation
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

from openai import AsyncOpenAI
from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class QueryGenerationRequest:
    """Request for generating search queries"""
    user_query: str
    intent: str
    user_context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[str]] = None
    search_scope: str = "general"
    max_queries: int = 3


@dataclass
class GeneratedQuery:
    """A generated search query with metadata"""
    query: str
    confidence: float  # 0.0-1.0
    reasoning: str
    search_angle: str  # e.g., "current_market", "historical_data", "expert_analysis"
    expected_sources: List[str]  # Expected types of sources


class SemanticQueryGenerator:
    """Generates intelligent search queries using LLM"""
    
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
            logger.info("Semantic Query Generator initialized with OpenAI")
        else:
            logger.warning("OpenAI API key not configured - falling back to rule-based generation")
            
        # Financial domain knowledge for query enhancement
        self.financial_contexts = {
            "market_data": ["stock prices", "market indices", "trading volume", "market cap"],
            "company_analysis": ["financial reports", "earnings", "revenue", "profit margins"],
            "economic_indicators": ["GDP", "inflation", "interest rates", "employment"],
            "regulatory": ["RBI policies", "SEBI regulations", "tax changes", "compliance"],
            "sector_analysis": ["industry trends", "sector performance", "competitive landscape"]
        }
        
    async def generate_queries(self, request: QueryGenerationRequest) -> List[GeneratedQuery]:
        """Generate multiple search queries for comprehensive research"""
        
        if not self.client:
            return self._fallback_query_generation(request)
        
        try:
            # Generate diverse search angles
            search_angles = await self._identify_search_angles(request)
            
            # Generate queries for each angle
            generated_queries = []
            for angle in search_angles[:request.max_queries]:
                query = await self._generate_single_query(request, angle)
                if query:
                    generated_queries.append(query)
            
            # Ensure we have at least one query
            if not generated_queries:
                fallback_queries = self._fallback_query_generation(request)
                generated_queries.extend(fallback_queries)
            
            logger.info(f"Generated {len(generated_queries)} search queries for intent: {request.intent}")
            return generated_queries
            
        except Exception as e:
            logger.error(f"Error in semantic query generation: {str(e)}")
            return self._fallback_query_generation(request)
    
    async def _identify_search_angles(self, request: QueryGenerationRequest) -> List[str]:
        """Identify different research angles for the query"""
        
        system_prompt = """You are a financial research strategist. Given a user query about financial markets, 
        identify 3-5 different research angles that would provide comprehensive coverage.

        Research angles should be specific and actionable, such as:
        - current_market_data: Live prices, recent performance
        - expert_analysis: Analyst opinions, recommendations  
        - fundamental_analysis: Company financials, ratios
        - technical_analysis: Price patterns, trading signals
        - news_impact: Recent news affecting the topic
        - regulatory_context: Policy impacts, compliance issues
        - comparative_analysis: Benchmarking against peers
        - historical_context: Long-term trends, historical performance

        Respond with a JSON array of angle names only."""
        
        user_prompt = f"""
        User Query: {request.user_query}
        Intent: {request.intent}
        Search Scope: {request.search_scope}
        
        Context: {self._format_context_for_prompt(request.user_context)}
        
        Identify the most relevant research angles for this query.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=200,
                temperature=0.3
            )
            
            import json
            angles = json.loads(response.choices[0].message.content)
            return angles if isinstance(angles, list) else ["current_market_data", "expert_analysis", "news_impact"]
            
        except Exception as e:
            logger.warning(f"Error identifying search angles: {str(e)}")
            return ["current_market_data", "expert_analysis", "news_impact"]
    
    async def _generate_single_query(self, request: QueryGenerationRequest, search_angle: str) -> Optional[GeneratedQuery]:
        """Generate a single optimized search query for specific angle"""
        
        system_prompt = f"""You are an expert financial researcher specializing in Indian markets. 
        Generate an optimal search query for the given angle that will find the most relevant and current information.

        Guidelines:
        - Include relevant Indian market context (NSE, BSE, Nifty, Sensex where appropriate)
        - Use specific financial terminology
        - Consider time sensitivity (use "latest", "current", "today" for recent data)
        - Include relevant stock symbols or company names from user context
        - Optimize for Indian financial news sources and data providers
        - Keep queries focused and specific (avoid overly broad terms)

        Search Angle: {search_angle}
        
        Respond with a JSON object:
        {{
            "query": "optimized search query",
            "confidence": 0.8,
            "reasoning": "why this query will be effective",
            "expected_sources": ["type1", "type2", "type3"]
        }}
        """
        
        # Build context-aware prompt
        context_info = ""
        if request.user_context:
            portfolio = request.user_context.get('portfolio', {})
            stocks = portfolio.get('stocks', [])[:3]  # Top 3 holdings
            if stocks:
                stock_symbols = [stock.get('symbol', '') for stock in stocks]
                context_info += f"User's top holdings: {', '.join(stock_symbols)}\n"
        
        user_prompt = f"""
        User Query: {request.user_query}
        Intent: {request.intent}
        Search Angle: {search_angle}
        
        {context_info}
        
        Generate an optimized search query for this specific angle.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=300,
                temperature=0.4
            )
            
            import json
            result = json.loads(response.choices[0].message.content)
            
            return GeneratedQuery(
                query=result.get("query", ""),
                confidence=result.get("confidence", 0.5),
                reasoning=result.get("reasoning", ""),
                search_angle=search_angle,
                expected_sources=result.get("expected_sources", [])
            )
            
        except Exception as e:
            logger.warning(f"Error generating query for angle {search_angle}: {str(e)}")
            return None
    
    def _fallback_query_generation(self, request: QueryGenerationRequest) -> List[GeneratedQuery]:
        """Fallback to rule-based query generation when LLM is unavailable"""
        
        base_query = request.user_query
        user_context = request.user_context or {}
        
        # Extract user's holdings for context
        portfolio_context = ""
        if user_context.get('portfolio', {}).get('stocks'):
            stocks = user_context['portfolio']['stocks'][:3]
            symbols = [stock.get('symbol', '') for stock in stocks if stock.get('symbol')]
            if symbols:
                portfolio_context = f" {' '.join(symbols)}"
        
        # Generate different query variations based on intent
        queries = []
        
        if request.intent == "market_update":
            queries.extend([
                GeneratedQuery(
                    query=f"India stock market today Nifty Sensex latest news{portfolio_context}",
                    confidence=0.8,
                    reasoning="Current market overview with user's holdings context",
                    search_angle="current_market_data",
                    expected_sources=["financial_news", "market_data", "broker_reports"]
                ),
                GeneratedQuery(
                    query=f"Indian stock market analysis today performance{portfolio_context}",
                    confidence=0.7,
                    reasoning="Market performance analysis",
                    search_angle="expert_analysis",
                    expected_sources=["analyst_reports", "financial_media"]
                )
            ])
        
        elif request.intent == "stock_research":
            # Extract stock symbols from query
            import re
            symbols = re.findall(r'\b[A-Z]{2,6}\b', base_query.upper())
            if symbols:
                symbol = symbols[0]
                queries.extend([
                    GeneratedQuery(
                        query=f"{symbol} stock price news India market analysis latest",
                        confidence=0.9,
                        reasoning=f"Comprehensive research on {symbol}",
                        search_angle="current_market_data",
                        expected_sources=["financial_news", "broker_reports", "company_news"]
                    ),
                    GeneratedQuery(
                        query=f"{symbol} financial results earnings India stock analysis",
                        confidence=0.8,
                        reasoning=f"Fundamental analysis for {symbol}",
                        search_angle="fundamental_analysis",
                        expected_sources=["financial_reports", "analyst_research"]
                    )
                ])
        
        elif request.intent == "portfolio_analysis":
            queries.extend([
                GeneratedQuery(
                    query=f"portfolio analysis India market{portfolio_context} performance today",
                    confidence=0.7,
                    reasoning="Portfolio performance in current market context",
                    search_angle="current_market_data",
                    expected_sources=["market_analysis", "portfolio_tools"]
                )
            ])
        
        # Default fallback
        if not queries:
            queries.append(
                GeneratedQuery(
                    query=f"{base_query} India market latest news",
                    confidence=0.6,
                    reasoning="General financial query with Indian market context",
                    search_angle="news_impact",
                    expected_sources=["financial_news", "general_news"]
                )
            )
        
        return queries[:request.max_queries]
    
    def _format_context_for_prompt(self, user_context: Optional[Dict[str, Any]]) -> str:
        """Format user context for LLM prompt"""
        
        if not user_context:
            return "No specific user context available."
        
        context_parts = []
        
        # User profile
        user_profile = user_context.get('user_profile', {})
        if user_profile:
            context_parts.append(f"User: {user_profile.get('profession', 'Professional')} from {user_profile.get('location', 'India')}")
        
        # Portfolio context
        portfolio = user_context.get('portfolio', {})
        if portfolio.get('stocks'):
            stocks = portfolio['stocks'][:3]
            symbols = [stock.get('symbol', '') for stock in stocks if stock.get('symbol')]
            if symbols:
                context_parts.append(f"Top holdings: {', '.join(symbols)}")
        
        # Investment profile
        investment_profile = user_context.get('investment_profile', {})
        if investment_profile:
            risk_tolerance = investment_profile.get('risk_tolerance', '')
            if risk_tolerance:
                context_parts.append(f"Risk tolerance: {risk_tolerance}")
        
        return " | ".join(context_parts) if context_parts else "No specific context available."
    
    async def optimize_query_for_sources(self, query: str, preferred_sources: List[str]) -> str:
        """Optimize query for specific source types"""
        
        if not self.client or not preferred_sources:
            return query
        
        source_optimizations = {
            "financial_news": "add site:economictimes.indiatimes.com OR site:moneycontrol.com",
            "broker_reports": "add analyst report OR research report OR target price",
            "regulatory": "add RBI OR SEBI OR regulatory filing",
            "market_data": "add NSE OR BSE OR stock price OR market data"
        }
        
        # Simple rule-based optimization for now
        # In production, this could use LLM for more sophisticated optimization
        optimized_query = query
        
        for source in preferred_sources:
            if source in source_optimizations:
                addition = source_optimizations[source]
                if "site:" in addition:
                    optimized_query += f" {addition}"
                else:
                    optimized_query += f" {addition}"
        
        return optimized_query
    
    def get_query_metrics(self) -> Dict[str, Any]:
        """Get metrics about query generation performance"""
        
        return {
            "llm_available": self.client is not None,
            "fallback_usage": "rule_based" if not self.client else "llm_primary",
            "supported_intents": [
                "market_update", "stock_research", "portfolio_analysis", 
                "economic_news", "investment_research"
            ]
        }