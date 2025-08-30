#!/usr/bin/env python3
"""
Script to create a demo user account
"""

import json
import bcrypt
from datetime import datetime
import uuid

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_demo_user():
    # Load existing users
    try:
        with open('data/users.json', 'r') as f:
            users = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        users = []
    
    # Demo users to create
    demo_users = [
        {
            "email": "demo",
            "name": "Demo User",
            "password": "demo123"
        },
        {
            "email": "demo",
            "name": "Simple Demo",
            "password": "demo"
        },
        {
            "email": "demo@example.com",
            "name": "Demo User",
            "password": "demo123"
        },
        {
            "email": "priya.sharma@email.com", 
            "name": "Priya Sharma",
            "password": "demo123"
        },
        {
            "email": "rajesh.kumar@email.com",
            "name": "Rajesh Kumar",
            "password": "demo123"
        }
    ]
    
    for demo_info in demo_users:
        # Check if demo user already exists with same email AND password
        user_exists = any(
            user.get('credentials', {}).get('email') == demo_info["email"] and
            bcrypt.checkpw(demo_info["password"].encode('utf-8'), user.get('credentials', {}).get('password', '').encode('utf-8'))
            for user in users
        )
        
        if user_exists:
            print(f"Demo user {demo_info['email']} with password {demo_info['password']} already exists!")
            continue
    
        # Create demo user
        demo_user = {
            "id": str(uuid.uuid4()),
            "credentials": {
                "email": demo_info["email"],
                "username": demo_info["email"],
                "password": hash_password(demo_info["password"])
            },
            "user_profile": {
                "name": demo_info["name"],
                "age": 28,
                "profession": "Software Engineer", 
                "location": "Bangalore, Karnataka",
                "phone": "+91-9876543210",
                "email": demo_info["email"],
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
                    "elss": {"value": 15072, "percentage": 2.4},
                    "ppf": {"value": 185000, "percentage": 29.1},
                    "epf": {"value": 125000, "percentage": 19.7}
                }
            },
            "stocks": [
                {
                    "symbol": "INFY",
                    "company_name": "Infosys Limited",
                    "quantity": 15,
                    "avg_purchase_price": 1450,
                    "current_price": 1520,
                    "investment_amount": 21750,
                    "current_value": 22800,
                    "gain_loss": 1050,
                    "gain_loss_percentage": 4.83,
                    "sector": "Information Technology"
                },
                {
                    "symbol": "HDFCBANK",
                    "company_name": "HDFC Bank Limited",
                    "quantity": 8,
                    "avg_purchase_price": 1680,
                    "current_price": 1750,
                    "investment_amount": 13440,
                    "current_value": 14000,
                    "gain_loss": 560,
                    "gain_loss_percentage": 4.17,
                    "sector": "Banking"
                }
            ],
            "mutual_funds": [
                {
                    "scheme_name": "SBI Bluechip Fund - Direct Growth",
                    "scheme_code": "SBI-BC-DG",
                    "units": 450.75,
                    "nav": 78.50,
                    "current_value": 35384,
                    "investment_amount": 32000,
                    "gain_loss": 3384,
                    "gain_loss_percentage": 10.58,
                    "fund_category": "Large Cap",
                    "sip_amount": 8000
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
                    "target_date": "2024-12-31",
                    "priority": "High"
                }
            ]
        },
        "recent_transactions": []
    }
    
        # Add demo user to users list
        users.append(demo_user)
        print(f"Demo user created: {demo_info['email']} | Password: {demo_info['password']} | ID: {demo_user['id']}")
    
    # Save updated users
    with open('data/users.json', 'w') as f:
        json.dump(users, f, indent=2, default=str)
    
    print(f"All demo users processed successfully!")

if __name__ == "__main__":
    create_demo_user()