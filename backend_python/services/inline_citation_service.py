"""
Inline Citation Service - Real-time source integration within AI responses
Processes web search results and creates inline citations that appear naturally in responses
"""

import logging
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class CitationStyle(Enum):
    """Different citation styles"""
    NUMBERED = "numbered"  # [1], [2], etc.
    BRACKETED = "bracketed"  # (Source: Times of India)
    INLINE = "inline"  # according to Economic Times
    SUPERSCRIPT = "superscript"  # ¹, ², etc.


@dataclass
class Citation:
    """Individual citation with metadata"""
    id: int
    title: str
    url: str
    source: str
    date: Optional[str] = None
    snippet: Optional[str] = None
    relevance_score: float = 0.0
    used_in_response: bool = False


@dataclass 
class CitationContext:
    """Context information for smart citation placement"""
    topic: str
    keywords: List[str]
    confidence: float
    data_type: str  # price, news, analysis, opinion, etc.


class InlineCitationService:
    """Intelligent inline citation system for AI responses"""
    
    def __init__(self, citation_style: CitationStyle = CitationStyle.NUMBERED):
        self.citation_style = citation_style
        self.citations: Dict[int, Citation] = {}
        self.citation_counter = 0
        
        # Keywords that indicate factual claims needing citations
        self.citation_keywords = self._initialize_citation_keywords()
        
        # Patterns for different types of information
        self.info_patterns = self._initialize_info_patterns()
        
        logger.info(f"Inline Citation Service initialized with {citation_style.value} style")
    
    def _initialize_citation_keywords(self) -> Dict[str, List[str]]:
        """Initialize keywords that trigger citation needs"""
        
        return {
            "market_data": [
                "nifty", "sensex", "index", "market cap", "price", "trading volume",
                "market value", "current price", "closing price", "opening price"
            ],
            "financial_news": [
                "announced", "reported", "according to", "stated", "confirmed",
                "revealed", "disclosed", "published", "released"
            ],
            "statistics": [
                "percent", "percentage", "%", "billion", "million", "crore",
                "growth", "decline", "increase", "decrease", "rose by", "fell by"
            ],
            "company_info": [
                "earnings", "revenue", "profit", "quarterly results", "annual results",
                "guidance", "outlook", "management", "ceo", "board"
            ],
            "economic_indicators": [
                "inflation", "gdp", "interest rate", "repo rate", "policy rate",
                "unemployment", "manufacturing", "services", "pmi"
            ],
            "regulatory": [
                "rbi", "sebi", "government", "ministry", "regulation", "policy",
                "rule", "guideline", "circular", "notification"
            ]
        }
    
    def _initialize_info_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Initialize patterns for different information types"""
        
        return {
            "current_price": {
                "pattern": r'(?:trading at|priced at|current price|market price|trading price).*?₹?[\d,]+\.?\d*',
                "confidence": 0.9,
                "requires_citation": True,
                "data_type": "price"
            },
            "percentage_change": {
                "pattern": r'(?:up|down|gained|lost|rose|fell).*?[\d\.]+%',
                "confidence": 0.8,
                "requires_citation": True,
                "data_type": "performance"
            },
            "news_statement": {
                "pattern": r'(?:announced|reported|stated|confirmed|revealed).*?[.!]',
                "confidence": 0.9,
                "requires_citation": True,
                "data_type": "news"
            },
            "financial_figure": {
                "pattern": r'₹[\d,]+(?:\.\d{2})?(?:\s*crore|\s*lakh|\s*billion|\s*million)?',
                "confidence": 0.8,
                "requires_citation": True,
                "data_type": "financial"
            },
            "market_status": {
                "pattern": r'(?:market is|markets are|trading|session).*?(?:open|closed|volatile|bullish|bearish)',
                "confidence": 0.7,
                "requires_citation": True,
                "data_type": "market_status"
            }
        }
    
    def process_search_sources(self, search_results: Dict[str, Any]) -> List[Citation]:
        """Process search results and create citation objects"""
        
        citations = []
        
        # Process organic results
        if "organic" in search_results:
            for i, result in enumerate(search_results["organic"][:8], 1):
                citation = Citation(
                    id=self.citation_counter + i,
                    title=result.get("title", ""),
                    url=result.get("link", ""),
                    source=self._extract_source_name(result.get("link", "")),
                    date=result.get("date", ""),
                    snippet=result.get("snippet", ""),
                    relevance_score=self._calculate_relevance_score(result)
                )
                citations.append(citation)
        
        # Process news results  
        if "news" in search_results:
            for i, news in enumerate(search_results["news"][:5], len(citations) + 1):
                citation = Citation(
                    id=self.citation_counter + i,
                    title=news.get("title", ""),
                    url=news.get("link", ""),
                    source=news.get("source", self._extract_source_name(news.get("link", ""))),
                    date=news.get("date", ""),
                    snippet=news.get("snippet", ""),
                    relevance_score=self._calculate_relevance_score(news, is_news=True)
                )
                citations.append(citation)
        
        # Store citations
        for citation in citations:
            self.citations[citation.id] = citation
        
        self.citation_counter += len(citations)
        
        # Sort by relevance score
        citations.sort(key=lambda x: x.relevance_score, reverse=True)
        
        logger.info(f"Processed {len(citations)} citations from search results")
        return citations
    
    def _extract_source_name(self, url: str) -> str:
        """Extract readable source name from URL"""
        
        domain_mappings = {
            "economictimes.indiatimes.com": "Economic Times",
            "business-standard.com": "Business Standard", 
            "livemint.com": "LiveMint",
            "moneycontrol.com": "Moneycontrol",
            "zeebiz.com": "Zee Business",
            "financialexpress.com": "Financial Express",
            "thehindubusinessline.com": "The Hindu BusinessLine",
            "reuters.com": "Reuters",
            "bloomberg.com": "Bloomberg",
            "cnbc.com": "CNBC",
            "rbi.org.in": "Reserve Bank of India",
            "nseindia.com": "NSE India",
            "bseindia.com": "BSE India"
        }
        
        for domain, name in domain_mappings.items():
            if domain in url:
                return name
        
        # Extract domain name as fallback
        try:
            domain = url.split("//")[1].split("/")[0]
            return domain.replace("www.", "").replace(".com", "").title()
        except:
            return "Web Source"
    
    def _calculate_relevance_score(self, result: Dict[str, Any], is_news: bool = False) -> float:
        """Calculate relevance score for a search result"""
        
        score = 0.5  # Base score
        
        title = result.get("title", "").lower()
        snippet = result.get("snippet", "").lower()
        content = f"{title} {snippet}"
        
        # Boost for financial keywords
        financial_keywords = ["stock", "market", "nifty", "sensex", "investment", "trading", "price"]
        score += 0.1 * sum(1 for keyword in financial_keywords if keyword in content)
        
        # Boost for recent dates
        date = result.get("date", "")
        if date:
            # Boost recent content (simplified)
            if "hour" in date or "minute" in date or "today" in date:
                score += 0.3
            elif "day" in date or "yesterday" in date:
                score += 0.2
        
        # Boost for news sources
        if is_news:
            score += 0.2
        
        # Boost for authoritative sources
        url = result.get("link", "")
        authoritative_domains = ["rbi.org", "sebi.gov", "nseindia.com", "bseindia.com"]
        if any(domain in url for domain in authoritative_domains):
            score += 0.3
        
        return min(1.0, score)
    
    def add_inline_citations(self, ai_response: str, citations: List[Citation]) -> str:
        """Add inline citations to AI response text"""
        
        if not citations:
            return ai_response
        
        # Create search context from citations
        search_context = self._build_search_context(citations)
        
        # Find citation opportunities in the response
        citation_opportunities = self._find_citation_opportunities(ai_response, search_context)
        
        # Add citations in order of importance
        modified_response = ai_response
        citation_map = {}  # Track which citations are used
        
        for opportunity in citation_opportunities:
            best_citation = self._find_best_citation_for_context(opportunity, citations, citation_map)
            if best_citation:
                citation_text = self._format_inline_citation(best_citation, opportunity)
                modified_response = self._insert_citation_at_position(
                    modified_response, opportunity, citation_text
                )
                citation_map[best_citation.id] = True
                best_citation.used_in_response = True
        
        # Add source list at the end
        used_citations = [c for c in citations if c.used_in_response]
        if used_citations:
            modified_response += "\n\n" + self._format_source_list(used_citations)
        
        logger.info(f"Added {len(used_citations)} inline citations to response")
        return modified_response
    
    def _build_search_context(self, citations: List[Citation]) -> Dict[str, Any]:
        """Build context from search citations"""
        
        all_content = ""
        topics = set()
        
        for citation in citations:
            content = f"{citation.title} {citation.snippet or ''}"
            all_content += content.lower() + " "
            
            # Extract topics
            for category, keywords in self.citation_keywords.items():
                if any(keyword in content.lower() for keyword in keywords):
                    topics.add(category)
        
        return {
            "content": all_content,
            "topics": list(topics),
            "citation_count": len(citations)
        }
    
    def _find_citation_opportunities(self, response: str, search_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find places in response where citations would be valuable"""
        
        opportunities = []
        
        # Find sentences that match information patterns
        sentences = re.split(r'[.!?]+', response)
        
        for i, sentence in enumerate(sentences):
            if not sentence.strip():
                continue
                
            for pattern_name, pattern_info in self.info_patterns.items():
                if re.search(pattern_info["pattern"], sentence, re.IGNORECASE):
                    opportunity = {
                        "sentence": sentence.strip(),
                        "sentence_index": i,
                        "pattern": pattern_name,
                        "confidence": pattern_info["confidence"],
                        "data_type": pattern_info["data_type"],
                        "requires_citation": pattern_info["requires_citation"],
                        "position": response.find(sentence.strip())
                    }
                    opportunities.append(opportunity)
        
        # Sort by confidence and importance
        opportunities.sort(key=lambda x: x["confidence"], reverse=True)
        
        return opportunities[:5]  # Limit to top 5 opportunities
    
    def _find_best_citation_for_context(self, opportunity: Dict[str, Any], 
                                      citations: List[Citation],
                                      used_citations: Dict[int, bool]) -> Optional[Citation]:
        """Find the best citation for a specific context"""
        
        sentence = opportunity["sentence"].lower()
        data_type = opportunity["data_type"]
        
        best_citation = None
        best_score = 0.0
        
        for citation in citations:
            if citation.id in used_citations:
                continue  # Skip already used citations
            
            score = citation.relevance_score
            
            # Boost score based on content match
            citation_content = f"{citation.title} {citation.snippet or ''}".lower()
            
            # Check for keyword overlap
            sentence_words = set(re.findall(r'\b\w+\b', sentence))
            citation_words = set(re.findall(r'\b\w+\b', citation_content))
            overlap = len(sentence_words.intersection(citation_words))
            score += overlap * 0.05
            
            # Boost for data type relevance
            if data_type == "price" and any(word in citation_content for word in ["price", "trading", "market"]):
                score += 0.2
            elif data_type == "news" and any(word in citation_content for word in ["announced", "reported", "stated"]):
                score += 0.2
            elif data_type == "performance" and any(word in citation_content for word in ["gain", "loss", "up", "down"]):
                score += 0.2
            
            # Prefer recent sources
            if citation.date and ("hour" in citation.date or "today" in citation.date):
                score += 0.1
            
            if score > best_score:
                best_score = score
                best_citation = citation
        
        return best_citation if best_score > 0.3 else None
    
    def _format_inline_citation(self, citation: Citation, opportunity: Dict[str, Any]) -> str:
        """Format citation for inline placement"""
        
        if self.citation_style == CitationStyle.NUMBERED:
            return f" [{citation.id}]"
        
        elif self.citation_style == CitationStyle.BRACKETED:
            date_str = f", {citation.date}" if citation.date else ""
            return f" (Source: {citation.source}{date_str})"
        
        elif self.citation_style == CitationStyle.INLINE:
            return f", according to {citation.source}"
        
        elif self.citation_style == CitationStyle.SUPERSCRIPT:
            superscript_map = {1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹"}
            sup_num = superscript_map.get(citation.id, str(citation.id))
            return f"{sup_num}"
        
        return f" [{citation.id}]"  # Fallback
    
    def _insert_citation_at_position(self, response: str, opportunity: Dict[str, Any], citation_text: str) -> str:
        """Insert citation at the appropriate position"""
        
        sentence = opportunity["sentence"]
        sentence_end = opportunity["position"] + len(sentence)
        
        # Insert citation at end of sentence, before punctuation if present
        if sentence_end < len(response) and response[sentence_end] in '.!?':
            return response[:sentence_end] + citation_text + response[sentence_end:]
        else:
            return response[:sentence_end] + citation_text + response[sentence_end:]
    
    def _format_source_list(self, citations: List[Citation]) -> str:
        """Format the source list at the end of response"""
        
        if self.citation_style == CitationStyle.NUMBERED:
            sources = "**Sources:**\n"
            for citation in sorted(citations, key=lambda x: x.id):
                date_str = f" ({citation.date})" if citation.date else ""
                sources += f"[{citation.id}] [{citation.title}]({citation.url}){date_str}\n"
            return sources
        
        elif self.citation_style in [CitationStyle.BRACKETED, CitationStyle.INLINE, CitationStyle.SUPERSCRIPT]:
            sources = "**Sources:**\n"
            for citation in citations:
                date_str = f" - {citation.date}" if citation.date else ""
                sources += f"• [{citation.title}]({citation.url}){date_str}\n"
            return sources
        
        return ""
    
    def get_citation_summary(self) -> Dict[str, Any]:
        """Get summary of citation usage"""
        
        total_citations = len(self.citations)
        used_citations = sum(1 for c in self.citations.values() if c.used_in_response)
        
        return {
            "total_citations": total_citations,
            "used_citations": used_citations,
            "citation_style": self.citation_style.value,
            "usage_rate": used_citations / total_citations if total_citations > 0 else 0
        }
    
    def clear_citations(self):
        """Clear all stored citations"""
        
        self.citations.clear()
        self.citation_counter = 0
        logger.info("Citations cleared")
    
    def update_citation_style(self, new_style: CitationStyle):
        """Update citation style"""
        
        self.citation_style = new_style
        logger.info(f"Citation style updated to: {new_style.value}")
    
    def get_unused_sources(self) -> List[Citation]:
        """Get citations that weren't used in the response"""
        
        return [c for c in self.citations.values() if not c.used_in_response]