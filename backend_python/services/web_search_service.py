"""
Web search service using Serper API for real-time market data and news
"""

import logging
from typing import Dict, Any, List, Optional
import httpx
import asyncio
from datetime import datetime

from config.settings import get_settings
from models.chat import WebSearchResult, WebSearchResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class WebSearchService:
    def __init__(self):
        self.api_key = settings.serper_api_key
        self.base_url = "https://google.serper.dev/search"
        self.default_location = "India"
        self.default_gl = "in"  # India
        
        logger.info("Web Search Service initialized")
        logger.info(f"Serper API configured: {bool(self.api_key)}")
    
    async def search(self, query: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Perform web search using Serper API"""
        
        if not self.api_key:
            logger.warning("Serper API key not configured")
            return {"error": "Web search not available"}
        
        if not options:
            options = {}
        
        # Prepare search parameters
        search_params = {
            "q": query,
            "gl": options.get("gl", self.default_gl),
            "hl": "en",
            "num": options.get("num", 5),
            "type": "search"
        }
        
        # Add location if specified
        if "location" in options:
            search_params["location"] = options["location"]
        
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    json=search_params,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    results = response.json()
                    logger.info(f"Web search successful for query: {query}")
                    return results
                else:
                    logger.error(f"Web search failed with status {response.status_code}: {response.text}")
                    return {"error": f"Search request failed: {response.status_code}"}
        
        except httpx.TimeoutException:
            logger.error("Web search request timed out")
            return {"error": "Search request timed out"}
        except Exception as e:
            logger.error(f"Web search error: {str(e)}")
            return {"error": f"Search service error: {str(e)}"}
    
    def should_perform_web_search(self, user_message: str, user_context: Optional[Dict[str, Any]] = None) -> bool:
        """Determine if web search should be performed for the given query"""
        
        # Keywords that typically require current information
        search_keywords = [
            "current", "today", "latest", "recent", "now", "update",
            "market", "price", "stock", "nifty", "sensex", "news",
            "economy", "rbi", "inflation", "budget", "policy",
            "performance", "trend", "analysis", "forecast"
        ]
        
        # Time-based keywords
        time_keywords = [
            "today", "this week", "this month", "this year",
            "recent", "latest", "current", "now"
        ]
        
        # Financial market keywords
        market_keywords = [
            "market", "stock", "share", "equity", "mutual fund",
            "nifty", "sensex", "bse", "nse", "trading",
            "price", "valuation", "analysis"
        ]
        
        message_lower = user_message.lower()
        
        # Check for search-triggering keywords
        has_search_keyword = any(keyword in message_lower for keyword in search_keywords)
        has_time_keyword = any(keyword in message_lower for keyword in time_keywords)
        has_market_keyword = any(keyword in message_lower for keyword in market_keywords)
        
        # Always search for time-sensitive market queries
        if has_time_keyword and has_market_keyword:
            return True
        
        # Search for general market queries
        if has_market_keyword and has_search_keyword:
            return True
        
        # Search for specific stock queries
        if any(symbol in message_lower for symbol in ['infy', 'tcs', 'hdfc', 'reliance', 'wipro']):
            return True
        
        # Check if user has specific stocks in portfolio and query is related
        if user_context and user_context.get('portfolio', {}).get('stocks'):
            user_stocks = [stock.get('symbol', '').lower() for stock in user_context['portfolio']['stocks']]
            if any(stock in message_lower for stock in user_stocks):
                return True
        
        return False
    
    def generate_search_query(self, user_message: str, user_context: Optional[Dict[str, Any]] = None) -> str:
        """Generate optimized search query for the user message"""
        
        message_lower = user_message.lower()
        
        # Market overview queries
        if any(keyword in message_lower for keyword in ["market", "overview", "update", "today"]):
            return "India stock market today Nifty Sensex latest news"
        
        # Specific stock queries
        stock_symbols = ['infy', 'tcs', 'hdfc', 'reliance', 'wipro', 'icici']
        for symbol in stock_symbols:
            if symbol in message_lower:
                return f"{symbol} stock price today India market news"
        
        # Economic policy queries
        if any(keyword in message_lower for keyword in ["rbi", "policy", "inflation", "interest"]):
            return "RBI monetary policy India interest rates inflation latest"
        
        # Mutual fund queries
        if "mutual fund" in message_lower or "mf" in message_lower:
            return "India mutual funds performance today market analysis"
        
        # Investment advice queries
        if any(keyword in message_lower for keyword in ["invest", "buy", "sell", "recommendation"]):
            return "India stock market investment advice today analysis"
        
        # Default: enhance the query with Indian market context
        enhanced_query = f"{user_message} India stock market latest"
        
        # Add user's stock context if available
        if user_context and user_context.get('portfolio', {}).get('stocks'):
            stocks = user_context['portfolio']['stocks']
            if isinstance(stocks, list) and stocks:
                top_stocks = stocks[:3]  # Top 3 holdings
                stock_symbols = [stock.get('symbol', '') for stock in top_stocks if isinstance(stock, dict)]
                if stock_symbols:
                    enhanced_query += f" {' '.join(stock_symbols)}"
        
        return enhanced_query
    
    def summarize_search_results(self, search_results: Dict[str, Any]) -> str:
        """Summarize search results for AI context"""
        
        if "error" in search_results:
            return f"Web search error: {search_results['error']}"
        
        summary = "\n=== CURRENT WEB SEARCH RESULTS ===\n"
        
        # Add search metadata
        if "searchParameters" in search_results:
            query = search_results["searchParameters"].get("q", "")
            summary += f"Search Query: {query}\n"
            summary += f"Search Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}\n\n"
        
        # Add organic results
        if "organic" in search_results:
            summary += "=== TOP SEARCH RESULTS ===\n"
            for i, result in enumerate(search_results["organic"][:5], 1):
                title = result.get("title", "")
                snippet = result.get("snippet", "")
                link = result.get("link", "")
                date = result.get("date", "")
                
                summary += f"{i}. **{title}**\n"
                if date:
                    summary += f"   Date: {date}\n"
                summary += f"   {snippet}\n"
                summary += f"   Source: {link}\n\n"
        
        # Add knowledge graph if available
        if "knowledgeGraph" in search_results:
            kg = search_results["knowledgeGraph"]
            summary += "=== KNOWLEDGE GRAPH INFO ===\n"
            if "title" in kg:
                summary += f"Title: {kg['title']}\n"
            if "description" in kg:
                summary += f"Description: {kg['description']}\n"
            if "attributes" in kg:
                for key, value in kg["attributes"].items():
                    summary += f"{key}: {value}\n"
            summary += "\n"
        
        # Add news results if available
        if "news" in search_results:
            summary += "=== LATEST NEWS ===\n"
            for i, news in enumerate(search_results["news"][:3], 1):
                title = news.get("title", "")
                snippet = news.get("snippet", "")
                date = news.get("date", "")
                source = news.get("source", "")
                
                summary += f"{i}. **{title}**\n"
                if source:
                    summary += f"   Source: {source}\n"
                if date:
                    summary += f"   Date: {date}\n"
                summary += f"   {snippet}\n\n"
        
        summary += "=== END WEB SEARCH RESULTS ===\n"
        
        return summary
    
    def extract_sources(self, search_results: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract source citations from search results"""
        
        sources = []
        
        if "organic" in search_results:
            for result in search_results["organic"][:5]:
                source = {
                    "title": result.get("title", ""),
                    "link": result.get("link", ""),
                    "date": result.get("date", "")
                }
                sources.append(source)
        
        if "news" in search_results:
            for news in search_results["news"][:3]:
                source = {
                    "title": news.get("title", ""),
                    "link": news.get("link", ""),
                    "date": news.get("date", ""),
                    "source": news.get("source", "")
                }
                sources.append(source)
        
        return sources
    
    async def search_market_data(self, query: str) -> Dict[str, Any]:
        """Specialized search for market data"""
        market_query = f"{query} India stock market Nifty Sensex BSE NSE latest"
        return await self.search(market_query, {"location": "India", "num": 10})
    
    async def search_company_news(self, company_symbol: str) -> Dict[str, Any]:
        """Search for specific company news"""
        query = f"{company_symbol} stock price news India market analysis latest"
        return await self.search(query, {"location": "India", "num": 5})
    
    async def search_economic_news(self) -> Dict[str, Any]:
        """Search for general economic news"""
        query = "India economy RBI policy inflation interest rates stock market latest news"
        return await self.search(query, {"location": "India", "num": 8})