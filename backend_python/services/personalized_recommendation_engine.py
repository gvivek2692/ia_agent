"""
Personalized Recommendation Engine - AI-driven investment suggestions
Analyzes user context, portfolio, and market conditions to generate personalized recommendations
"""

import logging
import json
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum

from services.demo_data_service import DemoDataService
from services.web_search_service import WebSearchService

logger = logging.getLogger(__name__)


class RecommendationType(Enum):
    """Types of recommendations"""
    REBALANCING = "rebalancing"
    NEW_INVESTMENT = "new_investment"
    SIP_OPTIMIZATION = "sip_optimization"
    RISK_MANAGEMENT = "risk_management"
    GOAL_PLANNING = "goal_planning"
    TAX_OPTIMIZATION = "tax_optimization"
    MARKET_OPPORTUNITY = "market_opportunity"


class RiskLevel(Enum):
    """Risk levels for recommendations"""
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"


@dataclass
class Recommendation:
    """Individual recommendation with all metadata"""
    id: str
    type: RecommendationType
    title: str
    description: str
    reasoning: str
    priority: int  # 1-10, higher = more important
    risk_level: RiskLevel
    potential_return: Optional[float] = None
    time_horizon: Optional[str] = None  # short, medium, long
    investment_amount: Optional[float] = None
    action_steps: List[str] = None
    market_context: Optional[str] = None
    confidence_score: float = 0.0  # 0-1
    personalization_factors: List[str] = None
    created_at: datetime = None


@dataclass
class RecommendationContext:
    """Context used for generating recommendations"""
    user_profile: Dict[str, Any]
    portfolio: Dict[str, Any]
    financial_goals: Dict[str, Any]
    market_conditions: Dict[str, Any]
    risk_tolerance: str
    investment_experience: str
    available_funds: float
    goal_priorities: List[str]


class PersonalizedRecommendationEngine:
    """AI-driven personalized investment recommendation system"""
    
    def __init__(self):
        self.demo_service = DemoDataService()
        self.web_search = WebSearchService()
        
        # Recommendation templates and rules
        self.recommendation_templates = self._initialize_recommendation_templates()
        self.sector_mappings = self._initialize_sector_mappings()
        self.risk_scoring_matrix = self._initialize_risk_scoring_matrix()
        
        logger.info("Personalized Recommendation Engine initialized")
    
    def _initialize_recommendation_templates(self) -> Dict[RecommendationType, Dict[str, Any]]:
        """Initialize recommendation templates with scoring criteria"""
        
        return {
            RecommendationType.REBALANCING: {
                "triggers": ["concentration_risk", "sector_imbalance", "asset_allocation_drift"],
                "min_portfolio_value": 50000,
                "priority_weight": 8,
                "base_confidence": 0.7
            },
            
            RecommendationType.NEW_INVESTMENT: {
                "triggers": ["available_funds", "underweight_sectors", "market_opportunities"],
                "min_available_funds": 10000,
                "priority_weight": 6,
                "base_confidence": 0.6
            },
            
            RecommendationType.SIP_OPTIMIZATION: {
                "triggers": ["goal_timeline_pressure", "underperforming_sips", "available_surplus"],
                "min_monthly_surplus": 5000,
                "priority_weight": 7,
                "base_confidence": 0.8
            },
            
            RecommendationType.RISK_MANAGEMENT: {
                "triggers": ["high_concentration", "risk_mismatch", "volatile_holdings"],
                "priority_weight": 9,
                "base_confidence": 0.9
            },
            
            RecommendationType.GOAL_PLANNING: {
                "triggers": ["goal_timeline_risk", "insufficient_allocation", "new_goal_opportunity"],
                "priority_weight": 8,
                "base_confidence": 0.7
            },
            
            RecommendationType.TAX_OPTIMIZATION: {
                "triggers": ["tax_loss_harvesting", "elss_underutilization", "debt_tax_efficiency"],
                "priority_weight": 5,
                "base_confidence": 0.6
            },
            
            RecommendationType.MARKET_OPPORTUNITY: {
                "triggers": ["sector_rotation", "market_dip", "value_opportunities"],
                "priority_weight": 4,
                "base_confidence": 0.5
            }
        }
    
    def _initialize_sector_mappings(self) -> Dict[str, Dict[str, Any]]:
        """Initialize sector analysis mappings"""
        
        return {
            "technology": {
                "recommended_allocation": 0.25,
                "growth_potential": "high",
                "volatility": "high",
                "suitable_for": ["young professionals", "high risk tolerance"]
            },
            "banking": {
                "recommended_allocation": 0.20,
                "growth_potential": "moderate",
                "volatility": "moderate",
                "suitable_for": ["conservative investors", "dividend seekers"]
            },
            "healthcare": {
                "recommended_allocation": 0.15,
                "growth_potential": "high",
                "volatility": "moderate",
                "suitable_for": ["long-term investors", "defensive portfolios"]
            },
            "consumer_goods": {
                "recommended_allocation": 0.15,
                "growth_potential": "moderate",
                "volatility": "low",
                "suitable_for": ["stable income seekers", "conservative portfolios"]
            },
            "manufacturing": {
                "recommended_allocation": 0.10,
                "growth_potential": "moderate",
                "volatility": "moderate",
                "suitable_for": ["economic growth plays", "cyclical investors"]
            },
            "energy": {
                "recommended_allocation": 0.08,
                "growth_potential": "moderate",
                "volatility": "high",
                "suitable_for": ["inflation hedge", "commodity investors"]
            },
            "utilities": {
                "recommended_allocation": 0.07,
                "growth_potential": "low",
                "volatility": "low",
                "suitable_for": ["dividend income", "defensive investors"]
            }
        }
    
    def _initialize_risk_scoring_matrix(self) -> Dict[str, Dict[str, float]]:
        """Initialize risk scoring matrix for different scenarios"""
        
        return {
            "conservative": {
                "equity_max": 0.4,
                "single_stock_max": 0.05,
                "sector_max": 0.15,
                "volatility_tolerance": 0.1
            },
            "moderate": {
                "equity_max": 0.7,
                "single_stock_max": 0.08,
                "sector_max": 0.20,
                "volatility_tolerance": 0.15
            },
            "aggressive": {
                "equity_max": 0.9,
                "single_stock_max": 0.12,
                "sector_max": 0.25,
                "volatility_tolerance": 0.25
            }
        }
    
    async def generate_personalized_recommendations(self, user_id: str, max_recommendations: int = 5) -> List[Recommendation]:
        """Generate personalized recommendations for a user"""
        
        # Build comprehensive context
        context = await self._build_recommendation_context(user_id)
        if not context:
            logger.error(f"Could not build context for user {user_id}")
            return []
        
        # Generate candidate recommendations
        candidates = await self._generate_candidate_recommendations(context)
        
        # Score and rank recommendations
        scored_recommendations = self._score_recommendations(candidates, context)
        
        # Apply personalization filters
        personalized_recommendations = self._apply_personalization_filters(scored_recommendations, context)
        
        # Return top recommendations
        final_recommendations = sorted(personalized_recommendations, key=lambda x: x.priority, reverse=True)[:max_recommendations]
        
        logger.info(f"Generated {len(final_recommendations)} personalized recommendations for user {user_id}")
        return final_recommendations
    
    async def _build_recommendation_context(self, user_id: str) -> Optional[RecommendationContext]:
        """Build comprehensive context for recommendation generation"""
        
        try:
            # Get user data
            user_context = self.demo_service.get_complete_user_context(user_id)
            goals_data = self.demo_service.get_goal_progress_summary(user_id)
            sector_allocation = self.demo_service.get_sector_wise_allocation(user_id)
            
            # Calculate available funds
            financial_profile = user_context.get("financial_profile", {})
            monthly_income = financial_profile.get("take_home", 0)
            monthly_expenses = financial_profile.get("monthly_expenses", 0)
            available_monthly = max(0, monthly_income - monthly_expenses)
            
            # Get market context via search
            market_query = "Indian stock market current trends investment opportunities"
            market_data = await self.web_search.search(market_query, {"location": "India", "num": 3})
            
            return RecommendationContext(
                user_profile=user_context.get("user_profile", {}),
                portfolio=user_context.get("portfolio", {}),
                financial_goals=goals_data,
                market_conditions=market_data,
                risk_tolerance=user_context.get("investment_profile", {}).get("risk_tolerance", "moderate"),
                investment_experience=user_context.get("investment_profile", {}).get("investment_experience", "intermediate"),
                available_funds=available_monthly * 6,  # 6 months of surplus
                goal_priorities=["emergency_fund", "house_purchase", "retirement"]  # Default priorities
            )
            
        except Exception as e:
            logger.error(f"Error building recommendation context: {str(e)}")
            return None
    
    async def _generate_candidate_recommendations(self, context: RecommendationContext) -> List[Recommendation]:
        """Generate candidate recommendations based on context"""
        
        candidates = []
        
        # Analyze portfolio for rebalancing opportunities
        rebalancing_recs = self._analyze_rebalancing_opportunities(context)
        candidates.extend(rebalancing_recs)
        
        # Analyze new investment opportunities
        investment_recs = self._analyze_investment_opportunities(context)
        candidates.extend(investment_recs)
        
        # Analyze SIP optimization
        sip_recs = self._analyze_sip_optimization(context)
        candidates.extend(sip_recs)
        
        # Analyze risk management needs
        risk_recs = self._analyze_risk_management(context)
        candidates.extend(risk_recs)
        
        # Analyze goal planning needs
        goal_recs = self._analyze_goal_planning(context)
        candidates.extend(goal_recs)
        
        # Analyze tax optimization opportunities
        tax_recs = self._analyze_tax_optimization(context)
        candidates.extend(tax_recs)
        
        logger.info(f"Generated {len(candidates)} candidate recommendations")
        return candidates
    
    def _analyze_rebalancing_opportunities(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze portfolio for rebalancing opportunities"""
        
        recommendations = []
        portfolio = context.portfolio
        summary = portfolio.get("summary", {})
        
        if summary.get("total_current_value", 0) < 50000:
            return recommendations  # Portfolio too small for rebalancing
        
        # Check for concentration risk
        stocks = portfolio.get("stocks", [])
        if stocks:
            max_holding_percentage = max(stock.get("current_value", 0) for stock in stocks) / summary.get("total_current_value", 1)
            
            if max_holding_percentage > 0.15:  # More than 15% in single stock
                rec = Recommendation(
                    id=f"rebalance_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    type=RecommendationType.REBALANCING,
                    title="Reduce Portfolio Concentration Risk",
                    description=f"Your portfolio has high concentration with {max_holding_percentage:.1%} in a single holding. Consider rebalancing to reduce risk.",
                    reasoning=f"High concentration in single holdings increases portfolio risk. Recommended maximum allocation per stock is 10-12% for balanced portfolios.",
                    priority=8,
                    risk_level=RiskLevel.MODERATE,
                    time_horizon="short",
                    action_steps=[
                        "Identify your largest holdings",
                        "Gradually reduce positions above 12% allocation",
                        "Diversify into other sectors or asset classes",
                        "Consider tax implications before rebalancing"
                    ],
                    confidence_score=0.8,
                    personalization_factors=["high_concentration", "risk_management"],
                    created_at=datetime.now()
                )
                recommendations.append(rec)
        
        return recommendations
    
    def _analyze_investment_opportunities(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze new investment opportunities"""
        
        recommendations = []
        
        if context.available_funds > 25000:  # Has investible surplus
            # Technology sector opportunity (example)
            rec = Recommendation(
                id=f"invest_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                type=RecommendationType.NEW_INVESTMENT,
                title="Technology Sector Investment Opportunity",
                description="Consider investing in IT/Technology sector mutual funds given the sector's growth prospects and your risk profile.",
                reasoning="Technology sector is expected to benefit from digital transformation trends. Your moderate risk profile aligns with technology mutual fund investments.",
                priority=6,
                risk_level=RiskLevel.MODERATE,
                potential_return=0.12,  # 12% expected return
                time_horizon="medium",
                investment_amount=min(context.available_funds * 0.3, 50000),
                action_steps=[
                    "Research top-rated technology mutual funds",
                    "Compare expense ratios and past performance",
                    "Start with SIP of ₹5,000-10,000 monthly",
                    "Monitor performance quarterly"
                ],
                confidence_score=0.6,
                personalization_factors=["sector_opportunity", "risk_alignment"],
                created_at=datetime.now()
            )
            recommendations.append(rec)
        
        return recommendations
    
    def _analyze_sip_optimization(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze SIP optimization opportunities"""
        
        recommendations = []
        
        # Check if user has surplus to increase SIPs
        if context.available_funds > 10000:
            monthly_surplus = context.available_funds / 12  # Convert to monthly
            
            rec = Recommendation(
                id=f"sip_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                type=RecommendationType.SIP_OPTIMIZATION,
                title="Optimize SIP Amounts for Better Goal Achievement",
                description=f"You can increase your monthly SIP by ₹{monthly_surplus:,.0f} to accelerate goal achievement.",
                reasoning="Your current savings rate allows for higher SIP investments, which can significantly improve goal timeline and wealth creation.",
                priority=7,
                risk_level=RiskLevel.LOW,
                investment_amount=monthly_surplus,
                time_horizon="long",
                action_steps=[
                    "Review current SIP performance",
                    "Identify underperforming schemes",
                    f"Increase total SIP by ₹{monthly_surplus:,.0f} monthly",
                    "Focus on goal-based allocation"
                ],
                confidence_score=0.8,
                personalization_factors=["surplus_funds", "goal_acceleration"],
                created_at=datetime.now()
            )
            recommendations.append(rec)
        
        return recommendations
    
    def _analyze_risk_management(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze risk management needs"""
        
        recommendations = []
        
        # Check emergency fund adequacy
        financial_goals = context.financial_goals
        emergency_goal = None
        
        if isinstance(financial_goals, dict) and "goals" in financial_goals:
            for goal in financial_goals["goals"]:
                if "emergency" in goal.get("name", "").lower():
                    emergency_goal = goal
                    break
        
        if emergency_goal:
            progress = emergency_goal.get("progress_percentage", 0)
            if progress < 80:  # Less than 80% complete
                rec = Recommendation(
                    id=f"risk_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    type=RecommendationType.RISK_MANAGEMENT,
                    title="Strengthen Emergency Fund",
                    description=f"Your emergency fund is {progress:.1f}% complete. Consider prioritizing this for financial security.",
                    reasoning="Emergency funds provide financial stability and should be prioritized before aggressive investments. Target is 6 months of expenses.",
                    priority=9,
                    risk_level=RiskLevel.VERY_LOW,
                    time_horizon="short",
                    action_steps=[
                        "Calculate 6 months of essential expenses",
                        "Set up dedicated liquid fund SIP",
                        "Use high-yield savings or liquid funds",
                        "Automate emergency fund contributions"
                    ],
                    confidence_score=0.9,
                    personalization_factors=["financial_security", "risk_foundation"],
                    created_at=datetime.now()
                )
                recommendations.append(rec)
        
        return recommendations
    
    def _analyze_goal_planning(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze goal planning opportunities"""
        
        recommendations = []
        
        # Analyze if user can achieve goals faster
        financial_goals = context.financial_goals
        if isinstance(financial_goals, dict) and "goals" in financial_goals:
            for goal in financial_goals["goals"]:
                target_amount = goal.get("target_amount", 0)
                current_amount = goal.get("current_amount", 0)
                progress = goal.get("progress_percentage", 0)
                
                if progress < 50 and target_amount > 100000:  # Large goal with low progress
                    rec = Recommendation(
                        id=f"goal_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                        type=RecommendationType.GOAL_PLANNING,
                        title=f"Accelerate {goal.get('name', 'Goal')} Achievement",
                        description=f"Consider increasing allocation to {goal.get('name', 'this goal')} to stay on track for your target timeline.",
                        reasoning=f"Current progress of {progress:.1f}% may not meet your timeline. Strategic allocation increase can help achieve the ₹{target_amount:,.0f} target.",
                        priority=8,
                        risk_level=RiskLevel.MODERATE,
                        investment_amount=(target_amount - current_amount) * 0.1,  # 10% of remaining amount
                        time_horizon="medium",
                        action_steps=[
                            f"Review timeline for {goal.get('name', 'goal')}",
                            "Calculate required monthly contribution",
                            "Choose appropriate investment vehicle",
                            "Set up goal-specific SIP"
                        ],
                        confidence_score=0.7,
                        personalization_factors=["goal_timeline", "strategic_planning"],
                        created_at=datetime.now()
                    )
                    recommendations.append(rec)
                    break  # Only one goal planning recommendation at a time
        
        return recommendations
    
    def _analyze_tax_optimization(self, context: RecommendationContext) -> List[Recommendation]:
        """Analyze tax optimization opportunities"""
        
        recommendations = []
        
        # ELSS recommendation for tax saving
        portfolio = context.portfolio
        current_elss_value = 0
        
        # Check if user has ELSS investments
        for mf in portfolio.get("mutual_funds", []):
            if "elss" in mf.get("scheme_name", "").lower() or "tax" in mf.get("scheme_name", "").lower():
                current_elss_value += mf.get("current_value", 0)
        
        if current_elss_value < 150000:  # Less than 80C limit
            rec = Recommendation(
                id=f"tax_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                type=RecommendationType.TAX_OPTIMIZATION,
                title="Maximize Tax Savings with ELSS",
                description=f"You can save up to ₹{(150000 - current_elss_value) * 0.3:,.0f} in taxes by investing ₹{150000 - current_elss_value:,.0f} more in ELSS.",
                reasoning="ELSS mutual funds provide tax deduction under Section 80C while offering equity growth potential. This dual benefit makes them efficient for tax planning.",
                priority=5,
                risk_level=RiskLevel.MODERATE,
                investment_amount=min(150000 - current_elss_value, context.available_funds * 0.4),
                time_horizon="long",
                action_steps=[
                    "Research top-performing ELSS funds",
                    "Compare 3-year lock-in implications",
                    "Set up ELSS SIP by December",
                    "Track 80C utilization annually"
                ],
                confidence_score=0.6,
                personalization_factors=["tax_efficiency", "80c_optimization"],
                created_at=datetime.now()
            )
            recommendations.append(rec)
        
        return recommendations
    
    def _score_recommendations(self, candidates: List[Recommendation], context: RecommendationContext) -> List[Recommendation]:
        """Score recommendations based on user context"""
        
        for rec in candidates:
            # Base priority from template
            template = self.recommendation_templates.get(rec.type, {})
            base_priority = template.get("priority_weight", 5)
            
            # Adjust based on user's risk tolerance
            risk_adjustment = self._calculate_risk_adjustment(rec.risk_level, context.risk_tolerance)
            
            # Adjust based on available funds
            funds_adjustment = self._calculate_funds_adjustment(rec.investment_amount, context.available_funds)
            
            # Adjust based on goal urgency
            urgency_adjustment = self._calculate_urgency_adjustment(rec, context)
            
            # Final priority calculation
            final_priority = min(10, max(1, base_priority + risk_adjustment + funds_adjustment + urgency_adjustment))
            rec.priority = int(final_priority)
            
            # Update confidence score
            rec.confidence_score = min(1.0, rec.confidence_score + (risk_adjustment + funds_adjustment) * 0.1)
        
        return candidates
    
    def _calculate_risk_adjustment(self, rec_risk_level: RiskLevel, user_risk_tolerance: str) -> float:
        """Calculate priority adjustment based on risk alignment"""
        
        risk_mapping = {
            RiskLevel.VERY_LOW: 0,
            RiskLevel.LOW: 1,
            RiskLevel.MODERATE: 2,
            RiskLevel.HIGH: 3,
            RiskLevel.VERY_HIGH: 4
        }
        
        user_risk_mapping = {
            "conservative": 1,
            "moderate": 2,
            "aggressive": 3
        }
        
        rec_risk_score = risk_mapping.get(rec_risk_level, 2)
        user_risk_score = user_risk_mapping.get(user_risk_tolerance, 2)
        
        # Higher alignment = higher priority adjustment
        alignment = 1 - abs(rec_risk_score - user_risk_score) / 4
        return alignment * 2  # Max 2 points adjustment
    
    def _calculate_funds_adjustment(self, investment_amount: Optional[float], available_funds: float) -> float:
        """Calculate priority adjustment based on fund availability"""
        
        if not investment_amount or available_funds <= 0:
            return 0
        
        affordability_ratio = min(1.0, available_funds / investment_amount)
        return affordability_ratio * 1.5  # Max 1.5 points adjustment
    
    def _calculate_urgency_adjustment(self, rec: Recommendation, context: RecommendationContext) -> float:
        """Calculate priority adjustment based on urgency"""
        
        # Emergency fund and risk management are always urgent
        if rec.type in [RecommendationType.RISK_MANAGEMENT]:
            return 2.0
        
        # Goal-based urgency
        if rec.type == RecommendationType.GOAL_PLANNING and "emergency" in rec.title.lower():
            return 1.5
        
        # Tax optimization near year-end
        if rec.type == RecommendationType.TAX_OPTIMIZATION:
            current_month = datetime.now().month
            if current_month >= 10:  # October onwards
                return 1.0
        
        return 0
    
    def _apply_personalization_filters(self, recommendations: List[Recommendation], context: RecommendationContext) -> List[Recommendation]:
        """Apply personalization filters to recommendations"""
        
        # Filter based on investment experience
        if context.investment_experience == "beginner":
            recommendations = [r for r in recommendations if r.risk_level in [RiskLevel.VERY_LOW, RiskLevel.LOW, RiskLevel.MODERATE]]
        
        # Filter based on available funds
        recommendations = [r for r in recommendations 
                         if not r.investment_amount or r.investment_amount <= context.available_funds]
        
        # Add market context to each recommendation
        for rec in recommendations:
            rec.market_context = "Current market conditions suggest cautious but optimistic approach to investments."
        
        return recommendations
    
    def get_recommendation_summary(self, recommendations: List[Recommendation]) -> Dict[str, Any]:
        """Get summary of recommendations"""
        
        if not recommendations:
            return {"total": 0, "message": "No recommendations generated"}
        
        summary = {
            "total": len(recommendations),
            "high_priority": len([r for r in recommendations if r.priority >= 8]),
            "total_investment_suggested": sum(r.investment_amount or 0 for r in recommendations),
            "risk_distribution": {},
            "type_distribution": {},
            "avg_confidence": sum(r.confidence_score for r in recommendations) / len(recommendations)
        }
        
        # Risk distribution
        for risk_level in RiskLevel:
            count = len([r for r in recommendations if r.risk_level == risk_level])
            if count > 0:
                summary["risk_distribution"][risk_level.value] = count
        
        # Type distribution
        for rec_type in RecommendationType:
            count = len([r for r in recommendations if r.type == rec_type])
            if count > 0:
                summary["type_distribution"][rec_type.value] = count
        
        return summary
    
    def format_recommendation_for_ai(self, recommendation: Recommendation) -> str:
        """Format recommendation for AI response"""
        
        formatted = f"""
**{recommendation.title}** (Priority: {recommendation.priority}/10)

{recommendation.description}

**Why this recommendation:**
{recommendation.reasoning}

**Risk Level:** {recommendation.risk_level.value.replace('_', ' ').title()}
"""
        
        if recommendation.investment_amount:
            formatted += f"**Suggested Amount:** ₹{recommendation.investment_amount:,.0f}\n"
        
        if recommendation.potential_return:
            formatted += f"**Expected Return:** {recommendation.potential_return:.1%}\n"
        
        if recommendation.time_horizon:
            formatted += f"**Time Horizon:** {recommendation.time_horizon.title()}\n"
        
        if recommendation.action_steps:
            formatted += "\n**Action Steps:**\n"
            for step in recommendation.action_steps:
                formatted += f"• {step}\n"
        
        return formatted.strip()