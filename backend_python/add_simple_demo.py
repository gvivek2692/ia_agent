#!/usr/bin/env python3
"""
Add simple demo/demo account
"""

import json
import bcrypt
from datetime import datetime
import uuid

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def add_simple_demo():
    # Load existing users
    try:
        with open('data/users.json', 'r') as f:
            users = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        users = []
    
    # Create demo/demo user
    simple_demo_user = {
        "id": str(uuid.uuid4()),
        "credentials": {
            "email": "demo",
            "username": "demo",
            "password": hash_password("demo")
        },
        "user_profile": {
            "name": "Simple Demo",
            "age": 28,
            "profession": "Software Engineer",
            "location": "Bangalore, Karnataka",
            "phone": "+91-9876543210",
            "email": "demo",
            "created_at": datetime.now().isoformat()
        },
        "financial_profile": {
            "take_home": 100000,
            "monthly_expenses": 75000,
            "savings_rate": 25.0,
            "net_worth": 1450000,
            "emergency_fund": 350000,
            "emergency_fund_target": 600000
        },
        "investment_profile": {
            "risk_tolerance": "moderate",
            "investment_experience": "intermediate",
            "investment_horizon": "long_term",
            "preferred_instruments": ["mutual_funds", "stocks", "ppf", "elss"],
            "investment_knowledge_score": 7,
            "started_investing": "2021-03-01"
        },
        "portfolio": {
            "summary": {
                "total_current_value": 635270,
                "total_investment": 573850,
                "total_gain_loss": 61420,
                "gain_loss_percentage": 10.71,
                "asset_allocation": {
                    "stocks": {"value": 97770, "percentage": 15.4},
                    "mutual_funds": {"value": 141020, "percentage": 22.2},
                    "ppf": {"value": 185000, "percentage": 29.1},
                    "epf": {"value": 125000, "percentage": 19.7}
                }
            },
            "stocks": [
                {
                    "symbol": "INFY",
                    "company_name": "Infosys Limited",
                    "current_value": 22800,
                    "gain_loss_percentage": 4.83,
                    "sector": "Information Technology"
                }
            ],
            "mutual_funds": [
                {
                    "scheme_name": "SBI Bluechip Fund - Direct Growth",
                    "current_value": 35384,
                    "gain_loss_percentage": 10.58,
                    "fund_category": "Large Cap"
                }
            ]
        },
        "financial_goals": {
            "goals": [
                {
                    "id": "emergency_fund",
                    "name": "Emergency Fund",
                    "target_amount": 600000,
                    "current_amount": 350000,
                    "progress_percentage": 58.33,
                    "priority": "High"
                }
            ]
        },
        "recent_transactions": []
    }
    
    # Add to users list
    users.append(simple_demo_user)
    
    # Save updated users
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=2, default=str)
    
    print(f"Simple demo user created: demo/demo | ID: {simple_demo_user['id']}")

if __name__ == "__main__":
    add_simple_demo()