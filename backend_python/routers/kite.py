"""
Kite Connect integration API endpoints
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.kite_service import KiteService
from config.settings import get_settings

router = APIRouter()
settings = get_settings()

# In-memory storage for Kite sessions (use database in production)
kite_user_sessions = {}

try:
    kite_service = KiteService()
except Exception as e:
    kite_service = None
    print(f"Failed to initialize Kite service: {e}")


class KiteCallbackRequest(BaseModel):
    request_token: str


class KiteRefreshRequest(BaseModel):
    userId: str


@router.get("/status")
async def get_kite_status():
    """Get Kite Connect configuration status"""
    try:
        status = {
            "kite_service_available": kite_service is not None,
            "api_key": settings.kite_api_key or "Not configured",
            "api_secret_configured": bool(settings.kite_api_secret),
            "redirect_url_note": "Redirect URL is configured in Kite Connect dashboard, not in backend code",
            "kite_dashboard_config": {
                "dashboard_url": "https://developers.kite.trade/",
                "app_api_key": settings.kite_api_key,
                "current_redirect_url": "https://ia-agent-wine.vercel.app/",
                "note": "After Kite login, user will be redirected to the production URL configured in dashboard"
            },
            "instructions": {
                "development_mode_access": [
                    "1. Login to https://developers.kite.trade/",
                    f"2. Go to your app settings (API Key: {settings.kite_api_key or 'YOUR_API_KEY'})",
                    "3. Add test users to 'Test Users' list",
                    "4. Use the Zerodha User ID (not client ID)",
                    "5. User must have active Zerodha account"
                ],
                "production_mode": [
                    "1. Submit app for review to Zerodha",
                    "2. Wait for approval",
                    "3. App will work for all users after approval"
                ]
            }
        }
        
        return status
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to check Kite status"}
        )


@router.get("/login")
async def get_kite_login_url():
    """Get Kite Connect login URL"""
    try:
        if not kite_service:
            raise HTTPException(
                status_code=500,
                detail={"error": "Kite service not available"}
            )
        
        login_url = kite_service.get_login_url()
        return {"loginUrl": login_url}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate login URL"}
        )


@router.post("/callback")
async def kite_callback(request: KiteCallbackRequest):
    """Handle Kite Connect OAuth callback"""
    try:
        if not kite_service:
            raise HTTPException(
                status_code=500,
                detail={"error": "Kite service not available"}
            )
        
        # Generate session
        session_data = await kite_service.generate_session(request.request_token)
        
        # Set access token
        kite_service.set_access_token(session_data["accessToken"])
        
        # Fetch user profile and portfolio data
        kite_profile = await kite_service.get_user_profile()
        holdings = await kite_service.get_portfolio_holdings()
        mf_holdings = await kite_service.get_mutual_fund_holdings()
        
        # Transform to our portfolio format
        portfolio = kite_service.transform_kite_to_portfolio(holdings, mf_holdings, kite_profile)
        
        # Create user profile
        user_profile = kite_service.create_user_profile(kite_profile, session_data)
        
        # Create complete user context
        kite_user = {
            "id": f"kite-{session_data['userId']}",
            **user_profile,
            "portfolio": portfolio,
            "kite_session": {
                "access_token": session_data["accessToken"],
                "public_token": session_data.get("publicToken"),
                "user_id": session_data["userId"],
                "login_time": session_data["loginTime"]
            },
            "credentials": {
                "email": kite_profile.get("email", session_data.get("email")),
                "username": session_data.get("userShortname"),
                "provider": "kite"
            }
        }
        
        # Store user session
        kite_user_sessions[session_data["userId"]] = kite_user
        
        return {
            "success": True,
            "user": {
                "id": kite_user["id"],
                "name": kite_user["user_profile"]["name"],
                "email": kite_user["user_profile"]["email"],
                "kite_user_id": session_data["userId"]
            },
            "portfolio_summary": portfolio["summary"]
        }
    
    except Exception as e:
        # Provide specific error messages for common issues
        error_message = "Authentication failed"
        status_code = 500
        
        if "user is not enabled" in str(e):
            error_message = "User not enabled for this app"
            status_code = 403
        elif "Invalid token" in str(e):
            error_message = "Invalid request token"
            status_code = 400
        
        raise HTTPException(
            status_code=status_code,
            detail={
                "status": "error",
                "message": error_message,
                "details": str(e),
                "error_type": type(e).__name__,
                "data": None
            }
        )


@router.post("/refresh-portfolio")
async def refresh_kite_portfolio(request: KiteRefreshRequest):
    """Refresh Kite portfolio data"""
    try:
        user_id = request.userId
        
        if not user_id or not user_id.startswith('kite-'):
            raise HTTPException(
                status_code=400,
                detail={"error": "Valid Kite user ID is required"}
            )
        
        kite_user_id = user_id.replace('kite-', '')
        existing_user = kite_user_sessions.get(kite_user_id)
        
        if not existing_user:
            raise HTTPException(
                status_code=404,
                detail={"error": "Kite user session not found. Please login again."}
            )
        
        if not kite_service:
            raise HTTPException(
                status_code=500,
                detail={"error": "Kite service not available"}
            )
        
        # Set access token from stored session
        kite_service.set_access_token(existing_user["kite_session"]["access_token"])
        
        # Fetch fresh portfolio data
        holdings = await kite_service.get_portfolio_holdings()
        mf_holdings = await kite_service.get_mutual_fund_holdings()
        
        # Transform to our portfolio format
        portfolio = kite_service.transform_kite_to_portfolio(holdings, mf_holdings, existing_user["user_profile"])
        
        # Update user's portfolio in session
        existing_user["portfolio"] = portfolio
        existing_user["portfolio"]["summary"]["updated_at"] = datetime.now().isoformat()
        
        # Update session
        kite_user_sessions[kite_user_id] = existing_user
        
        return {
            "success": True,
            "message": "Portfolio refreshed successfully",
            "portfolio_summary": portfolio["summary"],
            "updated_at": portfolio["summary"]["updated_at"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # Handle specific Kite API errors
        if "TokenException" in str(e):
            raise HTTPException(
                status_code=401,
                detail={
                    "error": "Session expired",
                    "details": "Please login again to refresh your portfolio.",
                    "requires_reauth": True
                }
            )
        else:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to refresh portfolio",
                    "details": str(e)
                }
            )


@router.get("/user/{kite_user_id}")
async def get_kite_user(kite_user_id: str):
    """Get Kite user data"""
    try:
        user = kite_user_sessions.get(kite_user_id)
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail={"error": "User not found"}
            )
        
        # Return user without sensitive session data
        safe_user = {**user}
        if "kite_session" in safe_user:
            del safe_user["kite_session"]
        
        return safe_user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to fetch user data"}
        )