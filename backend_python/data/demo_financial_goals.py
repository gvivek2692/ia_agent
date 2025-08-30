"""
Demo Financial Goals - Personalized goals for each demo user
Different goals based on user demographics, age, profession, and financial situation
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta

def generate_goals_for_priya_sharma() -> Dict[str, Any]:
    """Conservative Software Engineer - Focus on security and steady growth"""
    return {
        "goals": [
            {
                "id": "emergency_fund",
                "name": "Emergency Fund",
                "description": "Build emergency fund covering 6 months of expenses",
                "category": "Security",
                "priority": "High",
                "target_amount": 450000,  # 6 months × ₹75K expenses
                "current_amount": 200000,
                "progress_percentage": 44.44,
                "target_date": "2024-12-31",
                "start_date": "2023-06-01",
                "monthly_target": 15000,
                "actual_monthly_savings": 12000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 15,
                    "months_remaining": 3,
                    "total_timeline_months": 18
                },
                "milestones": [
                    {"amount": 150000, "date": "2024-01-31", "status": "Achieved", "achieved_date": "2023-12-15"},
                    {"amount": 300000, "date": "2024-08-31", "status": "Pending"},
                    {"amount": 450000, "date": "2024-12-31", "status": "Pending"}
                ],
                "notes": "Slightly behind target but on reasonable track for completion.",
                "investment_strategy": "High-yield savings account and liquid funds"
            },
            {
                "id": "house_down_payment", 
                "name": "House Down Payment",
                "description": "Save for down payment of a 2BHK apartment in Bangalore",
                "category": "Property",
                "priority": "High",
                "target_amount": 1200000,  # ₹12L down payment for ₹60L property
                "current_amount": 280000,
                "progress_percentage": 23.33,
                "target_date": "2027-06-30",
                "start_date": "2023-06-01",
                "monthly_target": 25000,
                "actual_monthly_savings": 18000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 15,
                    "months_remaining": 33,
                    "total_timeline_months": 48
                },
                "milestones": [
                    {"amount": 300000, "date": "2024-12-31", "status": "Pending"},
                    {"amount": 600000, "date": "2025-12-31", "status": "Pending"},
                    {"amount": 900000, "date": "2026-12-31", "status": "Pending"},
                    {"amount": 1200000, "date": "2027-06-30", "status": "Pending"}
                ],
                "notes": "Conservative approach with balanced mutual funds and debt funds.",
                "investment_strategy": "Balanced mutual funds and debt funds with 4-year horizon"
            },
            {
                "id": "retirement_planning",
                "name": "Retirement Corpus",
                "description": "Build retirement corpus for financial independence by age 55",
                "category": "Retirement", 
                "priority": "Medium",
                "target_amount": 30000000,  # ₹3 Crore target (conservative)
                "current_amount": 150000,
                "progress_percentage": 0.50,
                "target_date": "2051-06-01",
                "start_date": "2023-06-01",
                "monthly_target": 10000,
                "actual_monthly_savings": 8000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 15,
                    "months_remaining": 309,  # 27 years
                    "total_timeline_months": 324
                },
                "milestones": [
                    {"amount": 500000, "date": "2026-06-30", "status": "Pending"},
                    {"amount": 2000000, "date": "2035-06-30", "status": "Pending"},
                    {"amount": 10000000, "date": "2045-06-30", "status": "Pending"},
                    {"amount": 30000000, "date": "2051-06-01", "status": "Pending"}
                ],
                "notes": "Long-term conservative approach with gradual increase in contributions.",
                "investment_strategy": "Conservative equity mutual funds, PPF, EPF"
            }
        ],
        "goals_summary": {
            "total_target_amount": 31650000,
            "total_current_amount": 630000,
            "overall_progress_percentage": 1.99,
            "monthly_savings_target": 50000,
            "actual_monthly_savings": 38000,
            "goals_on_track": 1,
            "goals_behind_schedule": 2
        }
    }

def generate_goals_for_rajesh_kumar() -> Dict[str, Any]:
    """Aggressive Business Owner - Focus on wealth multiplication and business expansion"""
    return {
        "goals": [
            {
                "id": "business_expansion",
                "name": "Business Expansion Fund", 
                "description": "Capital for expanding business operations and new verticals",
                "category": "Business",
                "priority": "High",
                "target_amount": 5000000,  # ₹50L for business expansion
                "current_amount": 1500000,
                "progress_percentage": 30.0,
                "target_date": "2026-03-31",
                "start_date": "2023-01-01",
                "monthly_target": 100000,
                "actual_monthly_savings": 120000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 19,
                    "total_timeline_months": 39
                },
                "milestones": [
                    {"amount": 2000000, "date": "2024-12-31", "status": "Achieved", "achieved_date": "2024-11-15"},
                    {"amount": 3500000, "date": "2025-12-31", "status": "Pending"},
                    {"amount": 5000000, "date": "2026-03-31", "status": "Pending"}
                ],
                "notes": "Ahead of schedule due to higher business income. Excellent progress.",
                "investment_strategy": "High-growth mutual funds and direct equity"
            },
            {
                "id": "luxury_home",
                "name": "Luxury Home Purchase",
                "description": "Purchase premium 3BHK apartment in South Mumbai",
                "category": "Property",
                "priority": "High",
                "target_amount": 3000000,  # ₹30L down payment for ₹1.5Cr property
                "current_amount": 800000,
                "progress_percentage": 26.67,
                "target_date": "2027-12-31",
                "start_date": "2023-01-01",
                "monthly_target": 50000,
                "actual_monthly_savings": 45000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 40,
                    "total_timeline_months": 60
                },
                "milestones": [
                    {"amount": 1000000, "date": "2025-03-31", "status": "Pending"},
                    {"amount": 2000000, "date": "2026-12-31", "status": "Pending"},
                    {"amount": 3000000, "date": "2027-12-31", "status": "Pending"}
                ],
                "notes": "Mumbai property prices are rising. May need to increase monthly target.",
                "investment_strategy": "Mix of debt and equity funds for capital preservation"
            },
            {
                "id": "retirement_wealth",
                "name": "Wealth Creation for Early Retirement",
                "description": "Build substantial wealth for early retirement by age 50",
                "category": "Retirement",
                "priority": "Medium",
                "target_amount": 100000000,  # ₹10 Crore target (aggressive)
                "current_amount": 2500000,
                "progress_percentage": 2.50,
                "target_date": "2039-12-31",
                "start_date": "2023-01-01",
                "monthly_target": 50000,
                "actual_monthly_savings": 60000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 172,  # 15 years
                    "total_timeline_months": 192
                },
                "milestones": [
                    {"amount": 10000000, "date": "2030-12-31", "status": "Pending"},
                    {"amount": 30000000, "date": "2035-12-31", "status": "Pending"},
                    {"amount": 70000000, "date": "2038-12-31", "status": "Pending"},
                    {"amount": 100000000, "date": "2039-12-31", "status": "Pending"}
                ],
                "notes": "Aggressive growth strategy with high-risk high-reward investments.",
                "investment_strategy": "Growth stocks, mid-cap/small-cap funds, international equity"
            }
        ],
        "goals_summary": {
            "total_target_amount": 108000000,
            "total_current_amount": 4800000,
            "overall_progress_percentage": 4.44,
            "monthly_savings_target": 200000,
            "actual_monthly_savings": 225000,
            "goals_on_track": 2,
            "goals_behind_schedule": 1
        }
    }

def generate_goals_for_anita_desai() -> Dict[str, Any]:
    """Moderate Medical Professional - Balanced approach with healthcare and family focus"""
    return {
        "goals": [
            {
                "id": "emergency_medical_fund",
                "name": "Medical Emergency Fund",
                "description": "Enhanced emergency fund for medical professionals",
                "category": "Security",
                "priority": "High",
                "target_amount": 800000,  # Higher emergency fund for doctor
                "current_amount": 350000,
                "progress_percentage": 43.75,
                "target_date": "2025-06-30",
                "start_date": "2023-03-01",
                "monthly_target": 20000,
                "actual_monthly_savings": 18000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 17,
                    "months_remaining": 10,
                    "total_timeline_months": 27
                },
                "milestones": [
                    {"amount": 400000, "date": "2024-12-31", "status": "Pending"},
                    {"amount": 600000, "date": "2025-03-31", "status": "Pending"},
                    {"amount": 800000, "date": "2025-06-30", "status": "Pending"}
                ],
                "notes": "Higher emergency fund due to medical profession uncertainties.",
                "investment_strategy": "Liquid funds and high-yield savings accounts"
            },
            {
                "id": "children_education",
                "name": "Children's Education Fund",
                "description": "Education fund for future children's medical education",
                "category": "Education",
                "priority": "High",
                "target_amount": 5000000,  # ₹50L for medical education
                "current_amount": 600000,
                "progress_percentage": 12.0,
                "target_date": "2042-06-30",
                "start_date": "2023-03-01",
                "monthly_target": 22000,
                "actual_monthly_savings": 25000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 17,
                    "months_remaining": 215,  # ~18 years
                    "total_timeline_months": 232
                },
                "milestones": [
                    {"amount": 1500000, "date": "2030-06-30", "status": "Pending"},
                    {"amount": 3000000, "date": "2035-06-30", "status": "Pending"},
                    {"amount": 4500000, "date": "2040-06-30", "status": "Pending"},
                    {"amount": 5000000, "date": "2042-06-30", "status": "Pending"}
                ],
                "notes": "Ahead of schedule with consistent contributions. Excellent progress.",
                "investment_strategy": "Child education plans and equity mutual funds"
            },
            {
                "id": "practice_setup",
                "name": "Private Practice Setup",
                "description": "Capital for setting up private medical practice",
                "category": "Professional",
                "priority": "Medium",
                "target_amount": 2500000,  # ₹25L for clinic setup
                "current_amount": 400000,
                "progress_percentage": 16.0,
                "target_date": "2028-12-31",
                "start_date": "2023-03-01",
                "monthly_target": 30000,
                "actual_monthly_savings": 28000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 17,
                    "months_remaining": 53,  # ~4.5 years
                    "total_timeline_months": 70
                },
                "milestones": [
                    {"amount": 800000, "date": "2025-12-31", "status": "Pending"},
                    {"amount": 1500000, "date": "2027-06-30", "status": "Pending"},
                    {"amount": 2500000, "date": "2028-12-31", "status": "Pending"}
                ],
                "notes": "Slightly behind target but manageable with focused savings.",
                "investment_strategy": "Balanced funds and debt instruments for capital protection"
            }
        ],
        "goals_summary": {
            "total_target_amount": 8300000,
            "total_current_amount": 1350000,
            "overall_progress_percentage": 16.27,
            "monthly_savings_target": 72000,
            "actual_monthly_savings": 71000,
            "goals_on_track": 2,
            "goals_behind_schedule": 1
        }
    }

def generate_goals_for_arjun_singh() -> Dict[str, Any]:
    """Young Aggressive Tech Professional - Focus on aggressive growth and lifestyle"""
    return {
        "goals": [
            {
                "id": "emergency_fund_young",
                "name": "Emergency Fund",
                "description": "Basic emergency fund for young professional",
                "category": "Security",
                "priority": "Medium",
                "target_amount": 330000,  # 6 months × ₹55K expenses
                "current_amount": 120000,
                "progress_percentage": 36.36,
                "target_date": "2025-12-31",
                "start_date": "2024-01-01",
                "monthly_target": 12000,
                "actual_monthly_savings": 10000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 8,
                    "months_remaining": 16,
                    "total_timeline_months": 24
                },
                "milestones": [
                    {"amount": 200000, "date": "2025-06-30", "status": "Pending"},
                    {"amount": 330000, "date": "2025-12-31", "status": "Pending"}
                ],
                "notes": "Building emergency fund gradually while focusing on growth investments.",
                "investment_strategy": "Liquid funds and savings account"
            },
            {
                "id": "tech_upskilling",
                "name": "Tech Skills & Certification Fund",
                "description": "Investment in upskilling and advanced certifications",
                "category": "Education",
                "priority": "High",
                "target_amount": 300000,  # ₹3L for courses, certifications, conferences
                "current_amount": 80000,
                "progress_percentage": 26.67,
                "target_date": "2026-06-30",
                "start_date": "2024-01-01",
                "monthly_target": 10000,
                "actual_monthly_savings": 8000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 8,
                    "months_remaining": 22,
                    "total_timeline_months": 30
                },
                "milestones": [
                    {"amount": 150000, "date": "2025-12-31", "status": "Pending"},
                    {"amount": 300000, "date": "2026-06-30", "status": "Pending"}
                ],
                "notes": "Investing in career growth for higher future earning potential.",
                "investment_strategy": "Short-term funds for immediate access to course fees"
            },
            {
                "id": "aggressive_wealth_creation",
                "name": "Aggressive Wealth Building",
                "description": "High-growth investment portfolio for wealth creation",
                "category": "Investment",
                "priority": "High",
                "target_amount": 10000000,  # ₹1 Crore by age 35
                "current_amount": 320000,  # Current portfolio
                "progress_percentage": 3.20,
                "target_date": "2033-06-30",
                "start_date": "2024-01-01",
                "monthly_target": 35000,
                "actual_monthly_savings": 40000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 8,
                    "months_remaining": 106,  # ~9 years
                    "total_timeline_months": 114
                },
                "milestones": [
                    {"amount": 1500000, "date": "2027-06-30", "status": "Pending"},
                    {"amount": 4000000, "date": "2030-06-30", "status": "Pending"},
                    {"amount": 7500000, "date": "2032-06-30", "status": "Pending"},
                    {"amount": 10000000, "date": "2033-06-30", "status": "Pending"}
                ],
                "notes": "Exceeding target with aggressive equity and growth fund investments.",
                "investment_strategy": "Small-cap, mid-cap funds, direct equity, international funds"
            }
        ],
        "goals_summary": {
            "total_target_amount": 10630000,
            "total_current_amount": 520000,
            "overall_progress_percentage": 4.89,
            "monthly_savings_target": 57000,
            "actual_monthly_savings": 58000,
            "goals_on_track": 2,
            "goals_behind_schedule": 1
        }
    }

def generate_goals_for_meera_patel() -> Dict[str, Any]:
    """Conservative Senior Manager - Focus on security, family, and pre-retirement planning"""
    return {
        "goals": [
            {
                "id": "family_security_fund",
                "name": "Family Security Fund",
                "description": "Enhanced emergency fund for family security",
                "category": "Security",
                "priority": "High",
                "target_amount": 1000000,  # ₹10L for family security
                "current_amount": 500000,
                "progress_percentage": 50.0,
                "target_date": "2025-12-31",
                "start_date": "2023-01-01",
                "monthly_target": 20000,
                "actual_monthly_savings": 22000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 12,
                    "total_timeline_months": 32
                },
                "milestones": [
                    {"amount": 600000, "date": "2024-12-31", "status": "Achieved", "achieved_date": "2024-11-30"},
                    {"amount": 800000, "date": "2025-06-30", "status": "Pending"},
                    {"amount": 1000000, "date": "2025-12-31", "status": "Pending"}
                ],
                "notes": "Ahead of schedule with excellent discipline in savings.",
                "investment_strategy": "Conservative debt funds and FDs"
            },
            {
                "id": "daughter_marriage",
                "name": "Daughter's Marriage Fund",
                "description": "Traditional wedding expenses and related costs",
                "category": "Family",
                "priority": "High",
                "target_amount": 2000000,  # ₹20L for wedding expenses
                "current_amount": 600000,
                "progress_percentage": 30.0,
                "target_date": "2032-12-31",
                "start_date": "2023-01-01",
                "monthly_target": 15000,
                "actual_monthly_savings": 18000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 100,  # ~8 years
                    "total_timeline_months": 120
                },
                "milestones": [
                    {"amount": 1000000, "date": "2027-12-31", "status": "Pending"},
                    {"amount": 1500000, "date": "2030-12-31", "status": "Pending"},
                    {"amount": 2000000, "date": "2032-12-31", "status": "Pending"}
                ],
                "notes": "Ahead of target with disciplined monthly savings approach.",
                "investment_strategy": "Conservative balanced funds and gold investments"
            },
            {
                "id": "pre_retirement_corpus",
                "name": "Pre-Retirement Corpus",
                "description": "Build corpus for comfortable retirement by age 55",
                "category": "Retirement",
                "priority": "Medium",
                "target_amount": 25000000,  # ₹2.5 Crore for retirement
                "current_amount": 1200000,
                "progress_percentage": 4.80,
                "target_date": "2041-12-31",
                "start_date": "2023-01-01",
                "monthly_target": 40000,
                "actual_monthly_savings": 35000,
                "status": "In Progress",
                "timeline": {
                    "months_elapsed": 20,
                    "months_remaining": 208,  # ~17 years
                    "total_timeline_months": 228
                },
                "milestones": [
                    {"amount": 5000000, "date": "2030-12-31", "status": "Pending"},
                    {"amount": 12000000, "date": "2035-12-31", "status": "Pending"},
                    {"amount": 20000000, "date": "2040-12-31", "status": "Pending"},
                    {"amount": 25000000, "date": "2041-12-31", "status": "Pending"}
                ],
                "notes": "Slightly behind target but can be achieved with salary increments.",
                "investment_strategy": "Conservative equity funds, PPF, and EPF"
            }
        ],
        "goals_summary": {
            "total_target_amount": 28000000,
            "total_current_amount": 2300000,
            "overall_progress_percentage": 8.21,
            "monthly_savings_target": 75000,
            "actual_monthly_savings": 75000,
            "goals_on_track": 2,
            "goals_behind_schedule": 1
        }
    }

# Main mapping function
def get_financial_goals_by_user_id(user_id: str) -> Dict[str, Any]:
    """Get financial goals for specific user"""
    goals_mapping = {
        "priya-sharma": generate_goals_for_priya_sharma,
        "rajesh-kumar": generate_goals_for_rajesh_kumar,
        "anita-desai": generate_goals_for_anita_desai,
        "arjun-singh": generate_goals_for_arjun_singh,
        "meera-patel": generate_goals_for_meera_patel
    }
    
    generator_func = goals_mapping.get(user_id)
    if generator_func:
        return generator_func()
    
    # Default goals for unknown users
    return {
        "goals": [],
        "goals_summary": {
            "total_target_amount": 0,
            "total_current_amount": 0,
            "overall_progress_percentage": 0,
            "monthly_savings_target": 0,
            "actual_monthly_savings": 0,
            "goals_on_track": 0,
            "goals_behind_schedule": 0
        }
    }

def get_goal_by_id(user_id: str, goal_id: str) -> Dict[str, Any]:
    """Get specific goal by user ID and goal ID"""
    user_goals = get_financial_goals_by_user_id(user_id)
    for goal in user_goals.get("goals", []):
        if goal["id"] == goal_id:
            return goal
    return None

def calculate_goal_progress(user_id: str, goal_id: str) -> Dict[str, Any]:
    """Calculate progress for a specific goal"""
    goal = get_goal_by_id(user_id, goal_id)
    if not goal:
        return None
    
    progress_percentage = (goal["current_amount"] / goal["target_amount"]) * 100
    amount_remaining = goal["target_amount"] - goal["current_amount"]
    monthly_required = amount_remaining / goal["timeline"]["months_remaining"] if goal["timeline"]["months_remaining"] > 0 else 0
    is_on_track = goal["actual_monthly_savings"] >= goal["monthly_target"] * 0.9  # 90% threshold
    
    return {
        "current_progress": round(progress_percentage, 2),
        "amount_remaining": amount_remaining,
        "monthly_required": round(monthly_required),
        "is_on_track": is_on_track,
        "months_remaining": goal["timeline"]["months_remaining"]
    }