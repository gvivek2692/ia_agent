"""
File upload API endpoints for PDF parsing
"""

import os
import tempfile
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from models.portfolio import UploadRequest, UploadResponse
from services.upload_service import UploadService

router = APIRouter()
upload_service = UploadService()


@router.post("/upload/mf-statement")
async def upload_mf_statement(
    file: UploadFile = File(...),
    username: str = Form(...),
    password: str = Form(...),
    pdfPassword: Optional[str] = Form(None)
):
    """Upload and parse mutual fund statement PDF"""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "Only PDF files are allowed",
                "code": "INVALID_FILE_TYPE"
            }
        )
    
    # Validate file size (10MB limit)
    max_size = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": "File size exceeds 10MB limit",
                "code": "FILE_TOO_LARGE"
            }
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Check if user already exists
        if upload_service.check_user_exists(username):
            raise HTTPException(
                status_code=409,
                detail={
                    "success": False,
                    "error": "Username already exists",
                    "code": "USER_EXISTS"
                }
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Parse PDF file
            parse_result = await upload_service.parse_pdf_file(temp_file_path, pdfPassword)
            
            if not parse_result["success"]:
                status_code = 400
                if parse_result.get("code") in ["WRONG_PASSWORD", "PASSWORD_REQUIRED"]:
                    status_code = 400
                
                raise HTTPException(
                    status_code=status_code,
                    detail={
                        "success": False,
                        "error": parse_result["error"],
                        "code": parse_result.get("code", "PARSE_ERROR")
                    }
                )
            
            # Extract user profile
            user_profile = upload_service.extract_user_profile(
                parse_result["investor_info"], 
                parse_result["transactions"]
            )
            
            # Generate portfolio
            portfolio = upload_service.generate_portfolio(
                parse_result["transactions"], 
                parse_result["full_text"]
            )
            
            # Create user account
            create_result = await upload_service.create_user(
                user_profile, username, password, portfolio
            )
            
            if not create_result["success"]:
                raise HTTPException(
                    status_code=500,
                    detail={
                        "success": False,
                        "error": create_result["error"],
                        "code": "USER_CREATION_ERROR"
                    }
                )
            
            return {
                "success": True,
                "message": "Account created successfully",
                "userId": create_result["userId"],
                "portfolio": {
                    "totalSchemes": len(portfolio["mutual_funds"]),
                    "totalInvestment": portfolio["summary"]["total_investment"],
                    "totalCurrentValue": portfolio["summary"]["total_current_value"],
                    "totalGainLoss": portfolio["summary"]["total_gain_loss"],
                    "gainLossPercentage": portfolio["summary"]["gain_loss_percentage"]
                }
            }
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": f"File processing failed: {str(e)}",
                "code": "PROCESSING_ERROR"
            }
        )


@router.post("/check-username")
async def check_username_availability(request: dict):
    """Check if username is available"""
    try:
        username = request.get("username")
        
        if not username:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Username is required"
                }
            )
        
        exists = upload_service.check_user_exists(username)
        
        return {
            "success": True,
            "available": not exists,
            "message": "Username is already taken" if exists else "Username is available"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Failed to check username availability"
            }
        )