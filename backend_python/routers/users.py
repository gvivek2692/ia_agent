"""
User management API endpoints
"""

import json
import os
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Header

from models.user import UserResponse
from services.auth_service import AuthService
from shared_services import auth_service as shared_auth_service, demo_service

router = APIRouter()
auth_service = AuthService()


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


def get_goals_by_user_id(user_id: str) -> List[Dict[str, Any]]:
    """Get financial goals for user"""
    user = get_user_by_id(user_id)
    if user:
        return user.get('financial_goals', [])
    return []


def get_user_transactions(user_id: str) -> List[Dict[str, Any]]:
    """Get user transactions"""
    user = get_user_by_id(user_id)
    if user:
        return user.get('recent_transactions', [])
    return []


@router.get("/users")
async def get_all_users():
    """Get all users (demo endpoint)"""
    try:
        users = load_users()
        
        # Transform users to safe format (remove passwords)
        safe_users = []
        for user in users:
            safe_user = {
                "id": user.get('id'),
                "name": user.get('user_profile', {}).get('name'),
                "email": user.get('user_profile', {}).get('email'),
                "profession": user.get('user_profile', {}).get('profession'),
                "location": user.get('user_profile', {}).get('location'),
                "age": user.get('user_profile', {}).get('age'),
                "experience_level": user.get('investment_profile', {}).get('investment_experience'),
                "risk_tolerance": user.get('investment_profile', {}).get('risk_tolerance'),
                "provider": user.get('credentials', {}).get('provider', 'local')
            }
            safe_users.append(safe_user)
        
        return {
            "success": True,
            "users": safe_users,
            "count": len(safe_users)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve users",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get specific user by ID"""
    try:
        user = get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "code": "USER_NOT_FOUND"
                }
            )
        
        # Remove sensitive information
        safe_user = {**user}
        if 'credentials' in safe_user:
            credentials = safe_user['credentials']
            if 'password' in credentials:
                del credentials['password']
        
        return {
            "success": True,
            "user": safe_user
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve user",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/user/{user_id}/context")
async def get_user_context(user_id: str):
    """Get user context for AI interactions"""
    try:
        user = get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "code": "USER_NOT_FOUND"
                }
            )
        
        # Build user context
        user_context = {
            "user_profile": user.get("user_profile", {}),
            "financial_profile": user.get("financial_profile", {}),
            "investment_profile": user.get("investment_profile", {}),
            "portfolio": user.get("portfolio", {}),
            "financial_goals": {
                "goals": get_goals_by_user_id(user_id)
            },
            "recent_transactions": get_user_transactions(user_id)[:10]
        }
        
        return user_context
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve user context",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/user/{user_id}/transactions")
async def get_user_transactions_endpoint(user_id: str, limit: int = Query(50), offset: int = Query(0)):
    """Get user transactions with pagination"""
    try:
        user = get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "code": "USER_NOT_FOUND"
                }
            )
        
        transactions = get_user_transactions(user_id)
        paginated_transactions = transactions[offset:offset + limit]
        
        return {
            "success": True,
            "transactions": paginated_transactions,
            "total": len(transactions),
            "limit": limit,
            "offset": offset
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve transactions",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/user/{user_id}/goals")
async def get_user_goals(user_id: str):
    """Get user financial goals"""
    try:
        user = get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "User not found",
                    "code": "USER_NOT_FOUND"
                }
            )
        
        goals = get_goals_by_user_id(user_id)
        
        return {
            "success": True,
            "goals": goals,
            "count": len(goals)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to retrieve goals",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/user-context")
async def get_demo_user_context(user_id: Optional[str] = Query(None), x_session_id: Optional[str] = Header(None)):
    """Get user context (supports both demo and specific user, with session support)"""
    try:
        target_user_id = None
        
        # First try to get user from session header
        if x_session_id:
            session_result = shared_auth_service.get_session(x_session_id)
            if session_result.get("success"):
                target_user_id = session_result.get("user", {}).get("id")
        
        # Fallback to query parameter
        if not target_user_id and user_id:
            target_user_id = user_id
        
        # If we have a user ID, get their personalized context
        if target_user_id:
            user_context = demo_service.get_complete_user_context(target_user_id)
            if "error" not in user_context:
                return user_context
        
        # Fallback: Return first demo user context
        users = load_users()
        if users:
            demo_user = users[0]  # First user as demo
            user_context = {
                "user_profile": demo_user.get("user_profile", {}),
                "financial_profile": demo_user.get("financial_profile", {}),
                "investment_profile": demo_user.get("investment_profile", {}),
                "portfolio": demo_user.get("portfolio", {}),
                "financial_goals": {
                    "goals": demo_user.get("financial_goals", [])
                },
                "recent_transactions": demo_user.get("recent_transactions", [])[:10]
            }
            return user_context
        
        # Default empty context
        return {
            "user_profile": {"name": "Demo User", "age": 35, "profession": "Professional", "location": "Mumbai, India"},
            "financial_profile": {"take_home": 80000},
            "investment_profile": {"risk_tolerance": "Moderate"},
            "portfolio": {"summary": {"total_current_value": 0}, "stocks": [], "mutual_funds": []},
            "financial_goals": {"goals": []},
            "recent_transactions": []
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to get user context",
                "code": "SERVER_ERROR"
            }
        )