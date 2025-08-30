"""
Authentication API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional

from models.user import UserLogin, APIResponse
from shared_services import auth_service

router = APIRouter()


@router.post("/login")
async def login(login_data: UserLogin):
    """Login user and return access token"""
    try:
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"Login attempt for email: {login_data.email}")
        
        result = await auth_service.login(login_data)
        logger.info(f"Auth service result: {result}")
        
        if result["success"]:
            return result
        else:
            raise HTTPException(
                status_code=401 if result.get("code") == "INVALID_PASSWORD" else 400,
                detail=result
            )
    
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Login error: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "code": "SERVER_ERROR"
            }
        )


@router.post("/logout")
async def logout(x_session_id: Optional[str] = Header(None)):
    """Logout user and invalidate session"""
    try:
        if not x_session_id:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Session ID required",
                    "code": "MISSING_SESSION_ID"
                }
            )
        
        result = await auth_service.logout(x_session_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(
                status_code=404,
                detail=result
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Internal server error",
                "code": "SERVER_ERROR"
            }
        )


@router.get("/verify")
async def verify_token(authorization: Optional[str] = Header(None), 
                      x_session_id: Optional[str] = Header(None)):
    """Verify token or session"""
    
    if authorization:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        result = auth_service.verify_token(token)
        return result
    
    if x_session_id:
        result = auth_service.get_session(x_session_id)
        return result
    
    raise HTTPException(
        status_code=400,
        detail={
            "success": False,
            "error": "Token or session ID required",
            "code": "MISSING_AUTH"
        }
    )


@router.get("/session")
async def get_session(x_session_id: Optional[str] = Header(None)):
    """Get session information"""
    if not x_session_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "Session ID required",
                "code": "MISSING_SESSION_ID"
            }
        )
    
    result = auth_service.get_user_by_session(x_session_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(
            status_code=404,
            detail=result
        )