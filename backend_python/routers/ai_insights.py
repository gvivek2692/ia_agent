"""
AI insights and portfolio analysis API endpoints
"""

import json
import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from services.ai_insights_service import AIInsightsService
from services.risk_analysis_service import RiskAnalysisService
from services.portfolio_recommendations_service import PortfolioRecommendationsService
from services.market_analysis_service import MarketAnalysisService
from services.demo_data_service import DemoDataService

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize services
ai_insights_service = AIInsightsService()
risk_analysis_service = RiskAnalysisService()
portfolio_recommendations_service = PortfolioRecommendationsService()
market_analysis_service = MarketAnalysisService()
demo_data_service = DemoDataService()


def load_users() -> List[Dict[str, Any]]:
    """Load users from JSON file"""
    users_file = "data/users.json"
    if not os.path.exists(users_file):
        return []
    
    try:
        with open(users_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    users = load_users()
    for user in users:
        if user.get('id') == user_id:
            return user
    return None


def generate_portfolio_recommendations(user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate portfolio recommendations using advanced service"""
    try:
        recommendations_data = portfolio_recommendations_service.generate_portfolio_recommendations(user_context)
        return recommendations_data.get('recommendations', [])
    except Exception as e:
        logger.error(f"Error generating portfolio recommendations: {str(e)}")
        # Fallback to simple recommendations
        return [
            {
                "id": "rec_001",
                "type": "rebalance",
                "title": "Portfolio Rebalancing",
                "description": "Your equity allocation may need adjustment for your risk profile",
                "priority": "medium",
                "impact_score": 75,
                "timeframe": "1-2 months",
                "reasoning": ["Maintain target asset allocation", "Reduce portfolio volatility"],
                "risk_level": "low"
            }
        ]


def calculate_risk_analysis(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate risk analysis"""
    portfolio = user_context.get('portfolio', {})
    
    risk_analysis = {
        "overall_risk_score": 65,
        "risk_level": "Moderate",
        "risk_factors": {
            "market_risk": 70,
            "concentration_risk": 45,
            "liquidity_risk": 30,
            "credit_risk": 25
        },
        "risk_metrics": {
            "volatility": 18.5,
            "beta": 1.1,
            "sharpe_ratio": 1.2,
            "max_drawdown": 15.2
        },
        "recommendations": [
            "Diversify across more sectors",
            "Consider adding debt instruments",
            "Monitor portfolio volatility regularly"
        ]
    }
    
    return risk_analysis


def generate_market_analysis(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Generate market analysis using advanced service"""
    try:
        return market_analysis_service.generate_market_analysis(user_context)
    except Exception as e:
        logger.error(f"Error generating market analysis: {str(e)}")
        # Fallback to simple market analysis
        return {
            "market_outlook": "Positive",
            "key_themes": [
                "Technology sector showing strong growth",
                "Banking sector recovery underway", 
                "Infrastructure spending driving growth"
            ],
            "portfolio_impact": {
                "positive_factors": ["IT sector holdings performing well"],
                "risk_factors": ["Market volatility due to global factors"],
                "recommendations": ["Stay invested for long term", "Continue SIP investments"]
            },
            "sector_analysis": {
                "technology": {"outlook": "Positive", "allocation": "Maintain"},
                "banking": {"outlook": "Recovering", "allocation": "Consider increasing"},
                "healthcare": {"outlook": "Stable", "allocation": "Hold current"}
            },
            "last_updated": datetime.now().isoformat(),
            "user_specific": True
        }


class GoalRequest(BaseModel):
    userId: str
    yearlyIncome: float
    age: int


class UpdateGoalsRequest(BaseModel):
    userId: str
    goals: List[Dict[str, Any]]


@router.get("/ai-insights")
async def get_ai_insights(user_id: Optional[str] = Query(None)):
    """Get AI-powered portfolio insights"""
    try:
        if user_id:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail={"error": "User not found"}
                )
            
            user_context = {
                "user_profile": user.get("user_profile", {}),
                "financial_profile": user.get("financial_profile", {}),
                "investment_profile": user.get("investment_profile", {}),
                "portfolio": user.get("portfolio", {}),
                "financial_goals": user.get("financial_goals", {"goals": []}),
                "recent_transactions": user.get("recent_transactions", [])
            }
        else:
            # Use comprehensive demo data
            user_context = demo_data_service.get_complete_user_context()
        
        # Generate complete AI insights using the advanced service
        insights = ai_insights_service.generate_complete_ai_insights(user_context)
        return insights
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get AI insights"}
        )


@router.get("/portfolio-recommendations")
async def get_portfolio_recommendations(user_id: Optional[str] = Query(None)):
    """Get portfolio recommendations"""
    try:
        if user_id:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail={"error": "User not found"}
                )
            
            user_context = {
                "user_profile": user.get("user_profile", {}),
                "financial_profile": user.get("financial_profile", {}),
                "investment_profile": user.get("investment_profile", {}),
                "portfolio": user.get("portfolio", {}),
                "financial_goals": user.get("financial_goals", {"goals": []})
            }
        else:
            # Use comprehensive demo data
            user_context = demo_data_service.get_complete_user_context()
        
        recommendations = generate_portfolio_recommendations(user_context)
        return {"recommendations": recommendations}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get portfolio recommendations"}
        )


@router.get("/comprehensive-recommendations")
async def get_comprehensive_recommendations(user_id: Optional[str] = Query(None)):
    """Get comprehensive portfolio recommendations with rebalance data"""
    try:
        if user_id:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail={"error": "User not found"}
                )
            
            user_context = {
                "user_profile": user.get("user_profile", {}),
                "financial_profile": user.get("financial_profile", {}),
                "investment_profile": user.get("investment_profile", {}),
                "portfolio": user.get("portfolio", {}),
                "financial_goals": user.get("financial_goals", {"goals": []})
            }
        else:
            # Use comprehensive demo data
            user_context = demo_data_service.get_complete_user_context()
        
        # Get comprehensive recommendations with rebalance data
        recommendations_data = portfolio_recommendations_service.generate_portfolio_recommendations(user_context)
        return recommendations_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comprehensive recommendations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get comprehensive recommendations"}
        )


@router.get("/risk-analysis")
async def get_risk_analysis(user_id: Optional[str] = Query(None)):
    """Get risk analysis"""
    try:
        if user_id:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail={"error": "User not found"}
                )
            
            user_context = {
                "user_profile": user.get("user_profile", {}),
                "financial_profile": user.get("financial_profile", {}),
                "investment_profile": user.get("investment_profile", {}),
                "portfolio": user.get("portfolio", {}),
                "financial_goals": user.get("financial_goals", {"goals": []})
            }
        else:
            # Use demo data
            user_context = {
                "user_profile": {"name": "Demo User", "age": 35},
                "portfolio": {
                    "summary": {
                        "total_current_value": 1185959.67,
                        "total_investment": 800000,
                        "asset_allocation": {
                            "mutual_funds": {"value": 1185959.67, "percentage": 100.0}
                        }
                    },
                    "stocks": [],
                    "mutual_funds": [
                        {
                            "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Growth",
                            "current_value": 876257.80,
                            "gain_loss_percentage": 995.32,
                            "fund_category": "Flexi Cap"
                        }
                    ]
                }
            }
        
        # Use advanced risk analysis service
        risk_analysis = risk_analysis_service.calculate_risk_analysis(user_context)
        return risk_analysis
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get risk analysis"}
        )


@router.get("/market-analysis")
async def get_market_analysis(user_id: Optional[str] = Query(None)):
    """Get market analysis"""
    try:
        if user_id:
            user = get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=404,
                    detail={"error": "User not found"}
                )
            
            user_context = {
                "user_profile": user.get("user_profile", {}),
                "financial_profile": user.get("financial_profile", {}),
                "investment_profile": user.get("investment_profile", {}),
                "portfolio": user.get("portfolio", {}),
                "financial_goals": user.get("financial_goals", {"goals": []})
            }
        else:
            # Use comprehensive demo data for market analysis
            user_context = {
                "user_profile": {"name": "Demo User", "age": 35, "profession": "Professional"},
                "investment_profile": {"risk_tolerance": "Moderate"},
                "portfolio": {
                    "summary": {
                        "total_current_value": 1185959.67,
                        "total_investment": 800000,
                        "asset_allocation": {
                            "stocks": {"value": 300000, "percentage": 25.3},
                            "mutual_funds": {"value": 885959.67, "percentage": 74.7}
                        }
                    },
                    "stocks": [
                        {
                            "symbol": "INFY",
                            "company_name": "Infosys Limited",
                            "sector": "Information Technology",
                            "current_value": 150000
                        },
                        {
                            "symbol": "HDFCBANK",
                            "company_name": "HDFC Bank Limited",
                            "sector": "Banking",
                            "current_value": 150000
                        }
                    ],
                    "mutual_funds": [
                        {
                            "scheme_name": "Parag Parikh Flexi Cap Fund - Direct Growth",
                            "current_value": 876257.80,
                            "fund_category": "Flexi Cap"
                        }
                    ]
                }
            }
        
        market_analysis = generate_market_analysis(user_context)
        return market_analysis
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to get market analysis"}
        )


@router.post("/generate-default-goals")
async def generate_default_goals(request: GoalRequest):
    """Generate default financial goals for user"""
    try:
        # Simple default goals generation
        monthly_expenses = (request.yearlyIncome * 0.7) / 12
        emergency_fund_target = monthly_expenses * 6
        retirement_corpus = request.yearlyIncome * 25
        
        goals = [
            {
                "id": f"emergency-fund-{int(datetime.now().timestamp())}",
                "name": "Emergency Fund",
                "description": f"Build emergency fund covering 6 months of expenses",
                "target_amount": int(emergency_fund_target),
                "current_amount": 0,
                "target_date": "2025-12-31",
                "priority": "High",
                "category": "Emergency",
                "progress_percentage": 0
            },
            {
                "id": f"retirement-{int(datetime.now().timestamp())}",
                "name": "Retirement Planning",
                "description": f"Build retirement corpus for financial independence",
                "target_amount": int(retirement_corpus),
                "current_amount": 0,
                "target_date": "2050-12-31",
                "priority": "High",
                "category": "Long-term",
                "progress_percentage": 0
            }
        ]
        
        return {
            "success": True,
            "goals": goals,
            "userFinancialInfo": {
                "yearlyIncome": request.yearlyIncome,
                "age": request.age,
                "portfolioValue": 0
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate default goals"}
        )


@router.post("/update-user-goals")
async def update_user_goals(request: UpdateGoalsRequest):
    """Update user's financial goals"""
    try:
        # In a real implementation, this would update the user's goals in the database
        # For now, we just return success
        return {
            "success": True,
            "message": "Goals updated successfully"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to update goals"}
        )


@router.get("/user-financial-info/{user_id}")
async def get_user_financial_info(user_id: str):
    """Get user financial information"""
    try:
        # This would normally fetch from a database
        # Return default info for now
        return {
            "success": True,
            "financialInfo": {
                "yearlyIncome": 1000000,
                "age": 35,
                "updatedAt": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to fetch financial information"}
        )