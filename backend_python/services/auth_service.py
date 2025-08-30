"""
Authentication service for user management and JWT tokens
"""

import os
import json
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from jose import JWTError, jwt
from fastapi import HTTPException, status

from models.user import User, UserLogin, TokenResponse, Credentials
from config.settings import get_settings

settings = get_settings()


class AuthService:
    def __init__(self):
        self.users_file = "data/users.json"
        self.active_sessions = {}
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.users_file), exist_ok=True)
        
        # Create users file if it doesn't exist
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump([], f)
    
    def _load_users(self) -> List[Dict[str, Any]]:
        """Load users from JSON file"""
        try:
            with open(self.users_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save_users(self, users: List[Dict[str, Any]]):
        """Save users to JSON file"""
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def _verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def _create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.jwt_access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        
        return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        users = self._load_users()
        for user in users:
            if user.get('credentials', {}).get('email') == email:
                return user
        return None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        users = self._load_users()
        for user in users:
            if user.get('id') == user_id:
                return user
        return None
    
    async def login(self, login_data: UserLogin) -> Dict[str, Any]:
        """Authenticate user and return token"""
        user = self.get_user_by_email(login_data.email)
        
        if not user:
            return {
                "success": False,
                "error": "User not found",
                "code": "USER_NOT_FOUND"
            }
        
        # Verify password
        stored_password_hash = user.get('credentials', {}).get('password')
        password_valid = self._verify_password(login_data.password, stored_password_hash)
        
        # Special handling for demo accounts - allow "demo123" password for all demo users
        if not password_valid and login_data.email in [
            "demo", "priya.sharma@email.com", "rajesh.kumar@email.com", 
            "anita.desai@email.com", "arjun.singh@email.com", "meera.patel@email.com"
        ]:
            if login_data.password in ["demo", "demo123"]:
                password_valid = True
        
        if not password_valid:
            return {
                "success": False,
                "error": "Invalid password",
                "code": "INVALID_PASSWORD"
            }
        
        # Create access token
        access_token = self._create_access_token(
            data={"sub": user['id'], "email": login_data.email}
        )
        
        # Store session
        session_id = f"session_{user['id']}_{int(datetime.now().timestamp())}"
        self.active_sessions[session_id] = {
            "user_id": user['id'],
            "email": login_data.email,
            "login_time": datetime.now().isoformat(),
            "token": access_token
        }
        
        # Build complete user profile for frontend
        user_profile = user.get('user_profile', {})
        investment_profile = user.get('investment_profile', {})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_access_token_expire_minutes * 60,
            "user": {
                "id": user['id'],
                "name": user_profile.get('name', 'User'),
                "email": login_data.email,
                "profession": user_profile.get('profession', 'Professional'),
                "location": user_profile.get('location', 'Location'),
                "age": user_profile.get('age', 25),
                "experience_level": investment_profile.get('investment_experience', 'Beginner'),
                "risk_tolerance": investment_profile.get('risk_tolerance', 'Moderate')
            },
            "session_id": session_id
        }
    
    async def logout(self, session_id: str) -> Dict[str, Any]:
        """Logout user and invalidate session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return {
                "success": True,
                "message": "Logged out successfully"
            }
        
        return {
            "success": False,
            "error": "Session not found",
            "code": "SESSION_NOT_FOUND"
        }
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token and return user data"""
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
            user_id: str = payload.get("sub")
            email: str = payload.get("email")
            
            if user_id is None or email is None:
                return {
                    "success": False,
                    "error": "Invalid token payload",
                    "code": "INVALID_TOKEN"
                }
            
            user = self.get_user_by_id(user_id)
            if not user:
                return {
                    "success": False,
                    "error": "User not found",
                    "code": "USER_NOT_FOUND"
                }
            
            return {
                "success": True,
                "user": {
                    "id": user['id'],
                    "name": user['user_profile']['name'],
                    "email": email
                }
            }
        
        except JWTError:
            return {
                "success": False,
                "error": "Token validation failed",
                "code": "TOKEN_INVALID"
            }
    
    def get_session(self, session_id: str) -> Dict[str, Any]:
        """Get session data"""
        session = self.active_sessions.get(session_id)
        
        if not session:
            return {
                "success": False,
                "error": "Session not found",
                "code": "SESSION_NOT_FOUND"
            }
        
        user = self.get_user_by_id(session['user_id'])
        if not user:
            return {
                "success": False,
                "error": "User not found",
                "code": "USER_NOT_FOUND"
            }
        
        return {
            "success": True,
            "session": session,
            "user": {
                "id": user['id'],
                "name": user['user_profile']['name'],
                "email": session['email']
            }
        }
    
    def get_user_by_session(self, session_id: str) -> Dict[str, Any]:
        """Get user data by session ID"""
        return self.get_session(session_id)
    
    def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from token"""
        result = self.verify_token(token)
        if result.get("success"):
            return result.get("user")
        return None