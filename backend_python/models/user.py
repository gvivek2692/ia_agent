"""
User data models
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel
try:
    from pydantic import EmailStr
except ImportError:
    EmailStr = str  # Fallback to str if email-validator not installed
from datetime import datetime
from enum import Enum


class RiskTolerance(str, Enum):
    CONSERVATIVE = "Conservative"
    MODERATE = "Moderate"
    AGGRESSIVE = "Aggressive"


class InvestmentExperience(str, Enum):
    BEGINNER = "Beginner"
    DEVELOPING = "Developing"
    EXPERIENCED = "Experienced"
    EXPERT = "Expert"


class GoalPriority(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class UserProfile(BaseModel):
    name: str
    age: int
    profession: str
    location: str
    email: Optional[str] = None
    phone: Optional[str] = None


class FinancialProfile(BaseModel):
    annual_income_after_tax: float
    monthly_income_after_tax: float
    take_home: float
    monthly_expenses: float
    savings_rate: float


class InvestmentProfile(BaseModel):
    risk_tolerance: RiskTolerance
    investment_experience: InvestmentExperience
    investment_horizon: int  # years
    preferred_investment_types: List[str] = []


class AssetAllocation(BaseModel):
    value: float
    percentage: float


class PortfolioSummary(BaseModel):
    total_investment: float
    total_current_value: float
    total_gain_loss: float
    gain_loss_percentage: float
    asset_allocation: Dict[str, AssetAllocation]
    updated_at: Optional[datetime] = None


class StockHolding(BaseModel):
    symbol: str
    company_name: str
    quantity: int
    avg_cost: float
    current_price: float
    investment_amount: float
    current_value: float
    gain_loss: float
    gain_loss_percentage: float
    sector: Optional[str] = None


class MutualFundHolding(BaseModel):
    scheme_name: str
    scheme_code: Optional[str] = None
    folio_number: Optional[str] = None
    units: float
    nav: float
    investment_amount: float
    current_value: float
    gain_loss: float
    gain_loss_percentage: float
    sip_amount: Optional[float] = None
    fund_type: Optional[str] = None
    fund_category: Optional[str] = None


class Portfolio(BaseModel):
    summary: PortfolioSummary
    stocks: List[StockHolding] = []
    mutual_funds: List[MutualFundHolding] = []


class FinancialGoal(BaseModel):
    id: str
    name: str
    description: str
    target_amount: float
    current_amount: float
    target_date: datetime
    priority: GoalPriority
    category: str
    progress_percentage: float


class Transaction(BaseModel):
    id: str
    date: datetime
    description: str
    amount: float
    type: str  # 'credit' or 'debit'
    category: Optional[str] = None


class Credentials(BaseModel):
    email: str
    username: Optional[str] = None
    password_hash: str
    provider: str = "local"  # 'local', 'kite', 'google', etc.


class KiteSession(BaseModel):
    access_token: str
    public_token: Optional[str] = None
    user_id: str
    login_time: datetime


class User(BaseModel):
    id: str
    user_profile: UserProfile
    financial_profile: FinancialProfile
    investment_profile: InvestmentProfile
    portfolio: Portfolio
    financial_goals: List[FinancialGoal] = []
    recent_transactions: List[Transaction] = []
    credentials: Credentials
    kite_session: Optional[KiteSession] = None
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    username: str
    password: str
    user_profile: UserProfile
    financial_profile: Optional[FinancialProfile] = None
    investment_profile: Optional[InvestmentProfile] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    profession: str
    location: str
    age: int
    risk_tolerance: RiskTolerance
    investment_experience: InvestmentExperience
    provider: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class APIResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None
    code: Optional[str] = None