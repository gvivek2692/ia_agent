"""
Holdings-News Correlation Engine - Intelligent connection between user holdings and market news
Analyzes portfolio stocks/funds and correlates with relevant news, sector trends, and market events
"""

import logging
import re
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from services.web_search_service import WebSearchService

logger = logging.getLogger(__name__)


class NewsRelevance(Enum):
    """Relevance levels for news correlation"""
    CRITICAL = "critical"  # Direct impact on holding (company-specific news)
    HIGH = "high"          # Sector/industry impact
    MEDIUM = "medium"      # Market/economic impact
    LOW = "low"           # General market news
    MINIMAL = "minimal"   # Barely relevant


class NewsImpactType(Enum):
    """Types of news impact"""
    EARNINGS = "earnings"
    MANAGEMENT = "management"
    PRODUCT_LAUNCH = "product_launch"
    REGULATORY = "regulatory"
    SECTOR_TREND = "sector_trend"
    MARKET_SENTIMENT = "market_sentiment"
    ECONOMIC_INDICATOR = "economic_indicator"
    COMPETITOR_NEWS = "competitor_news"
    PARTNERSHIP = "partnership"
    ACQUISITION = "acquisition"


@dataclass
class HoldingProfile:
    """Profile of a user's holding for news correlation"""
    symbol: str
    company_name: str
    sector: str
    market_cap: str  # large, mid, small
    weight_in_portfolio: float  # percentage
    current_value: float
    gain_loss_percentage: float
    holding_type: str  # stock, mutual_fund
    is_top_holding: bool


@dataclass
class NewsCorrelation:
    """Correlation between news and user holdings"""
    holding: HoldingProfile
    news_title: str
    news_snippet: str
    news_url: str
    news_source: str
    news_date: Optional[str]
    relevance: NewsRelevance
    impact_type: NewsImpactType
    correlation_score: float
    impact_direction: str  # positive, negative, neutral
    reasoning: str


class HoldingsNewsCorrelator:
    """Intelligent correlation engine for holdings and market news"""
    
    def __init__(self):
        self.web_search = WebSearchService()
        self.sector_mappings = self._initialize_sector_mappings()
        self.company_aliases = self._initialize_company_aliases()
        self.impact_keywords = self._initialize_impact_keywords()
        self.competitor_groups = self._initialize_competitor_groups()
        
        logger.info("Holdings-News Correlation Engine initialized")
    
    def _initialize_sector_mappings(self) -> Dict[str, Dict[str, Any]]:
        """Initialize sector mappings and characteristics"""
        
        return {
            "information_technology": {
                "keywords": ["tech", "software", "it services", "digital", "cloud", "ai", "automation"],
                "companies": ["infy", "tcs", "wipro", "hcl", "mindtree", "tech mahindra"],
                "indices": ["nifty it", "cnx it"],
                "cyclical": False,
                "growth_sensitive": True
            },
            "banking": {
                "keywords": ["bank", "lending", "credit", "npa", "deposits", "interest rates"],
                "companies": ["hdfc", "icici", "sbi", "axis", "kotak", "indusind"],
                "indices": ["bank nifty", "cnx bank"],
                "cyclical": True,
                "interest_rate_sensitive": True
            },
            "pharmaceuticals": {
                "keywords": ["pharma", "drugs", "healthcare", "medicine", "fda", "clinical trials"],
                "companies": ["sun pharma", "dr reddy", "cipla", "lupin", "aurobindo"],
                "indices": ["cnx pharma"],
                "defensive": True,
                "regulatory_sensitive": True
            },
            "automobile": {
                "keywords": ["auto", "car", "vehicle", "ev", "electric vehicle", "mobility"],
                "companies": ["maruti", "tata motors", "bajaj auto", "hero motocorp", "mahindra"],
                "indices": ["cnx auto"],
                "cyclical": True,
                "commodity_sensitive": True
            },
            "fmcg": {
                "keywords": ["fmcg", "consumer goods", "rural demand", "consumption"],
                "companies": ["hindustan unilever", "itc", "nestle", "britannia", "godrej"],
                "indices": ["cnx fmcg"],
                "defensive": True,
                "rural_sensitive": True
            },
            "energy": {
                "keywords": ["oil", "gas", "refining", "crude", "energy", "renewable"],
                "companies": ["reliance", "ongc", "ioc", "bpcl", "ntpc", "power grid"],
                "indices": ["cnx energy"],
                "commodity_sensitive": True,
                "cyclical": True
            },
            "financial_services": {
                "keywords": ["nbfc", "financial services", "lending", "insurance", "mutual fund"],
                "companies": ["bajaj finance", "hdfc amc", "sbi life", "icici prudential"],
                "indices": ["nifty financial services"],
                "interest_rate_sensitive": True,
                "cyclical": True
            }
        }
    
    def _initialize_company_aliases(self) -> Dict[str, List[str]]:
        """Initialize company name aliases and variations"""
        
        return {
            "infy": ["infosys", "infy", "infosys limited"],
            "tcs": ["tata consultancy services", "tcs", "tata consultancy"],
            "reliance": ["reliance industries", "ril", "reliance", "jio"],
            "hdfc": ["hdfc bank", "hdfc", "housing development finance"],
            "icici": ["icici bank", "icici", "industrial credit"],
            "wipro": ["wipro limited", "wipro", "wipro ltd"],
            "sbi": ["state bank of india", "sbi", "state bank"],
            "maruti": ["maruti suzuki", "maruti", "msil"],
            "bharti": ["bharti airtel", "airtel", "bharti"],
            "itc": ["itc limited", "itc", "indian tobacco"]
        }
    
    def _initialize_impact_keywords(self) -> Dict[NewsImpactType, Dict[str, Any]]:
        """Initialize keywords for different impact types"""
        
        return {
            NewsImpactType.EARNINGS: {
                "keywords": ["earnings", "results", "profit", "revenue", "quarterly", "q1", "q2", "q3", "q4", "guidance"],
                "relevance_boost": 0.4,
                "time_sensitivity": "high"
            },
            NewsImpactType.MANAGEMENT: {
                "keywords": ["ceo", "cfo", "management", "board", "director", "leadership", "appointment", "resignation"],
                "relevance_boost": 0.3,
                "time_sensitivity": "medium"
            },
            NewsImpactType.PRODUCT_LAUNCH: {
                "keywords": ["launch", "product", "service", "platform", "solution", "innovation"],
                "relevance_boost": 0.2,
                "time_sensitivity": "medium"
            },
            NewsImpactType.REGULATORY: {
                "keywords": ["regulation", "compliance", "rbi", "sebi", "government", "policy", "rule"],
                "relevance_boost": 0.3,
                "time_sensitivity": "high"
            },
            NewsImpactType.SECTOR_TREND: {
                "keywords": ["sector", "industry", "trend", "outlook", "forecast"],
                "relevance_boost": 0.2,
                "time_sensitivity": "low"
            },
            NewsImpactType.PARTNERSHIP: {
                "keywords": ["partnership", "alliance", "collaboration", "joint venture", "tie-up"],
                "relevance_boost": 0.2,
                "time_sensitivity": "medium"
            },
            NewsImpactType.ACQUISITION: {
                "keywords": ["acquisition", "merger", "buyout", "takeover", "deal"],
                "relevance_boost": 0.4,
                "time_sensitivity": "high"
            }
        }
    
    def _initialize_competitor_groups(self) -> Dict[str, List[str]]:
        """Initialize competitor groupings"""
        
        return {
            "it_services": ["infy", "tcs", "wipro", "hcl", "tech mahindra"],
            "private_banks": ["hdfc", "icici", "axis", "kotak", "indusind"],
            "telecom": ["bharti", "jio", "vodafone idea"],
            "auto_2wheelers": ["bajaj auto", "hero motocorp", "tvs motor"],
            "auto_4wheelers": ["maruti", "tata motors", "mahindra"],
            "pharma_large": ["sun pharma", "dr reddy", "cipla", "lupin"],
            "oil_gas": ["reliance", "ongc", "ioc", "bpcl"]
        }
    
    def create_holding_profiles(self, user_portfolio: Dict[str, Any]) -> List[HoldingProfile]:
        """Create detailed profiles for user's holdings"""
        
        profiles = []
        
        # Process stocks
        stocks = user_portfolio.get('stocks', [])
        total_portfolio_value = user_portfolio.get('summary', {}).get('total_current_value', 0)
        
        for i, stock in enumerate(stocks):
            if not isinstance(stock, dict):
                continue
                
            symbol = stock.get('symbol', '').lower()
            current_value = stock.get('current_value', 0)
            
            profile = HoldingProfile(
                symbol=symbol,
                company_name=stock.get('company_name', symbol.upper()),
                sector=self._determine_sector(symbol),
                market_cap=self._determine_market_cap(symbol),
                weight_in_portfolio=(current_value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0,
                current_value=current_value,
                gain_loss_percentage=stock.get('gain_loss_percentage', 0),
                holding_type="stock",
                is_top_holding=(i < 3)  # Top 3 holdings
            )
            profiles.append(profile)
        
        # Process mutual funds
        mutual_funds = user_portfolio.get('mutual_funds', [])
        for i, mf in enumerate(mutual_funds):
            if not isinstance(mf, dict):
                continue
                
            current_value = mf.get('current_value', 0)
            scheme_name = mf.get('scheme_name', '')
            
            profile = HoldingProfile(
                symbol=scheme_name.lower(),
                company_name=scheme_name,
                sector=self._determine_mf_category(scheme_name),
                market_cap="diversified",
                weight_in_portfolio=(current_value / total_portfolio_value * 100) if total_portfolio_value > 0 else 0,
                current_value=current_value,
                gain_loss_percentage=mf.get('gain_loss_percentage', 0),
                holding_type="mutual_fund",
                is_top_holding=(i < 2)  # Top 2 MF holdings
            )
            profiles.append(profile)
        
        # Sort by portfolio weight
        profiles.sort(key=lambda x: x.weight_in_portfolio, reverse=True)
        
        logger.info(f"Created {len(profiles)} holding profiles")
        return profiles
    
    def _determine_sector(self, symbol: str) -> str:
        """Determine sector for a stock symbol"""
        
        symbol_lower = symbol.lower()
        
        for sector, data in self.sector_mappings.items():
            if symbol_lower in data.get('companies', []):
                return sector
        
        # Default mapping based on common symbols
        sector_map = {
            'infy': 'information_technology', 'tcs': 'information_technology',
            'wipro': 'information_technology', 'hcl': 'information_technology',
            'hdfc': 'banking', 'icici': 'banking', 'sbi': 'banking',
            'reliance': 'energy', 'ongc': 'energy',
            'maruti': 'automobile', 'bajaj': 'automobile',
            'itc': 'fmcg', 'hindustan': 'fmcg'
        }
        
        for key, sector in sector_map.items():
            if key in symbol_lower:
                return sector
        
        return 'diversified'
    
    def _determine_market_cap(self, symbol: str) -> str:
        """Determine market cap category"""
        
        # Large cap companies (simplified mapping)
        large_cap = ['infy', 'tcs', 'reliance', 'hdfc', 'icici', 'sbi', 'bharti', 'itc', 'maruti']
        mid_cap = ['wipro', 'tech mahindra', 'bajaj finance', 'godrej']
        
        symbol_lower = symbol.lower()
        
        if any(comp in symbol_lower for comp in large_cap):
            return 'large'
        elif any(comp in symbol_lower for comp in mid_cap):
            return 'mid'
        else:
            return 'small'
    
    def _determine_mf_category(self, scheme_name: str) -> str:
        """Determine mutual fund category"""
        
        name_lower = scheme_name.lower()
        
        if any(word in name_lower for word in ['equity', 'growth', 'dividend']):
            return 'equity_fund'
        elif any(word in name_lower for word in ['debt', 'bond', 'income']):
            return 'debt_fund'
        elif any(word in name_lower for word in ['balanced', 'hybrid']):
            return 'hybrid_fund'
        else:
            return 'equity_fund'  # Default
    
    async def correlate_holdings_with_news(self, holding_profiles: List[HoldingProfile],
                                         search_scope: str = "comprehensive") -> List[NewsCorrelation]:
        """Correlate user holdings with relevant market news"""
        
        correlations = []
        
        # Group holdings by sector for efficient searching
        sector_holdings = {}
        for profile in holding_profiles:
            if profile.sector not in sector_holdings:
                sector_holdings[profile.sector] = []
            sector_holdings[profile.sector].append(profile)
        
        # Search for news by different strategies
        search_strategies = [
            "company_specific",  # Direct company news
            "sector_trends",     # Sector-wide news
            "competitor_analysis",  # Competitor news
            "regulatory_updates"    # Regulatory news affecting sectors
        ]
        
        for strategy in search_strategies:
            if search_scope == "focused" and strategy not in ["company_specific", "sector_trends"]:
                continue
                
            strategy_correlations = await self._execute_search_strategy(
                strategy, holding_profiles, sector_holdings
            )
            correlations.extend(strategy_correlations)
        
        # Remove duplicates and rank by relevance
        unique_correlations = self._deduplicate_correlations(correlations)
        ranked_correlations = self._rank_correlations(unique_correlations)
        
        logger.info(f"Generated {len(ranked_correlations)} news correlations using {search_scope} scope")
        return ranked_correlations[:15]  # Return top 15 correlations
    
    async def _execute_search_strategy(self, strategy: str, holdings: List[HoldingProfile],
                                     sector_holdings: Dict[str, List[HoldingProfile]]) -> List[NewsCorrelation]:
        """Execute a specific search strategy"""
        
        correlations = []
        
        if strategy == "company_specific":
            # Search for direct company news
            for holding in holdings[:8]:  # Focus on top holdings
                if holding.holding_type == "stock":
                    company_correlations = await self._search_company_news(holding)
                    correlations.extend(company_correlations)
        
        elif strategy == "sector_trends":
            # Search for sector-wide trends
            for sector, sector_holdings_list in sector_holdings.items():
                if sector == 'diversified':
                    continue
                    
                sector_correlations = await self._search_sector_news(sector, sector_holdings_list)
                correlations.extend(sector_correlations)
        
        elif strategy == "competitor_analysis":
            # Search for competitor news that might impact holdings
            for holding in holdings[:5]:  # Top 5 holdings
                if holding.holding_type == "stock":
                    competitor_correlations = await self._search_competitor_news(holding)
                    correlations.extend(competitor_correlations)
        
        elif strategy == "regulatory_updates":
            # Search for regulatory news
            regulatory_correlations = await self._search_regulatory_news(holdings)
            correlations.extend(regulatory_correlations)
        
        return correlations
    
    async def _search_company_news(self, holding: HoldingProfile) -> List[NewsCorrelation]:
        """Search for company-specific news"""
        
        # Generate search queries for the company
        company_aliases = self.company_aliases.get(holding.symbol, [holding.company_name])
        
        search_queries = []
        for alias in company_aliases[:2]:  # Use top 2 aliases
            search_queries.extend([
                f"{alias} earnings results India stock market",
                f"{alias} news today India market analysis",
                f"{alias} stock price target recommendation India"
            ])
        
        correlations = []
        
        for query in search_queries[:3]:  # Limit to 3 searches per company
            try:
                search_results = await self.web_search.search(query, {
                    "location": "India",
                    "num": 5
                })
                
                if "error" not in search_results:
                    query_correlations = self._process_search_results(
                        search_results, holding, NewsRelevance.CRITICAL
                    )
                    correlations.extend(query_correlations)
                    
            except Exception as e:
                logger.error(f"Error searching for {holding.symbol} news: {str(e)}")
        
        return correlations
    
    async def _search_sector_news(self, sector: str, holdings: List[HoldingProfile]) -> List[NewsCorrelation]:
        """Search for sector-wide news"""
        
        sector_info = self.sector_mappings.get(sector, {})
        sector_keywords = sector_info.get('keywords', [sector.replace('_', ' ')])
        
        # Create sector-focused search queries
        search_queries = [
            f"{sector.replace('_', ' ')} sector India outlook performance",
            f"{sector_keywords[0] if sector_keywords else sector} industry news India market",
            f"India {sector.replace('_', ' ')} stocks analysis trend"
        ]
        
        correlations = []
        
        for query in search_queries:
            try:
                search_results = await self.web_search.search(query, {
                    "location": "India",
                    "num": 4
                })
                
                if "error" not in search_results:
                    for holding in holdings:
                        query_correlations = self._process_search_results(
                            search_results, holding, NewsRelevance.HIGH
                        )
                        correlations.extend(query_correlations)
                        
            except Exception as e:
                logger.error(f"Error searching for {sector} sector news: {str(e)}")
        
        return correlations
    
    async def _search_competitor_news(self, holding: HoldingProfile) -> List[NewsCorrelation]:
        """Search for competitor news that might impact the holding"""
        
        # Find competitor group
        competitors = []
        for group_name, group_companies in self.competitor_groups.items():
            if holding.symbol in group_companies:
                competitors = [comp for comp in group_companies if comp != holding.symbol]
                break
        
        if not competitors:
            return []
        
        correlations = []
        
        # Search for competitor news
        for competitor in competitors[:2]:  # Top 2 competitors
            query = f"{competitor} vs {holding.symbol} India market comparison news"
            
            try:
                search_results = await self.web_search.search(query, {
                    "location": "India", 
                    "num": 3
                })
                
                if "error" not in search_results:
                    query_correlations = self._process_search_results(
                        search_results, holding, NewsRelevance.MEDIUM,
                        impact_type=NewsImpactType.COMPETITOR_NEWS
                    )
                    correlations.extend(query_correlations)
                    
            except Exception as e:
                logger.error(f"Error searching competitor news for {holding.symbol}: {str(e)}")
        
        return correlations
    
    async def _search_regulatory_news(self, holdings: List[HoldingProfile]) -> List[NewsCorrelation]:
        """Search for regulatory news affecting holdings"""
        
        # Get unique sectors from holdings
        sectors = list(set(h.sector for h in holdings if h.sector != 'diversified'))
        
        correlations = []
        
        # Search for regulatory news by sector
        for sector in sectors[:3]:  # Limit to top 3 sectors
            sector_name = sector.replace('_', ' ')
            query = f"India {sector_name} regulation policy RBI SEBI government impact"
            
            try:
                search_results = await self.web_search.search(query, {
                    "location": "India",
                    "num": 4
                })
                
                if "error" not in search_results:
                    # Apply to all holdings in this sector
                    sector_holdings = [h for h in holdings if h.sector == sector]
                    
                    for holding in sector_holdings:
                        query_correlations = self._process_search_results(
                            search_results, holding, NewsRelevance.HIGH,
                            impact_type=NewsImpactType.REGULATORY
                        )
                        correlations.extend(query_correlations)
                        
            except Exception as e:
                logger.error(f"Error searching regulatory news for {sector}: {str(e)}")
        
        return correlations
    
    def _process_search_results(self, search_results: Dict[str, Any], holding: HoldingProfile,
                               base_relevance: NewsRelevance,
                               impact_type: Optional[NewsImpactType] = None) -> List[NewsCorrelation]:
        """Process search results into news correlations"""
        
        correlations = []
        
        # Process organic results
        for result in search_results.get("organic", [])[:3]:
            correlation = self._create_correlation(
                result, holding, base_relevance, impact_type
            )
            if correlation:
                correlations.append(correlation)
        
        # Process news results
        for news in search_results.get("news", [])[:2]:
            correlation = self._create_correlation(
                news, holding, base_relevance, impact_type, is_news=True
            )
            if correlation:
                correlations.append(correlation)
        
        return correlations
    
    def _create_correlation(self, result: Dict[str, Any], holding: HoldingProfile,
                           base_relevance: NewsRelevance,
                           impact_type: Optional[NewsImpactType] = None,
                           is_news: bool = False) -> Optional[NewsCorrelation]:
        """Create a news correlation from search result"""
        
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        url = result.get("link", "")
        source = result.get("source", "") if is_news else self._extract_source_name(url)
        date = result.get("date", "")
        
        # Calculate correlation score
        correlation_score = self._calculate_correlation_score(
            title, snippet, holding, base_relevance, impact_type
        )
        
        if correlation_score < 0.3:  # Minimum threshold
            return None
        
        # Determine impact type if not specified
        if not impact_type:
            impact_type = self._detect_impact_type(title, snippet)
        
        # Determine impact direction
        impact_direction = self._determine_impact_direction(title, snippet, impact_type)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(holding, title, impact_type, impact_direction)
        
        return NewsCorrelation(
            holding=holding,
            news_title=title,
            news_snippet=snippet,
            news_url=url,
            news_source=source,
            news_date=date,
            relevance=base_relevance,
            impact_type=impact_type,
            correlation_score=correlation_score,
            impact_direction=impact_direction,
            reasoning=reasoning
        )
    
    def _calculate_correlation_score(self, title: str, snippet: str, holding: HoldingProfile,
                                   base_relevance: NewsRelevance,
                                   impact_type: Optional[NewsImpactType] = None) -> float:
        """Calculate correlation score between news and holding"""
        
        content = f"{title} {snippet}".lower()
        score = 0.0
        
        # Base relevance score
        relevance_scores = {
            NewsRelevance.CRITICAL: 0.8,
            NewsRelevance.HIGH: 0.6,
            NewsRelevance.MEDIUM: 0.4,
            NewsRelevance.LOW: 0.2,
            NewsRelevance.MINIMAL: 0.1
        }
        score += relevance_scores.get(base_relevance, 0.4)
        
        # Direct company mention boost
        company_aliases = self.company_aliases.get(holding.symbol, [holding.company_name])
        for alias in company_aliases:
            if alias.lower() in content:
                score += 0.3
                break
        
        # Sector relevance boost
        sector_info = self.sector_mappings.get(holding.sector, {})
        sector_keywords = sector_info.get('keywords', [])
        for keyword in sector_keywords:
            if keyword in content:
                score += 0.1
                break
        
        # Impact type boost
        if impact_type:
            impact_info = self.impact_keywords.get(impact_type, {})
            relevance_boost = impact_info.get('relevance_boost', 0.0)
            score += relevance_boost
        
        # Portfolio weight boost (higher weight = more relevant)
        if holding.weight_in_portfolio > 10:  # Significant holding
            score += 0.1
        
        # Recent news boost
        if "today" in content or "latest" in content or "breaking" in content:
            score += 0.1
        
        return min(1.0, score)
    
    def _detect_impact_type(self, title: str, snippet: str) -> NewsImpactType:
        """Detect the type of impact from news content"""
        
        content = f"{title} {snippet}".lower()
        
        # Check each impact type
        for impact_type, data in self.impact_keywords.items():
            keywords = data.get('keywords', [])
            if any(keyword in content for keyword in keywords):
                return impact_type
        
        return NewsImpactType.MARKET_SENTIMENT  # Default
    
    def _determine_impact_direction(self, title: str, snippet: str, 
                                  impact_type: NewsImpactType) -> str:
        """Determine if news impact is positive, negative, or neutral"""
        
        content = f"{title} {snippet}".lower()
        
        # Positive indicators
        positive_words = [
            "growth", "profit", "gain", "increase", "rise", "up", "strong", "beat",
            "upgrade", "positive", "bullish", "outperform", "expansion", "launch"
        ]
        
        # Negative indicators
        negative_words = [
            "loss", "decline", "fall", "down", "weak", "miss", "cut", "downgrade",
            "negative", "bearish", "underperform", "concern", "risk", "problem"
        ]
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _generate_reasoning(self, holding: HoldingProfile, news_title: str,
                          impact_type: NewsImpactType, impact_direction: str) -> str:
        """Generate reasoning for the correlation"""
        
        company = holding.company_name
        impact_desc = impact_type.value.replace('_', ' ').title()
        direction_desc = impact_direction.capitalize()
        
        reasoning_templates = {
            NewsImpactType.EARNINGS: f"{direction_desc} earnings news for {company} may impact your {holding.weight_in_portfolio:.1f}% portfolio allocation",
            NewsImpactType.SECTOR_TREND: f"{direction_desc} sector trends in {holding.sector.replace('_', ' ')} may affect {company} performance",
            NewsImpactType.REGULATORY: f"Regulatory changes could have {impact_direction} implications for {company} in your portfolio",
            NewsImpactType.COMPETITOR_NEWS: f"Competitor developments may create {impact_direction} spillover effects for {company}",
            NewsImpactType.MANAGEMENT: f"Management changes at {company} could influence your holding's performance"
        }
        
        return reasoning_templates.get(impact_type, 
                                     f"{impact_desc} news may have {impact_direction} implications for your {company} holding")
    
    def _extract_source_name(self, url: str) -> str:
        """Extract readable source name from URL"""
        
        try:
            domain = url.split("//")[1].split("/")[0]
            return domain.replace("www.", "").split(".")[0].title()
        except:
            return "News Source"
    
    def _deduplicate_correlations(self, correlations: List[NewsCorrelation]) -> List[NewsCorrelation]:
        """Remove duplicate news correlations"""
        
        seen_urls = set()
        unique_correlations = []
        
        for correlation in correlations:
            if correlation.news_url not in seen_urls:
                unique_correlations.append(correlation)
                seen_urls.add(correlation.news_url)
        
        return unique_correlations
    
    def _rank_correlations(self, correlations: List[NewsCorrelation]) -> List[NewsCorrelation]:
        """Rank correlations by relevance and importance"""
        
        def ranking_score(corr):
            base_score = corr.correlation_score
            
            # Boost for top holdings
            if corr.holding.is_top_holding:
                base_score += 0.2
            
            # Boost for high-impact news types
            if corr.impact_type in [NewsImpactType.EARNINGS, NewsImpactType.ACQUISITION]:
                base_score += 0.1
            
            # Boost for significant portfolio weight
            base_score += min(0.2, corr.holding.weight_in_portfolio / 50)
            
            # Boost for recent news (simplified)
            if corr.news_date and ("hour" in corr.news_date or "today" in corr.news_date):
                base_score += 0.1
                
            return base_score
        
        correlations.sort(key=ranking_score, reverse=True)
        return correlations
    
    def generate_correlation_summary(self, correlations: List[NewsCorrelation]) -> Dict[str, Any]:
        """Generate a summary of news correlations"""
        
        if not correlations:
            return {"total_correlations": 0}
        
        # Group by holding
        holdings_impact = {}
        for corr in correlations:
            symbol = corr.holding.symbol
            if symbol not in holdings_impact:
                holdings_impact[symbol] = {
                    "company": corr.holding.company_name,
                    "weight": corr.holding.weight_in_portfolio,
                    "positive_news": 0,
                    "negative_news": 0,
                    "neutral_news": 0,
                    "high_impact_count": 0
                }
            
            # Count impact directions
            if corr.impact_direction == "positive":
                holdings_impact[symbol]["positive_news"] += 1
            elif corr.impact_direction == "negative":
                holdings_impact[symbol]["negative_news"] += 1
            else:
                holdings_impact[symbol]["neutral_news"] += 1
            
            # Count high impact news
            if corr.relevance in [NewsRelevance.CRITICAL, NewsRelevance.HIGH]:
                holdings_impact[symbol]["high_impact_count"] += 1
        
        return {
            "total_correlations": len(correlations),
            "holdings_impact": holdings_impact,
            "top_correlation": {
                "holding": correlations[0].holding.company_name,
                "news": correlations[0].news_title,
                "impact": correlations[0].impact_direction,
                "relevance": correlations[0].relevance.value
            } if correlations else None
        }