"""
Demo User Profiles - All 5 distinct demo users for AI Wealth Advisor
Each user represents different demographics, risk profiles, and investment approaches
"""

from typing import Dict, Any, List

# User 1: Priya Sharma - Conservative Software Engineer
priya_sharma = {
    "id": "priya-sharma",
    "credentials": {
        "email": "priya.sharma@email.com",
        "username": "priya.sharma",
        "password": "demo123"
    },
    "user_profile": {
        "name": "Priya Sharma",
        "age": 28,
        "profession": "Software Engineer",
        "location": "Bangalore, Karnataka",
        "company": "Tech Solutions Pvt Ltd",
        "experience": "5 years",
        "education": "B.Tech Computer Science",
        "phone": "+91-9876543210",
        "email": "priya.sharma@email.com"
    },
    "financial_profile": {
        "monthly_salary": 120000,  # ₹1.2L per month
        "annual_ctc": 1600000,     # ₹16L CTC
        "take_home": 100000,       # ₹1L after taxes and deductions
        "monthly_expenses": 75000,
        "savings_rate": 25.0,
        "bonus_frequency": "annual",
        "last_bonus": 150000,
        "other_income": 5000
    },
    "investment_profile": {
        "risk_tolerance": "conservative",
        "investment_experience": "beginner", 
        "investment_horizon": "long_term",
        "preferred_instruments": ["mutual_funds", "ppf", "elss"],
        "investment_knowledge_score": 5,
        "started_investing": "2023-06-01"
    },
    "risk_profile": "conservative",
    "portfolio_target_amount": 550000
}

# User 2: Rajesh Kumar - Aggressive Business Owner
rajesh_kumar = {
    "id": "rajesh-kumar",
    "credentials": {
        "email": "rajesh.kumar@email.com",
        "username": "rajesh.kumar", 
        "password": "demo123"
    },
    "user_profile": {
        "name": "Rajesh Kumar",
        "age": 35,
        "profession": "Business Owner",
        "location": "Mumbai, Maharashtra",
        "company": "Kumar Enterprises Pvt Ltd",
        "experience": "12 years",
        "education": "MBA Finance",
        "phone": "+91-9876543211",
        "email": "rajesh.kumar@email.com"
    },
    "financial_profile": {
        "monthly_salary": 200000,  # ₹2L per month
        "annual_ctc": 2500000,     # ₹25L CTC
        "take_home": 180000,       # ₹1.8L after taxes
        "monthly_expenses": 120000,
        "savings_rate": 33.3,
        "bonus_frequency": "quarterly",
        "last_bonus": 300000,
        "other_income": 25000  # Business income
    },
    "investment_profile": {
        "risk_tolerance": "aggressive",
        "investment_experience": "advanced",
        "investment_horizon": "long_term", 
        "preferred_instruments": ["stocks", "mutual_funds", "international_funds"],
        "investment_knowledge_score": 9,
        "started_investing": "2018-01-01"
    },
    "risk_profile": "aggressive",
    "portfolio_target_amount": 1400000
}

# User 3: Dr. Anita Desai - Moderate Medical Professional
anita_desai = {
    "id": "anita-desai",
    "credentials": {
        "email": "anita.desai@email.com",
        "username": "anita.desai",
        "password": "demo123"
    },
    "user_profile": {
        "name": "Dr. Anita Desai",
        "age": 32,
        "profession": "Medical Doctor",
        "location": "Delhi, NCR",
        "company": "Apollo Hospitals",
        "experience": "8 years",
        "education": "MBBS, MD",
        "phone": "+91-9876543212",
        "email": "anita.desai@email.com"
    },
    "financial_profile": {
        "monthly_salary": 150000,  # ₹1.5L per month
        "annual_ctc": 2000000,     # ₹20L CTC
        "take_home": 130000,       # ₹1.3L after taxes
        "monthly_expenses": 90000,
        "savings_rate": 30.8,
        "bonus_frequency": "annual",
        "last_bonus": 200000,
        "other_income": 15000  # Private practice
    },
    "investment_profile": {
        "risk_tolerance": "moderate",
        "investment_experience": "intermediate",
        "investment_horizon": "medium_term",
        "preferred_instruments": ["mutual_funds", "stocks", "bonds", "ppf"],
        "investment_knowledge_score": 7,
        "started_investing": "2020-03-01"
    },
    "risk_profile": "moderate",
    "portfolio_target_amount": 980000
}

# User 4: Arjun Singh - Young Aggressive Tech Professional
arjun_singh = {
    "id": "arjun-singh",
    "credentials": {
        "email": "arjun.singh@email.com",
        "username": "arjun.singh",
        "password": "demo123"
    },
    "user_profile": {
        "name": "Arjun Singh",
        "age": 26,
        "profession": "Software Developer",
        "location": "Pune, Maharashtra",
        "company": "Infosys Limited",
        "experience": "3 years",
        "education": "B.Tech IT",
        "phone": "+91-9876543213",
        "email": "arjun.singh@email.com"
    },
    "financial_profile": {
        "monthly_salary": 95000,   # ₹95K per month
        "annual_ctc": 1300000,     # ₹13L CTC
        "take_home": 80000,        # ₹80K after taxes
        "monthly_expenses": 55000,
        "savings_rate": 31.3,
        "bonus_frequency": "annual",
        "last_bonus": 100000,
        "other_income": 8000  # Freelancing
    },
    "investment_profile": {
        "risk_tolerance": "aggressive",
        "investment_experience": "intermediate",
        "investment_horizon": "long_term",
        "preferred_instruments": ["stocks", "mutual_funds", "crypto", "international_funds"],
        "investment_knowledge_score": 6,
        "started_investing": "2022-01-01"
    },
    "risk_profile": "aggressive",
    "portfolio_target_amount": 320000
}

# User 5: Meera Patel - Conservative Senior Manager
meera_patel = {
    "id": "meera-patel", 
    "credentials": {
        "email": "meera.patel@email.com",
        "username": "meera.patel",
        "password": "demo123"
    },
    "user_profile": {
        "name": "Meera Patel",
        "age": 38,
        "profession": "Senior Manager",
        "location": "Ahmedabad, Gujarat",
        "company": "L&T Infotech",
        "experience": "15 years",
        "education": "MBA Operations",
        "phone": "+91-9876543214",
        "email": "meera.patel@email.com"
    },
    "financial_profile": {
        "monthly_salary": 175000,  # ₹1.75L per month
        "annual_ctc": 2300000,     # ₹23L CTC
        "take_home": 145000,       # ₹1.45L after taxes
        "monthly_expenses": 110000,
        "savings_rate": 24.1,
        "bonus_frequency": "annual",
        "last_bonus": 250000,
        "other_income": 10000  # Consultancy
    },
    "investment_profile": {
        "risk_tolerance": "conservative",
        "investment_experience": "advanced",
        "investment_horizon": "medium_term",
        "preferred_instruments": ["mutual_funds", "ppf", "bonds", "fd"],
        "investment_knowledge_score": 8,
        "started_investing": "2015-01-01"
    },
    "risk_profile": "conservative",
    "portfolio_target_amount": 1200000
}

# Monthly expenses breakdown for each user
monthly_expenses = {
    "priya-sharma": {
        "rent": 25000,
        "food_dining": 12000,
        "transportation": 8000,
        "utilities": 3000,
        "entertainment": 6000,
        "shopping": 8000,
        "healthcare": 2000,
        "insurance": 4000,
        "subscriptions": 2000,
        "miscellaneous": 5000,
        "total": 75000
    },
    "rajesh-kumar": {
        "rent": 40000,  # Higher rent for business owner
        "food_dining": 20000,
        "transportation": 15000,  # Car EMI + fuel
        "utilities": 5000,
        "entertainment": 15000,
        "shopping": 12000,
        "healthcare": 5000,
        "insurance": 8000,
        "subscriptions": 3000,
        "miscellaneous": 10000,
        "total": 120000
    },
    "anita-desai": {
        "rent": 30000,
        "food_dining": 15000,
        "transportation": 12000,
        "utilities": 4000,
        "entertainment": 8000,
        "shopping": 10000,
        "healthcare": 3000,
        "insurance": 6000,
        "subscriptions": 2000,
        "miscellaneous": 8000,
        "total": 90000
    },
    "arjun-singh": {
        "rent": 15000,  # Lower rent for young professional
        "food_dining": 8000,
        "transportation": 5000,
        "utilities": 2000,
        "entertainment": 8000,
        "shopping": 5000,
        "healthcare": 1500,
        "insurance": 2500,
        "subscriptions": 3000,  # Tech subscriptions
        "miscellaneous": 5000,
        "total": 55000
    },
    "meera-patel": {
        "rent": 35000,
        "food_dining": 18000,  # Family expenses
        "transportation": 12000,
        "utilities": 6000,
        "entertainment": 10000,
        "shopping": 15000,
        "healthcare": 4000,
        "insurance": 7000,
        "subscriptions": 2000,
        "miscellaneous": 8000,
        "total": 110000
    }
}

# Banking details for each user
banking_details = {
    "priya-sharma": {
        "primary_bank": "HDFC Bank",
        "salary_account": "HDFC Bank",
        "savings_balance": 250000,
        "fd_amount": 100000,
        "emergency_fund_target": 450000,  # 6 months expenses
        "current_emergency_fund": 200000
    },
    "rajesh-kumar": {
        "primary_bank": "ICICI Bank",
        "salary_account": "ICICI Bank", 
        "savings_balance": 500000,
        "fd_amount": 300000,
        "emergency_fund_target": 720000,  # 6 months expenses
        "current_emergency_fund": 600000
    },
    "anita-desai": {
        "primary_bank": "SBI",
        "salary_account": "SBI",
        "savings_balance": 400000,
        "fd_amount": 200000,
        "emergency_fund_target": 540000,  # 6 months expenses
        "current_emergency_fund": 350000
    },
    "arjun-singh": {
        "primary_bank": "Axis Bank",
        "salary_account": "Axis Bank",
        "savings_balance": 150000,
        "fd_amount": 50000,
        "emergency_fund_target": 330000,  # 6 months expenses
        "current_emergency_fund": 120000
    },
    "meera-patel": {
        "primary_bank": "HDFC Bank",
        "salary_account": "HDFC Bank",
        "savings_balance": 600000,
        "fd_amount": 400000,
        "emergency_fund_target": 660000,  # 6 months expenses
        "current_emergency_fund": 500000
    }
}

# All demo users list
all_demo_users = [
    priya_sharma,
    rajesh_kumar,
    anita_desai,
    arjun_singh,
    meera_patel
]

def get_demo_user_by_id(user_id: str) -> Dict[str, Any]:
    """Get demo user by ID"""
    for user in all_demo_users:
        if user["id"] == user_id:
            # Add expenses and banking details
            user_data = user.copy()
            user_data["monthly_expenses"] = monthly_expenses.get(user_id, {})
            user_data["banking"] = banking_details.get(user_id, {})
            return user_data
    return None

def get_demo_user_by_email(email: str) -> Dict[str, Any]:
    """Get demo user by email"""
    for user in all_demo_users:
        if user["credentials"]["email"] == email:
            # Add expenses and banking details
            user_data = user.copy()
            user_data["monthly_expenses"] = monthly_expenses.get(user["id"], {})
            user_data["banking"] = banking_details.get(user["id"], {})
            return user_data
    return None

def get_all_demo_users() -> List[Dict[str, Any]]:
    """Get all demo users with complete data"""
    complete_users = []
    for user in all_demo_users:
        user_data = user.copy()
        user_data["monthly_expenses"] = monthly_expenses.get(user["id"], {})
        user_data["banking"] = banking_details.get(user["id"], {})
        complete_users.append(user_data)
    return complete_users