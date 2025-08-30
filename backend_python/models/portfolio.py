"""
Portfolio and investment data models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class RecommendationType(str, Enum):
    ADD = "add"
    REDUCE = "reduce"
    REBALANCE = "rebalance"
    DIVERSIFY = "diversify"
    OPTIMIZE = "optimize"


class RecommendationPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PortfolioRecommendation(BaseModel):
    id: str
    type: RecommendationType
    title: str
    description: str
    priority: RecommendationPriority
    impact_score: float
    timeframe: str
    reasoning: List[str]
    risk_level: RiskLevel
    current_allocation: Optional[float] = None
    recommended_allocation: Optional[float] = None
    amount_suggestion: Optional[float] = None


class MarketData(BaseModel):
    symbol: str
    current_price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None


class SectorAnalysis(BaseModel):
    sector: str
    allocation_percentage: float
    performance: float
    recommendation: str
    risk_level: RiskLevel


class RiskMetrics(BaseModel):
    portfolio_volatility: float
    sharpe_ratio: float
    beta: float
    max_drawdown: float
    var_95: float  # Value at Risk 95%
    risk_score: int  # 1-100


class PerformanceMetrics(BaseModel):
    total_return: float
    annualized_return: float
    ytd_return: float
    monthly_return: float
    benchmark_comparison: float
    alpha: float
    tracking_error: float


class AIInsight(BaseModel):
    id: str
    title: str
    description: str
    category: str  # 'performance', 'risk', 'opportunity', 'warning'
    impact_level: str  # 'high', 'medium', 'low'
    actionable: bool
    recommendation: Optional[str] = None
    data_points: Dict[str, Any] = {}


class MarketAnalysis(BaseModel):
    market_sentiment: str
    nifty_50: MarketData
    sensex: MarketData
    sector_performance: List[SectorAnalysis]
    key_news: List[Dict[str, str]]
    portfolio_impact: Dict[str, float]


class PortfolioAnalysis(BaseModel):
    performance_metrics: PerformanceMetrics
    risk_metrics: RiskMetrics
    asset_allocation: Dict[str, float]
    sector_allocation: Dict[str, float]
    recommendations: List[PortfolioRecommendation]
    ai_insights: List[AIInsight]
    market_analysis: MarketAnalysis
    updated_at: datetime


class KiteHolding(BaseModel):
    tradingsymbol: str
    instrument_token: int
    isin: str
    product: str
    price: float
    quantity: int
    used_quantity: int
    realised_quantity: int
    t1_quantity: int
    average_price: float
    last_price: float
    pnl: float
    day_change: float
    day_change_percentage: float


class KiteMFHolding(BaseModel):
    folio: str
    fund: str
    tradingsymbol: str
    average_price: float
    last_price: float
    pnl: float
    pledged_quantity: int
    quantity: float


class UploadRequest(BaseModel):
    username: str
    password: str
    pdf_password: Optional[str] = None


class UploadResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    portfolio: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    code: Optional[str] = None