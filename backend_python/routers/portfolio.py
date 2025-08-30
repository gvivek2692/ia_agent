"""
Portfolio and market data API endpoints with user-specific data
"""

import json
import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, Query, Header, HTTPException
from datetime import datetime

from data.demo_financial_goals import get_financial_goals_by_user_id
from shared_services import auth_service, demo_service

router = APIRouter()


def get_user_from_session(x_session_id: Optional[str]) -> Optional[str]:
    """Extract user ID from session header using shared auth service"""
    if not x_session_id:
        return None
    
    try:
        session_result = auth_service.get_session(x_session_id)
        if session_result.get("success"):
            user_data = session_result.get("user", {})
            user_id = user_data.get("id")
            print(f"DEBUG: Session valid, User ID: {user_id}")
            return user_id
        
        print(f"DEBUG: Session validation failed: {session_result.get('error', 'Unknown error')}")
        return None
        
    except Exception as e:
        print(f"Session validation error: {e}")
        return None


@router.get("/portfolio/summary")
async def get_portfolio_summary(x_session_id: Optional[str] = Header(None)):
    """Get portfolio summary for the logged-in user"""
    print(f"DEBUG: Received session header: {x_session_id}")
    
    user_id = get_user_from_session(x_session_id)
    print(f"DEBUG: Extracted user_id: {user_id}")
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "error": "Session required", "code": "NO_SESSION"}
        )
    
    try:
        # Get user-specific portfolio data
        user_context = demo_service.get_complete_user_context(user_id)
        
        if "error" in user_context:
            # Fallback to default portfolio for non-demo users
            return {
                "total_investment": 500000,
                "total_current_value": 550000,
                "total_gain_loss": 50000,
                "gain_loss_percentage": 10.0,
                "asset_allocation": {
                    "mutual_funds": {"value": 550000, "percentage": 100.0}
                }
            }
        
        return user_context["portfolio"]["summary"]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": "Failed to get portfolio summary", "code": "SERVER_ERROR"}
        )


@router.get("/goals/overview")
async def get_goals_overview(x_session_id: Optional[str] = Header(None)):
    """Get goals overview for the logged-in user"""
    user_id = get_user_from_session(x_session_id)
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "error": "Session required", "code": "NO_SESSION"}
        )
    
    try:
        # Get user-specific financial goals
        financial_goals = get_financial_goals_by_user_id(user_id)
        
        if not financial_goals or not financial_goals.get("goals"):
            # Fallback for non-demo users
            return {
                "goals": [],
                "total_goals": 0,
                "completed_goals": 0,
                "total_target_amount": 0,
                "total_current_amount": 0
            }
        
        goals = financial_goals["goals"]
        completed_goals = len([g for g in goals if g.get("status") == "Completed"])
        
        return {
            "goals": goals,
            "total_goals": len(goals),
            "completed_goals": completed_goals,
            "total_target_amount": financial_goals.get("goals_summary", {}).get("total_target_amount", 0),
            "total_current_amount": financial_goals.get("goals_summary", {}).get("total_current_amount", 0)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": "Failed to get goals overview", "code": "SERVER_ERROR"}
        )


@router.get("/transactions/recent")
async def get_recent_transactions(x_session_id: Optional[str] = Header(None)):
    """Get recent transactions for the logged-in user"""
    user_id = get_user_from_session(x_session_id)
    
    if not user_id:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "error": "Session required", "code": "NO_SESSION"}
        )
    
    try:
        # Get user-specific recent transactions
        user_context = demo_service.get_complete_user_context(user_id)
        
        if "error" in user_context:
            # Fallback for non-demo users
            return {
                "transactions": [],
                "total": 0
            }
        
        transactions = user_context.get("recent_transactions", [])
        
        return {
            "transactions": transactions,
            "total": len(transactions)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": "Failed to get recent transactions", "code": "SERVER_ERROR"}
        )


@router.get("/market/overview")
async def get_market_overview():
    """Get market overview (same for all users)"""
    return {
        "timestamp": datetime.now().isoformat(),
        "indices": {
            "nifty50": {
                "current": 21800.0,
                "change": 125.50,
                "changePercent": 0.58
            },
            "sensex": {
                "current": 72000.0,
                "change": 400.25,
                "changePercent": 0.56
            }
        },
        "market_sentiment": "Positive",
        "status": "Open" if 9 <= datetime.now().hour < 15 else "Closed"
    }


@router.get("/market/portfolio-impact")
async def get_portfolio_market_impact(x_session_id: Optional[str] = Header(None)):
    """Get portfolio market impact for the logged-in user"""
    user_id = get_user_from_session(x_session_id)
    
    if not user_id:
        return {}  # Return empty for non-authenticated users
    
    try:
        # Get user-specific portfolio to show their actual holdings
        user_context = demo_service.get_complete_user_context(user_id)
        
        if "error" in user_context:
            return {}
        
        portfolio_impact = {}
        stocks = user_context.get("portfolio", {}).get("stocks", [])
        
        for stock in stocks:
            symbol = stock.get("symbol")
            if symbol:
                # Mock current market data with some variation
                price_change = (stock.get("gain_loss_percentage", 0) / 100) * stock.get("current_price", 0)
                portfolio_impact[symbol] = {
                    "price": stock.get("current_price", 0),
                    "change": price_change,
                    "changePercent": stock.get("gain_loss_percentage", 0),
                    "your_holding": stock.get("quantity", 0)
                }
        
        return portfolio_impact
        
    except Exception:
        return {}