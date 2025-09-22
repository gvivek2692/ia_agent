"""
User management API endpoints
"""

import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel

from models.user import UserResponse
from services.auth_service import AuthService
from shared_services import auth_service as shared_auth_service, demo_service
from services.financial_health_service import FinancialHealthService

router = APIRouter()
auth_service = AuthService()
financial_health_service = FinancialHealthService()


class LoanInfo(BaseModel):
    emi: float
    tenure_remaining_months: int
    principal_remaining: float


class ProfileUpdateRequest(BaseModel):
    user_profile: Optional[Dict[str, Any]] = None
    financial_profile: Optional[Dict[str, Any]] = None
    loan_profile: Optional[Dict[str, Any]] = None


class FinancialHealthDataRequest(BaseModel):
    category: str
    data: Dict[str, Any]


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
        financial_goals = user.get('financial_goals', {})
        if isinstance(financial_goals, dict):
            return financial_goals.get('goals', [])
        return financial_goals if isinstance(financial_goals, list) else []
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


@router.put("/users/{user_id}/profile")
async def update_user_profile(user_id: str, profile_data: ProfileUpdateRequest, x_session_id: Optional[str] = Header(None)):
    """Update user profile information"""
    try:
        # Verify session if provided
        if x_session_id:
            session_result = shared_auth_service.get_session(x_session_id)
            if not session_result.get("success"):
                raise HTTPException(
                    status_code=401,
                    detail={
                        "success": False,
                        "error": "Invalid session",
                        "code": "INVALID_SESSION"
                    }
                )
            
            # Check if session user matches the user_id being updated
            session_user_id = session_result.get("user", {}).get("id")
            if session_user_id != user_id:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "success": False,
                        "error": "Not authorized to update this profile",
                        "code": "UNAUTHORIZED"
                    }
                )

        # Update user profile using demo service
        update_result = demo_service.update_user_profile(user_id, profile_data.dict(exclude_none=True))
        
        if "error" in update_result:
            if "not found" in update_result["error"].lower():
                raise HTTPException(
                    status_code=404,
                    detail={
                        "success": False,
                        "error": "User not found",
                        "code": "USER_NOT_FOUND"
                    }
                )
            else:
                raise HTTPException(
                    status_code=500,
                    detail={
                        "success": False,
                        "error": update_result["error"],
                        "code": "UPDATE_FAILED"
                    }
                )
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": update_result
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to update profile",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/user-context")
async def get_demo_user_context(userId: Optional[str] = Query(None), x_session_id: Optional[str] = Header(None)):
    """Get user context (supports both demo and specific user, with session support)"""
    try:
        target_user_id = None
        
        # First try to get user from session header
        if x_session_id:
            session_result = shared_auth_service.get_session(x_session_id)
            if session_result.get("success"):
                target_user_id = session_result.get("user", {}).get("id")
        
        # Fallback to query parameter
        if not target_user_id and userId:
            target_user_id = userId
        
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


@router.get("/user/{user_id}/financial-health")
async def get_user_financial_health(user_id: str):
    """Get user financial health score and analysis"""
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
        
        # Build comprehensive user context for financial health calculation
        goals = get_goals_by_user_id(user_id)
        
        user_context = {
            "user_profile": user.get("user_profile", {}),
            "financial_profile": user.get("financial_profile", {}),
            "investment_profile": user.get("investment_profile", {}),
            "portfolio": user.get("portfolio", {}),
            "goals": {"goals": goals},
            "monthly_expenses": user.get("monthly_expenses", {}),
            "banking": user.get("banking", {}),
            "risk_protection": user.get("risk_protection", {}),
            "liabilities": user.get("liabilities", {}),
            "tax_planning": user.get("tax_planning", {})
        }
        
        # Calculate financial health score
        health_result = financial_health_service.calculate_financial_health(user_context)
        
        return health_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to calculate financial health score",
                "code": "SERVER_ERROR"
            }
        )


@router.put("/user/{user_id}/financial-health-data")
async def update_user_financial_health_data(user_id: str, request: FinancialHealthDataRequest):
    """Update user financial health data"""
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
        
        category = request.category
        data = request.data
        
        if not category or not data:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Category and data are required",
                    "code": "BAD_REQUEST"
                }
            )
        
        # Update user data based on category
        if category == "Risk Protection":
            # Initialize risk_protection if it doesn't exist
            if "risk_protection" not in user:
                user["risk_protection"] = {}
            
            # Update insurance data
            if "life_insurance_amount" in data:
                user["risk_protection"]["life_insurance"] = {
                    "coverage_amount": data["life_insurance_amount"],
                    "insurance_type": data.get("life_insurance_type"),
                    "updated_at": datetime.now().isoformat()
                }
            
            if "health_insurance_amount" in data:
                user["risk_protection"]["health_insurance"] = {
                    "coverage_amount": data["health_insurance_amount"], 
                    "coverage_type": data.get("health_insurance_type"),
                    "updated_at": datetime.now().isoformat()
                }
                
        elif category == "Liabilities & Credit":
            # Initialize liabilities if it doesn't exist
            if "liabilities" not in user:
                user["liabilities"] = {}
            
            # Update debt and credit data
            if "credit_score" in data:
                user["liabilities"]["credit_score"] = {
                    "score": data["credit_score"],
                    "source": data.get("credit_score_source"),
                    "updated_at": datetime.now().isoformat()
                }
            
            if "home_loan_emi" in data:
                user["liabilities"]["home_loan"] = {
                    "monthly_emi": data["home_loan_emi"],
                    "updated_at": datetime.now().isoformat()
                }
            
            if "personal_loan_emi" in data:
                user["liabilities"]["personal_loan"] = {
                    "monthly_emi": data["personal_loan_emi"],
                    "updated_at": datetime.now().isoformat()
                }
            
            if "credit_card_outstanding" in data:
                user["liabilities"]["credit_card"] = {
                    "outstanding_amount": data["credit_card_outstanding"],
                    "updated_at": datetime.now().isoformat()
                }
                
        elif category == "Tax Efficiency & Estate":
            # Initialize tax_planning if it doesn't exist
            if "tax_planning" not in user:
                user["tax_planning"] = {}
            
            # Update tax planning data
            if "section_80c_investments" in data:
                user["tax_planning"]["section_80c"] = {
                    "annual_investment": data["section_80c_investments"],
                    "updated_at": datetime.now().isoformat()
                }
            
            if "nps_contributions" in data:
                user["tax_planning"]["nps"] = {
                    "annual_contribution": data["nps_contributions"],
                    "updated_at": datetime.now().isoformat()
                }
            
            if "section_80d_premium" in data:
                user["tax_planning"]["section_80d"] = {
                    "annual_premium": data["section_80d_premium"],
                    "updated_at": datetime.now().isoformat()
                }
        
        # Save updated user data to file
        try:
            users_file = "data/users.json"
            users = load_users()
            
            # Find and update the user in the list
            user_index = None
            for i, u in enumerate(users):
                if u.get('id') == user_id:
                    user_index = i
                    break
            
            if user_index is not None:
                users[user_index] = user
                
                # Save updated users data back to JSON file
                with open(users_file, 'w') as f:
                    json.dump(users, f, indent=2)
            else:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "success": False,
                        "error": "User not found for update",
                        "code": "USER_NOT_FOUND"
                    }
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "success": False,
                    "error": f"Failed to save user data: {str(e)}",
                    "code": "SAVE_FAILED"
                }
            )
        
        return {
            "success": True,
            "message": f"{category} data updated successfully",
            "updated_data": data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to update financial health data",
                "code": "SERVER_ERROR"
            }
        )