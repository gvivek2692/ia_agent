"""
Demo Data Service - Provides comprehensive demo data for AI Wealth Advisor
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random

from data.demo_users_profiles import get_demo_user_by_id, get_all_demo_users
from data.personalized_portfolios import get_complete_portfolio_data
from data.demo_financial_goals import get_financial_goals_by_user_id, get_goal_by_id, calculate_goal_progress

logger = logging.getLogger(__name__)


class DemoDataService:
    def __init__(self):
        # No longer need static data - everything is generated dynamically
        pass
    
    def get_complete_user_context(self, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get complete demo user context for AI conversations"""
        
        if not user_id:
            user_id = "priya-sharma"  # Default to first demo user
        
        # Get user data
        user_data = get_demo_user_by_id(user_id)
        if not user_data:
            return {"error": f"User {user_id} not found"}
        
        # Generate personalized portfolio
        portfolio_data = get_complete_portfolio_data(
            user_data["risk_profile"],
            user_data["portfolio_target_amount"]
        )
        
        # Get financial goals
        financial_goals = get_financial_goals_by_user_id(user_id)
        
        return {
            "user_profile": {
                "id": user_id,
                "name": user_data["user_profile"]["name"],
                "age": user_data["user_profile"]["age"],
                "location": user_data["user_profile"]["location"],
                "profession": user_data["user_profile"]["profession"],
                "company": user_data["user_profile"]["company"],
                "experience": user_data["user_profile"]["experience"]
            },
            "financial_profile": {
                "monthly_salary": user_data["financial_profile"]["monthly_salary"],
                "annual_ctc": user_data["financial_profile"]["annual_ctc"],
                "take_home": user_data["financial_profile"]["take_home"],
                "monthly_expenses": user_data["financial_profile"]["monthly_expenses"],
                "savings_rate": user_data["financial_profile"]["savings_rate"],
                "emergency_fund": user_data["banking"]["current_emergency_fund"],
                "emergency_fund_target": user_data["banking"]["emergency_fund_target"]
            },
            "investment_profile": user_data["investment_profile"],
            "portfolio": portfolio_data,
            "financial_goals": financial_goals,
            "recent_transactions": self.generate_recent_transactions(user_id),
            "monthly_expenses": user_data["monthly_expenses"],
            "banking": user_data["banking"]
        }
    
    def generate_recent_transactions(self, user_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """Generate recent transaction history for specific demo user"""
        
        user_data = get_demo_user_by_id(user_id)
        if not user_data:
            return []
            
        # Generate portfolio for this user
        portfolio_data = get_complete_portfolio_data(
            user_data["risk_profile"],
            user_data["portfolio_target_amount"]
        )
        
        transactions = []
        current_date = datetime.now()
        
        # SIP transactions for mutual funds
        for mf in portfolio_data["mutual_funds"]:
            if mf.get("sip_amount"):
                # Add monthly SIP transaction
                sip_date = current_date.replace(day=mf["sip_date"])
                if sip_date <= current_date:
                    transactions.append({
                        "id": f"sip_{mf['scheme_code']}_{current_date.strftime('%Y%m')}",
                        "date": sip_date.isoformat(),
                        "type": "SIP",
                        "description": f"SIP - {mf['scheme_name']}",
                        "amount": mf["sip_amount"],
                        "category": "Investment",
                        "status": "Completed"
                    })
        
        # Salary credit
        salary_date = current_date.replace(day=1)
        transactions.append({
            "id": f"salary_{current_date.strftime('%Y%m')}",
            "date": salary_date.isoformat(),
            "type": "Credit",
            "description": f"Salary Credit - {user_data['user_profile']['company']}",
            "amount": user_data["financial_profile"]["take_home"],
            "category": "Income",
            "status": "Completed"
        })
        
        # Monthly expenses based on user's expense profile
        expense_categories = [
            ("Rent", user_data["monthly_expenses"]["rent"]),
            ("Food & Dining", user_data["monthly_expenses"]["food_dining"]),
            ("Transportation", user_data["monthly_expenses"]["transportation"]),
            ("Utilities", user_data["monthly_expenses"]["utilities"]),
            ("Entertainment", user_data["monthly_expenses"]["entertainment"]),
            ("Shopping", user_data["monthly_expenses"]["shopping"])
        ]
        
        for category, base_amount in expense_categories:
            # Add some randomization to amounts
            amount = base_amount + random.randint(-int(base_amount * 0.2), int(base_amount * 0.2))
            expense_date = current_date.replace(day=random.randint(1, 28))
            
            transactions.append({
                "id": f"expense_{category.lower().replace(' ', '_')}_{current_date.strftime('%Y%m')}",
                "date": expense_date.isoformat(),
                "type": "Debit",
                "description": f"{category} Expense",
                "amount": amount,
                "category": "Expense",
                "status": "Completed"
            })
        
        # Sort by date (most recent first)
        transactions.sort(key=lambda x: x["date"], reverse=True)
        
        return transactions[:20]  # Return last 20 transactions
    
    def get_goal_progress_summary(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive goal progress summary for specific user"""
        
        financial_goals = get_financial_goals_by_user_id(user_id)
        goals = financial_goals.get("goals", [])
        
        # Calculate progress for each goal
        goal_progress = {}
        for goal in goals:
            progress = calculate_goal_progress(user_id, goal["id"])
            if progress:
                goal_progress[goal["id"]] = {
                    "name": goal["name"],
                    "current_progress": progress["current_progress"],
                    "amount_remaining": progress["amount_remaining"],
                    "is_on_track": progress["is_on_track"],
                    "priority": goal["priority"],
                    "target_date": goal["target_date"]
                }
        
        return {
            "goals_progress": goal_progress,
            "summary": financial_goals.get("goals_summary", {})
        }
    
    def get_sector_wise_allocation(self, user_id: str) -> Dict[str, Any]:
        """Get detailed sector-wise portfolio allocation for specific user"""
        
        user_data = get_demo_user_by_id(user_id)
        if not user_data:
            return {}
            
        portfolio_data = get_complete_portfolio_data(
            user_data["risk_profile"],
            user_data["portfolio_target_amount"]
        )
        
        stocks = portfolio_data["stocks"]
        total_stock_value = sum(stock["current_value"] for stock in stocks)
        
        sector_allocation = {}
        for stock in stocks:
            sector = stock["sector"]
            if sector not in sector_allocation:
                sector_allocation[sector] = {
                    "value": 0,
                    "percentage": 0,
                    "stocks": []
                }
            sector_allocation[sector]["value"] += stock["current_value"]
            sector_allocation[sector]["stocks"].append({
                "symbol": stock["symbol"],
                "company_name": stock["company_name"],
                "value": stock["current_value"],
                "gain_loss_percentage": stock["gain_loss_percentage"]
            })
        
        # Calculate percentages
        for sector in sector_allocation:
            sector_allocation[sector]["percentage"] = round(
                (sector_allocation[sector]["value"] / total_stock_value) * 100, 2
            ) if total_stock_value > 0 else 0
        
        return {
            "sector_allocation": sector_allocation,
            "total_stock_value": total_stock_value,
            "diversification_score": len(sector_allocation)  # Simple diversification metric
        }
    
    def get_sip_summary(self, user_id: str) -> Dict[str, Any]:
        """Get SIP investment summary for specific user"""
        
        user_data = get_demo_user_by_id(user_id)
        if not user_data:
            return {}
            
        portfolio_data = get_complete_portfolio_data(
            user_data["risk_profile"],
            user_data["portfolio_target_amount"]
        )
        
        mutual_funds = portfolio_data["mutual_funds"]
        
        total_monthly_sip = sum(mf.get("sip_amount", 0) for mf in mutual_funds)
        total_sip_value = sum(mf["current_value"] for mf in mutual_funds if mf.get("sip_amount"))
        
        sip_details = []
        for mf in mutual_funds:
            if mf.get("sip_amount"):
                sip_details.append({
                    "scheme_name": mf["scheme_name"],
                    "sip_amount": mf["sip_amount"],
                    "sip_date": mf["sip_date"],
                    "current_value": mf["current_value"],
                    "gain_loss_percentage": mf["gain_loss_percentage"],
                    "category": mf["category"]
                })
        
        return {
            "total_monthly_sip": total_monthly_sip,
            "total_sip_value": total_sip_value,
            "active_sips": len(sip_details),
            "sip_details": sip_details,
            "annual_sip_investment": total_monthly_sip * 12
        }
    
    def get_tax_planning_summary(self, user_id: str) -> Dict[str, Any]:
        """Get tax planning and savings summary for specific user"""
        
        user_data = get_demo_user_by_id(user_id)
        if not user_data:
            return {}
            
        # For now, return basic tax planning info based on salary
        annual_salary = user_data["financial_profile"]["annual_ctc"]
        
        # Estimate current 80C investments (conservative approach)
        estimated_elss = 50000  # Basic ELSS investment
        estimated_ppf = 100000  # PPF contribution
        estimated_epf = min(21600, annual_salary * 0.12)  # EPF @ 12% with limit
        
        total_tax_saving_investment = estimated_elss + estimated_ppf
        
        return {
            "total_80c_investment": total_tax_saving_investment,
            "elss_investment": estimated_elss,
            "ppf_contribution": estimated_ppf,
            "epf_contribution": estimated_epf,
            "tax_saving_potential": min(150000, total_tax_saving_investment),  # 80C limit
            "remaining_80c_limit": max(0, 150000 - total_tax_saving_investment),
            "estimated_tax_benefit": min(150000, total_tax_saving_investment) * 0.3  # Assuming 30% tax bracket
        }