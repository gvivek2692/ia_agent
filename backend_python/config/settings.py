"""
Application settings and configuration management
"""

import os
from functools import lru_cache
from typing import Optional
try:
    from pydantic import BaseSettings
except ImportError:
    from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    app_name: str = "AI Wealth Advisor API"
    debug: bool = False
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 3001
    
    # API Keys
    openai_api_key: Optional[str] = None
    serper_api_key: Optional[str] = None
    kite_api_key: Optional[str] = None
    kite_api_secret: Optional[str] = None
    
    # JWT Configuration
    jwt_secret_key: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    
    # CORS Configuration
    allowed_origins: list = [
        "http://localhost:3000",
        "https://localhost:3000",
        "https://ia-agent-aguf.onrender.com",
        "https://ia-agent-wine.vercel.app"
    ]
    
    # File Upload Configuration
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    upload_directory: str = "uploads"
    
    # Database Configuration (if needed later)
    database_url: Optional[str] = None
    
    # Logging Configuration
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()