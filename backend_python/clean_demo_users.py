#!/usr/bin/env python3
"""
Clean and recreate demo users with proper credentials
"""

import json
import bcrypt
from datetime import datetime
import uuid

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def clean_and_create_demos():
    # Load existing users
    try:
        with open('data/users.json', 'r') as f:
            users = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        users = []
    
    # Remove existing demo users
    demo_emails = ["demo", "demo@example.com", "priya.sharma@email.com", "rajesh.kumar@email.com"]
    users = [user for user in users if user.get('credentials', {}).get('email') not in demo_emails]
    
    # Create final demo users
    demo_accounts = [
        {"email": "demo", "password": "demo", "name": "Demo User (demo/demo)"},
        {"email": "demo", "password": "demo123", "name": "Demo User (demo/demo123)"},  
        {"email": "demo@example.com", "password": "demo123", "name": "Demo User (@example)"},
        {"email": "priya.sharma@email.com", "password": "demo123", "name": "Priya Sharma"},
        {"email": "rajesh.kumar@email.com", "password": "demo123", "name": "Rajesh Kumar"}
    ]
    
    for account in demo_accounts:
        demo_user = {
            "id": str(uuid.uuid4()),
            "credentials": {
                "email": account["email"],
                "username": account["email"],
                "password": hash_password(account["password"])
            },
            "user_profile": {
                "name": account["name"],
                "age": 28,
                "profession": "Software Engineer",
                "location": "Bangalore, Karnataka", 
                "phone": "+91-9876543210",
                "email": account["email"],
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
        
        users.append(demo_user)
        print(f"Created: {account['email']} / {account['password']} | ID: {demo_user['id']}")
    
    # Save updated users
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=2, default=str)
    
    print(f"Demo users cleaned and recreated successfully!")

if __name__ == "__main__":
    clean_and_create_demos()