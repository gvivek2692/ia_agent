"""
Smart Search Decision Engine - Context-aware web search decision making
Determines when and what to search based on user query, portfolio context, and conversation history
"""

import logging
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class SearchIntent(Enum):
    """Types of search intents"""
    PORTFOLIO_ANALYSIS = "portfolio_analysis"
    MARKET_UPDATE = "market_update" 
    STOCK_RESEARCH = "stock_research"
    ECONOMIC_NEWS = "economic_news"
    INVESTMENT_RESEARCH = "investment_research"
    COMPARATIVE_ANALYSIS = "comparative_analysis"
    SECTOR_ANALYSIS = "sector_analysis"
    POLICY_IMPACT = "policy_impact"
    GENERAL_FINANCIAL = "general_financial"


@dataclass
class SearchDecision:
    """Decision about whether and how to search"""
    should_search: bool
    search_intent: Optional[SearchIntent] = None
    search_query: Optional[str] = None
    priority: int = 0  # 1-10, higher = more urgent
    context_hints: List[str] = None  # Additional context for search
    search_scope: str = "general"  # general, portfolio-specific, market-focused
    estimated_relevance: float = 0.0  # 0.0-1.0


class SmartSearchEngine:
    """Intelligent search decision making with context awareness"""
    
    def __init__(self):
        self.search_patterns = self._initialize_search_patterns()
        self.market_keywords = self._initialize_market_keywords()
        self.time_sensitive_keywords = self._initialize_time_keywords()
        
        # Track recent searches to avoid redundancy
        self.recent_searches: Dict[str, datetime] = {}
        self.search_cooldown = 300  # 5 minutes between similar searches
        
        logger.info("Smart Search Engine initialized")
    
    def _initialize_search_patterns(self) -> Dict[SearchIntent, Dict[str, Any]]:
        """Initialize search patterns for different intents"""
        
        return {
            SearchIntent.PORTFOLIO_ANALYSIS: {
                "keywords": [
                    "my portfolio", "my stocks", "my investments", "my holdings",
                    "portfolio performance", "how are my stocks doing", "portfolio review"
                ],
                "boost_words": ["current", "today", "recent", "latest", "now"],
                "priority": 9,
                "scope": "portfolio-specific",
                "query_template": "{user_stocks} stock performance India market analysis today"
            },
            
            SearchIntent.MARKET_UPDATE: {
                "keywords": [
                    "market", "nifty", "sensex", "market today", "market update",
                    "indices", "market performance", "stock market", "market news"
                ],
                "boost_words": ["today", "current", "latest", "now", "live"],
                "priority": 8,
                "scope": "market-focused",
                "query_template": "India stock market {query} Nifty Sensex latest news today"
            },
            
            SearchIntent.STOCK_RESEARCH: {
                "keywords": [
                    "infy", "tcs", "reliance", "hdfc", "wipro", "icici", "sbi", "bharti",
                    "stock analysis", "company performance", "earnings", "results"
                ],
                "boost_words": ["analysis", "research", "forecast", "target", "recommendation"],
                "priority": 7,
                "scope": "portfolio-specific",
                "query_template": "{stock_symbol} stock analysis India market news target price"
            },
            
            SearchIntent.ECONOMIC_NEWS: {
                "keywords": [
                    "rbi", "interest rates", "inflation", "gdp", "economic policy",
                    "budget", "monetary policy", "fiscal policy", "economy"
                ],
                "boost_words": ["latest", "recent", "new", "announcement", "decision"],
                "priority": 8,
                "scope": "general",
                "query_template": "India {query} economy RBI monetary policy latest news"
            },
            
            SearchIntent.INVESTMENT_RESEARCH: {
                "keywords": [
                    "should i invest", "investment advice", "buy or sell", "investment opportunity",
                    "new investment", "investment strategy", "where to invest"
                ],
                "boost_words": ["analysis", "recommendation", "advice", "strategy"],
                "priority": 7,
                "scope": "general",
                "query_template": "India investment {query} market analysis recommendation 2025"
            },
            
            SearchIntent.COMPARATIVE_ANALYSIS: {
                "keywords": [
                    "compare", "vs", "versus", "better investment", "which is better",
                    "comparison", "alternative", "choose between"
                ],
                "boost_words": ["analysis", "comparison", "performance", "returns"],
                "priority": 6,
                "scope": "general",
                "query_template": "{comparison_items} India market comparison analysis 2025"
            },
            
            SearchIntent.SECTOR_ANALYSIS: {
                "keywords": [
                    "it sector", "banking sector", "pharma sector", "auto sector",
                    "sector performance", "industry analysis", "sector outlook"
                ],
                "boost_words": ["outlook", "performance", "analysis", "forecast"],
                "priority": 6,
                "scope": "market-focused",
                "query_template": "{sector} sector India market analysis performance outlook"
            },
            
            SearchIntent.POLICY_IMPACT: {
                "keywords": [
                    "budget impact", "policy impact", "tax changes", "regulatory changes",
                    "new rules", "compliance", "tax implications"
                ],
                "boost_words": ["impact", "effect", "changes", "new", "update"],
                "priority": 7,
                "scope": "general",
                "query_template": "India {policy_topic} impact stock market investment analysis"
            }
        }
    
    def _initialize_market_keywords(self) -> Dict[str, List[str]]:
        """Initialize market-related keyword groups"""
        
        return {
            "indices": ["nifty", "sensex", "nifty50", "banknifty", "niftynext50"],
            "market_status": ["market open", "market closed", "trading hours", "market timing"],
            "market_events": ["ipo", "bonus", "dividend", "split", "buyback", "merger"],
            "sectors": [
                "it", "banking", "pharma", "auto", "fmcg", "metal", "energy",
                "infrastructure", "realty", "telecom", "healthcare"
            ],
            "instruments": [
                "stocks", "shares", "equity", "mutual funds", "etf", "bonds",
                "derivatives", "options", "futures"
            ]
        }
    
    def _initialize_time_keywords(self) -> List[str]:
        """Initialize time-sensitive keywords that boost search priority"""
        
        return [
            "today", "now", "current", "latest", "recent", "live", "real-time",
            "this week", "this month", "yesterday", "breaking", "urgent",
            "just announced", "new", "updated", "fresh"
        ]
    
    def analyze_search_need(self, user_message: str, user_context: Optional[Dict[str, Any]] = None,
                           conversation_history: Optional[List[str]] = None) -> SearchDecision:
        """Analyze if search is needed and determine search strategy"""
        
        message_lower = user_message.lower()
        
        # Check for recent similar searches
        if self._is_recent_duplicate(user_message):
            return SearchDecision(
                should_search=False,
                context_hints=["Recent similar search performed"]
            )
        
        # Analyze search intent
        search_intent, base_score = self._detect_search_intent(message_lower)
        
        if not search_intent:
            return SearchDecision(should_search=False)
        
        # Calculate search priority and relevance
        priority_score = self._calculate_priority(message_lower, search_intent, user_context)
        time_urgency = self._assess_time_urgency(message_lower)
        context_relevance = self._assess_context_relevance(message_lower, user_context, conversation_history)
        
        final_score = (base_score + priority_score + time_urgency + context_relevance) / 4
        
        # Decide if search should be performed
        search_threshold = 0.4
        should_search = final_score >= search_threshold
        
        if not should_search:
            return SearchDecision(
                should_search=False,
                estimated_relevance=final_score
            )
        
        # Generate optimized search query
        search_query = self._generate_smart_query(user_message, search_intent, user_context)
        
        # Extract context hints
        context_hints = self._extract_context_hints(message_lower, user_context)
        
        decision = SearchDecision(
            should_search=True,
            search_intent=search_intent,
            search_query=search_query,
            priority=min(10, int(priority_score * 10)),
            context_hints=context_hints,
            search_scope=self.search_patterns[search_intent]["scope"],
            estimated_relevance=final_score
        )
        
        # Track this search to prevent duplicates
        self._record_search(user_message)
        
        logger.info(f"Search decision: {decision.search_intent.value if decision.search_intent else 'None'} "
                   f"(relevance: {decision.estimated_relevance:.2f})")
        
        return decision
    
    def _detect_search_intent(self, message_lower: str) -> Tuple[Optional[SearchIntent], float]:
        """Detect the primary search intent from the message"""
        
        intent_scores = {}
        
        for intent, pattern in self.search_patterns.items():
            score = 0.0
            
            # Check keyword matches
            for keyword in pattern["keywords"]:
                if keyword in message_lower:
                    score += 1.0
                    
                    # Boost for exact phrase matches
                    if re.search(r'\b' + re.escape(keyword) + r'\b', message_lower):
                        score += 0.5
            
            # Check boost words
            for boost_word in pattern.get("boost_words", []):
                if boost_word in message_lower:
                    score += 0.3
            
            if score > 0:
                intent_scores[intent] = score
        
        if not intent_scores:
            return None, 0.0
        
        # Return highest scoring intent
        best_intent = max(intent_scores.items(), key=lambda x: x[1])
        return best_intent[0], min(1.0, best_intent[1] / 3.0)  # Normalize to 0-1
    
    def _calculate_priority(self, message_lower: str, search_intent: SearchIntent, 
                          user_context: Optional[Dict[str, Any]]) -> float:
        """Calculate search priority based on intent and context"""
        
        base_priority = self.search_patterns[search_intent]["priority"] / 10.0
        
        # Boost for portfolio-related queries
        if user_context and search_intent in [SearchIntent.PORTFOLIO_ANALYSIS, SearchIntent.STOCK_RESEARCH]:
            user_stocks = user_context.get('portfolio', {}).get('stocks', [])
            for stock in user_stocks:
                symbol = stock.get('symbol', '').lower()
                if symbol and symbol in message_lower:
                    base_priority += 0.2
                    break
        
        # Boost for market hours
        current_hour = datetime.now().hour
        if 9 <= current_hour <= 15:  # Market hours
            if search_intent in [SearchIntent.MARKET_UPDATE, SearchIntent.STOCK_RESEARCH]:
                base_priority += 0.1
        
        return min(1.0, base_priority)
    
    def _assess_time_urgency(self, message_lower: str) -> float:
        """Assess time urgency of the query"""
        
        urgency_score = 0.0
        
        for time_keyword in self.time_sensitive_keywords:
            if time_keyword in message_lower:
                urgency_score += 0.1
        
        # Boost for questions about current market conditions
        current_indicators = ["now", "current", "today", "live", "real-time"]
        for indicator in current_indicators:
            if indicator in message_lower:
                urgency_score += 0.15
        
        return min(1.0, urgency_score)
    
    def _assess_context_relevance(self, message_lower: str, user_context: Optional[Dict[str, Any]],
                                 conversation_history: Optional[List[str]]) -> float:
        """Assess relevance based on user context and conversation history"""
        
        relevance_score = 0.0
        
        # Check if query relates to user's portfolio
        if user_context:
            portfolio = user_context.get('portfolio', {})
            
            # Check stock symbols
            stocks = portfolio.get('stocks', [])
            for stock in stocks:
                symbol = stock.get('symbol', '').lower()
                if symbol and symbol in message_lower:
                    relevance_score += 0.3
            
            # Check sectors (simplified)
            stock_symbols = [stock.get('symbol', '').lower() for stock in stocks]
            if any(symbol in ['infy', 'tcs', 'wipro', 'hcl'] for symbol in stock_symbols):
                if any(term in message_lower for term in ['it sector', 'technology', 'software']):
                    relevance_score += 0.2
        
        # Check conversation continuity
        if conversation_history:
            recent_messages = ' '.join(conversation_history[-3:]).lower()
            
            # Look for related topics in recent conversation
            market_terms = ['market', 'stock', 'investment', 'portfolio', 'trading']
            recent_market_discussion = sum(1 for term in market_terms if term in recent_messages)
            
            if recent_market_discussion > 0:
                relevance_score += min(0.3, recent_market_discussion * 0.1)
        
        return min(1.0, relevance_score)
    
    def _generate_smart_query(self, user_message: str, search_intent: SearchIntent,
                             user_context: Optional[Dict[str, Any]]) -> str:
        """Generate optimized search query based on intent and context"""
        
        pattern = self.search_patterns[search_intent]
        query_template = pattern["query_template"]
        
        # Extract relevant information for query generation
        message_lower = user_message.lower()
        
        if search_intent == SearchIntent.PORTFOLIO_ANALYSIS and user_context:
            # Use user's actual stock symbols
            stocks = user_context.get('portfolio', {}).get('stocks', [])[:3]  # Top 3 holdings
            stock_symbols = [stock.get('symbol', '') for stock in stocks if stock.get('symbol')]
            user_stocks = ' '.join(stock_symbols) if stock_symbols else 'portfolio stocks'
            return query_template.format(user_stocks=user_stocks)
        
        elif search_intent == SearchIntent.STOCK_RESEARCH:
            # Extract stock symbol from message
            stock_symbols = ['infy', 'tcs', 'reliance', 'hdfc', 'wipro', 'icici', 'sbi']
            found_symbol = None
            for symbol in stock_symbols:
                if symbol in message_lower:
                    found_symbol = symbol
                    break
            
            if found_symbol:
                return query_template.format(stock_symbol=found_symbol.upper())
            else:
                return query_template.format(stock_symbol=user_message)
        
        elif search_intent == SearchIntent.COMPARATIVE_ANALYSIS:
            # Extract comparison items
            vs_indicators = [' vs ', ' versus ', ' or ', ' and ']
            comparison_items = user_message
            for indicator in vs_indicators:
                if indicator in message_lower:
                    comparison_items = user_message.replace(indicator, ' vs ')
                    break
            
            return query_template.format(comparison_items=comparison_items)
        
        elif search_intent == SearchIntent.SECTOR_ANALYSIS:
            # Extract sector
            sectors = self.market_keywords.get('sectors', [])
            found_sector = 'market'
            for sector in sectors:
                if sector in message_lower:
                    found_sector = sector
                    break
            
            return query_template.format(sector=found_sector)
        
        elif search_intent == SearchIntent.POLICY_IMPACT:
            # Extract policy topic
            policy_keywords = ['budget', 'tax', 'rbi', 'policy', 'regulation', 'law']
            policy_topic = 'economic policy'
            for keyword in policy_keywords:
                if keyword in message_lower:
                    policy_topic = keyword
                    break
            
            return query_template.format(policy_topic=policy_topic)
        
        else:
            # Use the query template with the original message
            return query_template.format(query=user_message)
    
    def _extract_context_hints(self, message_lower: str, user_context: Optional[Dict[str, Any]]) -> List[str]:
        """Extract context hints for search enhancement"""
        
        hints = []
        
        # Time-based hints
        if any(word in message_lower for word in ['today', 'now', 'current', 'latest']):
            hints.append("time_sensitive")
        
        # Portfolio-specific hints
        if user_context and any(word in message_lower for word in ['my', 'portfolio', 'holdings']):
            hints.append("portfolio_specific")
        
        # Market focus hints
        if any(word in message_lower for word in ['market', 'nifty', 'sensex', 'trading']):
            hints.append("market_focused")
        
        # Analysis depth hints
        if any(word in message_lower for word in ['analysis', 'research', 'detailed', 'comprehensive']):
            hints.append("detailed_analysis")
        
        return hints
    
    def _is_recent_duplicate(self, user_message: str) -> bool:
        """Check if this is a recent duplicate search"""
        
        message_key = user_message.lower().strip()[:100]  # First 100 chars as key
        
        if message_key in self.recent_searches:
            time_diff = datetime.now() - self.recent_searches[message_key]
            return time_diff.total_seconds() < self.search_cooldown
        
        return False
    
    def _record_search(self, user_message: str):
        """Record this search to prevent immediate duplicates"""
        
        message_key = user_message.lower().strip()[:100]
        self.recent_searches[message_key] = datetime.now()
        
        # Clean up old records (keep last hour)
        cutoff_time = datetime.now() - timedelta(hours=1)
        self.recent_searches = {
            k: v for k, v in self.recent_searches.items() 
            if v > cutoff_time
        }
    
    def get_search_statistics(self) -> Dict[str, Any]:
        """Get statistics about search patterns"""
        
        return {
            "recent_searches_count": len(self.recent_searches),
            "search_patterns_count": len(self.search_patterns),
            "market_keyword_groups": len(self.market_keywords),
            "cooldown_seconds": self.search_cooldown
        }
    
    def update_search_patterns(self, new_patterns: Dict[SearchIntent, Dict[str, Any]]):
        """Update search patterns (for future customization)"""
        
        self.search_patterns.update(new_patterns)
        logger.info(f"Updated search patterns. Total patterns: {len(self.search_patterns)}")
    
    def clear_search_history(self):
        """Clear recent search history"""
        
        self.recent_searches.clear()
        logger.info("Search history cleared")