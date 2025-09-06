"""
Intelligent Search Orchestrator - Coordinates multiple search strategies
Replaces single query searches with parallel, multi-angle research
"""

import logging
import asyncio
import hashlib
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict

from services.semantic_query_generator import SemanticQueryGenerator, QueryGenerationRequest, GeneratedQuery
from services.web_search_service import WebSearchService
from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@dataclass
class SearchResult:
    """Enhanced search result with metadata"""
    title: str
    snippet: str
    url: str
    source: str = ""
    date: str = ""
    relevance_score: float = 0.0
    credibility_score: float = 0.0
    search_angle: str = ""
    duplicate_group: Optional[str] = None


@dataclass
class OrchestrationResult:
    """Result of orchestrated search across multiple queries"""
    results: List[SearchResult] = field(default_factory=list)
    search_summary: Dict[str, Any] = field(default_factory=dict)
    query_performance: Dict[str, float] = field(default_factory=dict)
    total_sources: int = 0
    deduplication_stats: Dict[str, int] = field(default_factory=dict)
    synthesis_ready: bool = False


class IntelligentSearchOrchestrator:
    """Orchestrates intelligent search across multiple queries and sources"""
    
    def __init__(self):
        self.query_generator = SemanticQueryGenerator()
        self.web_search = WebSearchService()
        
        # Source credibility weights for Indian financial context
        self.source_credibility = {
            # High credibility sources
            "economictimes.indiatimes.com": 0.9,
            "moneycontrol.com": 0.9,
            "livemint.com": 0.9,
            "business-standard.com": 0.9,
            "financialexpress.com": 0.9,
            "rbi.org.in": 1.0,
            "sebi.gov.in": 1.0,
            "nseindia.com": 0.95,
            "bseindia.com": 0.95,
            
            # Medium credibility
            "reuters.com": 0.8,
            "bloomberg.com": 0.8,
            "cnbc.com": 0.7,
            "investing.com": 0.7,
            "marketwatch.com": 0.7,
            
            # Default for unknown sources
            "default": 0.5
        }
        
        # Cache for deduplication
        self.result_cache = {}
        self.cache_ttl = 300  # 5 minutes
        
        logger.info("Intelligent Search Orchestrator initialized")
    
    async def orchestrate_search(self, user_query: str, intent: str, 
                                user_context: Optional[Dict[str, Any]] = None,
                                max_results: int = 15) -> OrchestrationResult:
        """Orchestrate comprehensive search across multiple queries"""
        
        start_time = datetime.now()
        
        try:
            # Generate multiple search queries
            query_request = QueryGenerationRequest(
                user_query=user_query,
                intent=intent,
                user_context=user_context,
                max_queries=3
            )
            
            generated_queries = await self.query_generator.generate_queries(query_request)
            logger.info(f"Generated {len(generated_queries)} queries for orchestration")
            
            # Execute searches in parallel
            search_tasks = []
            for generated_query in generated_queries:
                task = self._execute_single_search(generated_query, user_context)
                search_tasks.append(task)
            
            # Wait for all searches to complete
            search_results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Process and combine results
            all_results = []
            query_performance = {}
            
            for i, result in enumerate(search_results):
                if isinstance(result, Exception):
                    logger.warning(f"Search {i} failed: {str(result)}")
                    query_performance[f"query_{i}"] = 0.0
                    continue
                
                if isinstance(result, tuple):
                    results, performance = result
                    all_results.extend(results)
                    query_performance[f"query_{i}"] = performance
            
            # Deduplicate and score results
            deduplicated_results = self._deduplicate_results(all_results)
            scored_results = self._score_and_rank_results(deduplicated_results, user_query, user_context)
            
            # Limit results and prepare final output
            final_results = scored_results[:max_results]
            
            # Calculate orchestration metrics
            orchestration_time = (datetime.now() - start_time).total_seconds()
            
            result = OrchestrationResult(
                results=final_results,
                search_summary={
                    "total_queries_executed": len(generated_queries),
                    "total_raw_results": len(all_results),
                    "deduplicated_results": len(deduplicated_results),
                    "final_results": len(final_results),
                    "orchestration_time_seconds": orchestration_time,
                    "average_credibility": sum(r.credibility_score for r in final_results) / max(len(final_results), 1)
                },
                query_performance=query_performance,
                total_sources=len(set(r.source for r in final_results)),
                deduplication_stats={
                    "raw_count": len(all_results),
                    "deduplicated_count": len(deduplicated_results),
                    "duplicates_removed": len(all_results) - len(deduplicated_results)
                },
                synthesis_ready=len(final_results) >= 3  # Need at least 3 sources for synthesis
            )
            
            logger.info(f"Search orchestration completed: {len(final_results)} results from {len(generated_queries)} queries")
            return result
            
        except Exception as e:
            logger.error(f"Error in search orchestration: {str(e)}")
            
            # Fallback to simple search
            fallback_results = await self._fallback_search(user_query, user_context)
            
            return OrchestrationResult(
                results=fallback_results,
                search_summary={"fallback_mode": True, "error": str(e)},
                synthesis_ready=len(fallback_results) > 0
            )
    
    async def _execute_single_search(self, generated_query: GeneratedQuery, 
                                   user_context: Optional[Dict[str, Any]]) -> Tuple[List[SearchResult], float]:
        """Execute a single search query and return enhanced results"""
        
        try:
            # Prepare search parameters
            search_params = {
                "location": "India",
                "num": 6,  # Get more results for better deduplication
                "gl": "in"
            }
            
            # Execute search
            raw_results = await self.web_search.search(generated_query.query, search_params)
            
            if "error" in raw_results:
                logger.warning(f"Search error for query '{generated_query.query}': {raw_results['error']}")
                return [], 0.0
            
            # Convert to enhanced results
            enhanced_results = []
            
            # Process organic results
            for result in raw_results.get("organic", [])[:5]:
                enhanced_result = SearchResult(
                    title=result.get("title", ""),
                    snippet=result.get("snippet", ""),
                    url=result.get("link", ""),
                    source=self._extract_domain(result.get("link", "")),
                    date=result.get("date", ""),
                    search_angle=generated_query.search_angle
                )
                enhanced_results.append(enhanced_result)
            
            # Process news results if available
            for news in raw_results.get("news", [])[:3]:
                enhanced_result = SearchResult(
                    title=news.get("title", ""),
                    snippet=news.get("snippet", ""),
                    url=news.get("link", ""),
                    source=news.get("source", ""),
                    date=news.get("date", ""),
                    search_angle="news_impact"
                )
                enhanced_results.append(enhanced_result)
            
            # Calculate performance score
            performance = len(enhanced_results) / max(6, 1) * generated_query.confidence
            
            return enhanced_results, performance
            
        except Exception as e:
            logger.error(f"Error executing search for query '{generated_query.query}': {str(e)}")
            return [], 0.0
    
    def _deduplicate_results(self, results: List[SearchResult]) -> List[SearchResult]:
        """Remove duplicate results using content similarity"""
        
        if not results:
            return results
        
        # Group by URL first (exact duplicates)
        url_groups = defaultdict(list)
        for result in results:
            if result.url:
                url_groups[result.url].append(result)
        
        # Keep best result from each URL group
        deduplicated = []
        for url, group in url_groups.items():
            if len(group) == 1:
                deduplicated.append(group[0])
            else:
                # Keep the one with highest credibility or most content
                best_result = max(group, key=lambda r: (
                    self._get_source_credibility(r.source),
                    len(r.snippet),
                    len(r.title)
                ))
                deduplicated.append(best_result)
        
        # Content-based deduplication using title/snippet similarity
        final_results = []
        seen_content_hashes = set()
        
        for result in deduplicated:
            # Create content hash
            content = f"{result.title} {result.snippet}".lower()
            content_hash = hashlib.md5(content.encode()).hexdigest()[:8]
            
            if content_hash not in seen_content_hashes:
                seen_content_hashes.add(content_hash)
                result.duplicate_group = content_hash
                final_results.append(result)
        
        logger.info(f"Deduplication: {len(results)} -> {len(final_results)} results")
        return final_results
    
    def _score_and_rank_results(self, results: List[SearchResult], user_query: str,
                               user_context: Optional[Dict[str, Any]]) -> List[SearchResult]:
        """Score and rank results by relevance and credibility"""
        
        user_query_lower = user_query.lower()
        user_holdings = self._extract_user_holdings(user_context)
        
        for result in results:
            # Base relevance score
            relevance_score = 0.0
            
            # Title relevance
            title_lower = result.title.lower()
            query_words = user_query_lower.split()
            title_matches = sum(1 for word in query_words if word in title_lower)
            relevance_score += (title_matches / len(query_words)) * 0.4
            
            # Snippet relevance
            snippet_lower = result.snippet.lower()
            snippet_matches = sum(1 for word in query_words if word in snippet_lower)
            relevance_score += (snippet_matches / len(query_words)) * 0.3
            
            # User holdings relevance
            if user_holdings:
                holdings_matches = sum(1 for holding in user_holdings 
                                     if holding.lower() in title_lower or holding.lower() in snippet_lower)
                relevance_score += (holdings_matches / len(user_holdings)) * 0.2
            
            # Recency bonus
            if result.date:
                try:
                    # Simple date parsing - could be enhanced
                    if "today" in result.date.lower() or "hour" in result.date.lower():
                        relevance_score += 0.1
                    elif "yesterday" in result.date.lower():
                        relevance_score += 0.05
                except:
                    pass
            
            # Credibility score
            credibility_score = self._get_source_credibility(result.source)
            
            # Final scores
            result.relevance_score = min(1.0, relevance_score)
            result.credibility_score = credibility_score
        
        # Sort by combined score (relevance * credibility)
        results.sort(key=lambda r: r.relevance_score * r.credibility_score, reverse=True)
        
        return results
    
    def _get_source_credibility(self, source: str) -> float:
        """Get credibility score for a source"""
        
        if not source:
            return self.source_credibility["default"]
        
        source_lower = source.lower()
        
        # Check exact matches first
        for domain, score in self.source_credibility.items():
            if domain in source_lower:
                return score
        
        # Check for government domains
        if ".gov.in" in source_lower:
            return 1.0
        
        # Check for major news domains
        if any(keyword in source_lower for keyword in ["reuters", "bloomberg", "ap.org", "bbc"]):
            return 0.85
        
        # Check for financial domains
        if any(keyword in source_lower for keyword in ["financial", "money", "market", "invest"]):
            return 0.7
        
        return self.source_credibility["default"]
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc
        except:
            return url
    
    def _extract_user_holdings(self, user_context: Optional[Dict[str, Any]]) -> List[str]:
        """Extract user's stock holdings for relevance scoring"""
        
        if not user_context or not user_context.get('portfolio'):
            return []
        
        holdings = []
        
        # Extract stock symbols and company names
        for stock in user_context.get('portfolio', {}).get('stocks', []):
            if stock.get('symbol'):
                holdings.append(stock['symbol'])
            if stock.get('company_name'):
                holdings.append(stock['company_name'])
        
        # Extract mutual fund names
        for mf in user_context.get('portfolio', {}).get('mutual_funds', []):
            if mf.get('scheme_name'):
                # Extract fund house or key terms
                scheme_parts = mf['scheme_name'].split()[:3]  # First 3 words
                holdings.extend(scheme_parts)
        
        return holdings[:10]  # Limit to prevent over-weighting
    
    async def _fallback_search(self, user_query: str, user_context: Optional[Dict[str, Any]]) -> List[SearchResult]:
        """Fallback to simple search when orchestration fails"""
        
        try:
            enhanced_query = f"{user_query} India market latest news"
            
            raw_results = await self.web_search.search(enhanced_query, {
                "location": "India", 
                "num": 5, 
                "gl": "in"
            })
            
            if "error" in raw_results:
                return []
            
            results = []
            for result in raw_results.get("organic", []):
                enhanced_result = SearchResult(
                    title=result.get("title", ""),
                    snippet=result.get("snippet", ""),
                    url=result.get("link", ""),
                    source=self._extract_domain(result.get("link", "")),
                    date=result.get("date", ""),
                    search_angle="fallback"
                )
                enhanced_result.credibility_score = self._get_source_credibility(enhanced_result.source)
                enhanced_result.relevance_score = 0.5  # Default relevance
                results.append(enhanced_result)
            
            return results
            
        except Exception as e:
            logger.error(f"Fallback search also failed: {str(e)}")
            return []
    
    def get_orchestration_stats(self) -> Dict[str, Any]:
        """Get orchestration performance statistics"""
        
        return {
            "query_generator_stats": self.query_generator.get_query_metrics(),
            "source_credibility_rules": len(self.source_credibility),
            "cache_size": len(self.result_cache),
            "supported_search_angles": [
                "current_market_data", "expert_analysis", "news_impact",
                "fundamental_analysis", "technical_analysis", "regulatory_context"
            ]
        }