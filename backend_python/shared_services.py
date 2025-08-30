"""
Shared service instances to avoid circular dependencies
"""

from services.auth_service import AuthService
from services.demo_data_service import DemoDataService

# Create shared instances that can be imported by multiple routers
auth_service = AuthService()
demo_service = DemoDataService()