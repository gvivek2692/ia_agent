#!/usr/bin/env python3
"""
Demo Users Initialization Script
Populates the Python backend with all 5 demo users from the JavaScript backend
"""

import os
import sys
import json
import bcrypt
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.demo_users_profiles import get_all_demo_users
from data.personalized_portfolios import get_complete_portfolio_data
from data.demo_financial_goals import get_financial_goals_by_user_id

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_full_user_record(demo_user: Dict[str, Any]) -> Dict[str, Any]:
    """Create a complete user record with portfolio and financial goals"""
    
    # Generate personalized portfolio
    portfolio_data = get_complete_portfolio_data(
        demo_user["risk_profile"],
        demo_user["portfolio_target_amount"]
    )
    
    # Get financial goals
    financial_goals = get_financial_goals_by_user_id(demo_user["id"])
    
    # Create complete user record
    user_record = {
        "id": demo_user["id"],
        "credentials": {
            "email": demo_user["credentials"]["email"],
            "username": demo_user["credentials"]["username"],
            "password": hash_password(demo_user["credentials"]["password"])
        },
        "user_profile": {
            **demo_user["user_profile"],
            "created_at": datetime.now().isoformat()
        },
        "financial_profile": demo_user["financial_profile"],
        "investment_profile": demo_user["investment_profile"],
        "portfolio": portfolio_data,
        "financial_goals": financial_goals,
        "monthly_expenses": demo_user["monthly_expenses"],
        "banking": demo_user["banking"],
        "recent_transactions": []
    }
    
    return user_record

def load_existing_users(users_file: str) -> List[Dict[str, Any]]:
    """Load existing users from JSON file"""
    if not os.path.exists(users_file):
        return []
    
    try:
        with open(users_file, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_users(users: List[Dict[str, Any]], users_file: str):
    """Save users to JSON file"""
    # Ensure data directory exists
    os.makedirs(os.path.dirname(users_file), exist_ok=True)
    
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2, default=str)

def remove_existing_demo_users(users: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove existing demo users to avoid duplicates"""
    demo_emails = {
        "demo", "priya.sharma@email.com", "rajesh.kumar@email.com",
        "anita.desai@email.com", "arjun.singh@email.com", "meera.patel@email.com"
    }
    
    demo_ids = {
        "priya-sharma", "rajesh-kumar", "anita-desai", 
        "arjun-singh", "meera-patel"
    }
    
    # Filter out existing demo users
    filtered_users = []
    for user in users:
        user_email = user.get('credentials', {}).get('email', '')
        user_id = user.get('id', '')
        
        if user_email not in demo_emails and user_id not in demo_ids:
            filtered_users.append(user)
        else:
            print(f"Removing existing demo user: {user_email} ({user_id})")
    
    return filtered_users

def initialize_demo_users():
    """Main function to initialize all demo users"""
    print("🚀 Initializing Demo Users for Python Backend...")
    
    users_file = "data/users.json"
    
    # Load existing users
    existing_users = load_existing_users(users_file)
    print(f"📋 Loaded {len(existing_users)} existing users")
    
    # Remove existing demo users
    cleaned_users = remove_existing_demo_users(existing_users)
    print(f"🧹 Cleaned users count: {len(cleaned_users)}")
    
    # Get all demo users
    demo_users = get_all_demo_users()
    print(f"👥 Found {len(demo_users)} demo user profiles")
    
    # Create full user records
    new_users = []
    for demo_user in demo_users:
        print(f"🔨 Creating user record for {demo_user['user_profile']['name']} ({demo_user['credentials']['email']})")
        user_record = create_full_user_record(demo_user)
        new_users.append(user_record)
        
        print(f"   ✅ Portfolio: ₹{user_record['portfolio']['summary']['total_current_value']:,}")
        print(f"   ✅ Goals: {len(user_record['financial_goals']['goals'])} financial goals")
        print(f"   ✅ Risk Profile: {demo_user['risk_profile']}")
    
    # Combine cleaned existing users with new demo users
    all_users = cleaned_users + new_users
    
    # Save to file
    save_users(all_users, users_file)
    print(f"💾 Saved {len(all_users)} users to {users_file}")
    
    # Summary
    print("\n📊 Demo Users Summary:")
    print("=" * 60)
    for user in new_users:
        profile = user['user_profile']
        portfolio = user['portfolio']['summary']
        goals = user['financial_goals']['goals_summary']
        
        print(f"👤 {profile['name']} ({user['credentials']['email']})")
        print(f"   📍 {profile['location']} | {profile['profession']} | Age {profile['age']}")
        print(f"   💰 Portfolio: ₹{portfolio['total_current_value']:,} ({portfolio['gain_loss_percentage']:+.2f}%)")
        print(f"   🎯 Goals: {len(user['financial_goals']['goals'])} active goals")
        print(f"   📈 Risk: {user['investment_profile']['risk_tolerance'].title()}")
        print()
    
    print("🎉 All demo users have been successfully initialized!")
    print("\n🔑 Login Credentials:")
    print("   Password for all demo accounts: 'demo123'")
    print("\n📧 Demo User Emails:")
    for user in new_users:
        print(f"   • {user['credentials']['email']}")

if __name__ == "__main__":
    try:
        initialize_demo_users()
    except Exception as e:
        print(f"❌ Error initializing demo users: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)