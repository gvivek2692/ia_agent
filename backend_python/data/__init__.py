"""
Demo Data Package - Realistic Indian Investment Portfolio Demo Data
"""

from .demo_user import demo_user
from .portfolio_holdings import portfolio_holdings
from .financial_goals import financial_goals, get_goal_by_id, get_goals_by_status, calculate_goal_progress

__all__ = [
    'demo_user',
    'portfolio_holdings', 
    'financial_goals',
    'get_goal_by_id',
    'get_goals_by_status', 
    'calculate_goal_progress'
]