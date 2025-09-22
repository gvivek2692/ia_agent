"""
Financial Health Calculation Service
Calculates comprehensive financial health score with adaptive scoring for missing data
Python port of the enhanced JavaScript version
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dateutil.relativedelta import relativedelta


def safe_percentage(numerator: float, denominator: float) -> float:
    """Safely calculate percentage"""
    if not denominator or denominator == 0:
        return 0
    return min(100, max(0, (numerator / denominator) * 100))


def months_between(date1: str, date2: datetime) -> int:
    """Calculate months between two dates"""
    try:
        if isinstance(date1, str):
            d1 = datetime.fromisoformat(date1.replace('Z', '+00:00'))
        else:
            d1 = date1
        
        d2 = date2
        delta = relativedelta(d2, d1)
        return abs(delta.years * 12 + delta.months)
    except:
        return 0


def get_recommended_equity_allocation(age: int) -> Dict[str, int]:
    """Age-based equity allocation recommendations"""
    if age <= 25:
        return {"min": 70, "max": 90}
    elif age <= 35:
        return {"min": 60, "max": 80}
    elif age <= 45:
        return {"min": 50, "max": 70}
    elif age <= 55:
        return {"min": 40, "max": 60}
    else:
        return {"min": 30, "max": 50}


def calculate_income_health_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Income & Cash Flow Score (20 points)"""
    user_profile = user_context.get('user_profile', {})
    financial_profile = user_context.get('financial_profile', {})
    monthly_expenses = user_context.get('monthly_expenses', {})
    banking = user_context.get('banking', {})
    
    score = 0
    details = {}
    
    # Monthly savings rate (8 points)
    take_home = financial_profile.get('take_home')
    total_expenses = monthly_expenses.get('total')
    
    if take_home and total_expenses:
        savings_rate = ((take_home - total_expenses) / take_home) * 100
        details['savings_rate'] = {
            'value': savings_rate,
            'target': 25,
            'status': 'excellent' if savings_rate >= 25 else 'good' if savings_rate >= 20 else 'average' if savings_rate >= 15 else 'poor'
        }
        
        if savings_rate >= 25:
            score += 8
        elif savings_rate >= 20:
            score += 6
        elif savings_rate >= 15:
            score += 4
        elif savings_rate >= 10:
            score += 2
    else:
        details['savings_rate'] = {'status': 'unlock_opportunity', 'potential_points': 8}
    
    # Expense ratio (4 points)
    if take_home and total_expenses:
        expense_ratio = (total_expenses / take_home) * 100
        details['expense_ratio'] = {
            'value': expense_ratio,
            'target': 60,
            'status': 'excellent' if expense_ratio <= 60 else 'good' if expense_ratio <= 70 else 'average' if expense_ratio <= 80 else 'poor'
        }
        
        if expense_ratio <= 60:
            score += 4
        elif expense_ratio <= 70:
            score += 3
        elif expense_ratio <= 80:
            score += 2
        else:
            score += 1
    else:
        details['expense_ratio'] = {'status': 'unlock_opportunity', 'potential_points': 4}
    
    # Emergency fund adequacy (5 points)
    emergency_fund = banking.get('current_emergency_fund')
    if emergency_fund and total_expenses:
        months_covered = emergency_fund / total_expenses
        details['emergency_fund'] = {
            'value': months_covered,
            'target': 6,
            'status': 'excellent' if months_covered >= 6 else 'good' if months_covered >= 4 else 'average' if months_covered >= 2 else 'poor'
        }
        
        if months_covered >= 6:
            score += 5
        elif months_covered >= 4:
            score += 4
        elif months_covered >= 3:
            score += 3
        elif months_covered >= 2:
            score += 2
        elif months_covered >= 1:
            score += 1
    else:
        details['emergency_fund'] = {'status': 'unlock_opportunity', 'potential_points': 5}
    
    # Income diversity (3 points)
    other_income = financial_profile.get('other_income')
    if other_income and take_home:
        diversity_ratio = (other_income / take_home) * 100
        details['income_diversity'] = {
            'value': diversity_ratio,
            'status': 'excellent' if diversity_ratio > 10 else 'good' if diversity_ratio > 5 else 'average' if diversity_ratio > 0 else 'poor'
        }
        
        if diversity_ratio > 10:
            score += 3
        elif diversity_ratio > 5:
            score += 2
        elif diversity_ratio > 0:
            score += 1
    else:
        details['income_diversity'] = {'status': 'single_source', 'potential_points': 3}
    
    return {'score': score, 'max_score': 20, 'details': details, 'category': 'Income & Cash Flow'}


def calculate_asset_allocation_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Asset Allocation & Investment Score (25 points)"""
    portfolio = user_context.get('portfolio', {})
    user_profile = user_context.get('user_profile', {})
    
    score = 0
    details = {}
    
    portfolio_summary = portfolio.get('summary')
    if not portfolio_summary:
        return {
            'score': 0,
            'max_score': 25,
            'details': {'status': 'no_portfolio'},
            'category': 'Asset Allocation & Investments'
        }
    
    age = user_profile.get('age', 30)
    asset_allocation = portfolio_summary.get('asset_allocation', {})
    total_value = portfolio_summary.get('total_current_value', 0)
    
    # Equity allocation appropriateness (10 points)
    equity_percentage = asset_allocation.get('equity', {}).get('percentage', 0)
    recommended_equity = get_recommended_equity_allocation(age)
    
    details['equity_allocation'] = {
        'current': equity_percentage,
        'recommended_min': recommended_equity['min'],
        'recommended_max': recommended_equity['max'],
        'status': 'optimal' if recommended_equity['min'] <= equity_percentage <= recommended_equity['max'] else 
                 'too_conservative' if equity_percentage < recommended_equity['min'] else 'too_aggressive'
    }
    
    if recommended_equity['min'] <= equity_percentage <= recommended_equity['max']:
        score += 10
    else:
        deviation = min(
            abs(equity_percentage - recommended_equity['min']),
            abs(equity_percentage - recommended_equity['max'])
        )
        score += max(0, 10 - math.floor(deviation / 5))
    
    # Debt allocation balance (5 points)
    debt_percentage = asset_allocation.get('debt', {}).get('percentage', 0)
    details['debt_allocation'] = {
        'current': debt_percentage,
        'status': 'balanced' if 10 <= debt_percentage <= 40 else 'too_low' if debt_percentage < 10 else 'too_high'
    }
    
    if 10 <= debt_percentage <= 40:
        score += 5
    elif 5 <= debt_percentage <= 50:
        score += 3
    else:
        score += 1
    
    # Portfolio liquidity (5 points)
    cash_percentage = asset_allocation.get('cash', {}).get('percentage', 0)
    liquid_percentage = cash_percentage + debt_percentage
    details['liquidity'] = {
        'current': liquid_percentage,
        'target': 20,
        'status': 'adequate' if liquid_percentage >= 20 else 'moderate' if liquid_percentage >= 10 else 'low'
    }
    
    if liquid_percentage >= 20:
        score += 5
    elif liquid_percentage >= 15:
        score += 4
    elif liquid_percentage >= 10:
        score += 3
    elif liquid_percentage >= 5:
        score += 2
    else:
        score += 1
    
    # Diversification (5 points)
    holdings = []
    holdings.extend(portfolio.get('stocks', []))
    holdings.extend(portfolio.get('mutual_funds', []))
    
    largest_holding = 0
    for holding in holdings:
        if total_value > 0:
            percentage = (holding.get('current_value', 0) / total_value) * 100
            largest_holding = max(largest_holding, percentage)
    
    details['diversification'] = {
        'largest_holding_percentage': largest_holding,
        'status': 'well_diversified' if largest_holding <= 20 else 'moderate' if largest_holding <= 30 else 'concentrated'
    }
    
    if largest_holding <= 20:
        score += 5
    elif largest_holding <= 30:
        score += 3
    elif largest_holding <= 40:
        score += 2
    else:
        score += 1
    
    return {'score': score, 'max_score': 25, 'details': details, 'category': 'Asset Allocation & Investments'}


def calculate_risk_protection_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Risk Protection Score (15 points)"""
    user_profile = user_context.get('user_profile', {})
    financial_profile = user_context.get('financial_profile', {})
    risk_protection = user_context.get('risk_protection', {})
    
    score = 0
    details = {}
    
    # Life Insurance (6 points)
    life_insurance = risk_protection.get('life_insurance', {})
    coverage_amount = life_insurance.get('coverage_amount')
    
    if coverage_amount:
        annual_ctc = financial_profile.get('annual_ctc')
        target_coverage = annual_ctc * 10 if annual_ctc else 5000000
        adequacy_ratio = coverage_amount / target_coverage
        
        details['life_insurance'] = {
            'value': coverage_amount,
            'target_coverage': target_coverage,
            'adequacy_ratio': adequacy_ratio,
            'insurance_type': life_insurance.get('insurance_type'),
            'status': 'excellent' if adequacy_ratio >= 1 else 'good' if adequacy_ratio >= 0.7 else 'average' if adequacy_ratio >= 0.5 else 'poor'
        }
        
        if adequacy_ratio >= 1:
            score += 6
        elif adequacy_ratio >= 0.7:
            score += 5
        elif adequacy_ratio >= 0.5:
            score += 4
        elif adequacy_ratio >= 0.3:
            score += 3
        else:
            score += 2
    else:
        annual_ctc = financial_profile.get('annual_ctc')
        target_coverage = annual_ctc * 10 if annual_ctc else 'N/A'
        details['life_insurance'] = {
            'status': 'unlock_opportunity',
            'potential_points': 6,
            'recommendation': 'Add life insurance details to unlock 6 points',
            'target_coverage': target_coverage
        }
    
    # Health Insurance (5 points)
    health_insurance = risk_protection.get('health_insurance', {})
    health_coverage = health_insurance.get('coverage_amount')
    
    if health_coverage:
        target_coverage = 1000000  # ₹10L minimum recommended
        
        details['health_insurance'] = {
            'value': health_coverage,
            'target_coverage': target_coverage,
            'coverage_type': health_insurance.get('coverage_type'),
            'status': 'excellent' if health_coverage >= 2000000 else 'good' if health_coverage >= 1000000 else 'average' if health_coverage >= 500000 else 'poor'
        }
        
        if health_coverage >= 2000000:
            score += 5
        elif health_coverage >= 1000000:
            score += 4
        elif health_coverage >= 500000:
            score += 3
        elif health_coverage >= 300000:
            score += 2
        else:
            score += 1
    else:
        details['health_insurance'] = {
            'status': 'unlock_opportunity',
            'potential_points': 5,
            'recommendation': 'Add health insurance details to unlock 5 points',
            'target_coverage': '₹10-20L family floater'
        }
    
    # Disability Insurance (4 points) - still unlock opportunity for now
    details['disability_insurance'] = {
        'status': 'unlock_opportunity',
        'potential_points': 4,
        'recommendation': 'Consider disability insurance to unlock 4 points'
    }
    
    return {'score': score, 'max_score': 15, 'details': details, 'category': 'Risk Protection'}


def calculate_liabilities_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Liabilities & Credit Score (10 points)"""
    liabilities = user_context.get('liabilities', {})
    financial_profile = user_context.get('financial_profile', {})
    
    score = 0
    details = {}
    
    # Credit Score (3 points)
    credit_score_data = liabilities.get('credit_score', {})
    credit_score = credit_score_data.get('score')
    
    if credit_score:
        details['credit_score'] = {
            'score': credit_score,
            'source': credit_score_data.get('source'),
            'status': 'excellent' if credit_score >= 750 else 'good' if credit_score >= 700 else 'fair' if credit_score >= 650 else 'poor'
        }
        
        if credit_score >= 750:
            score += 3
        elif credit_score >= 700:
            score += 2
        elif credit_score >= 650:
            score += 1
    else:
        details['credit_score'] = {
            'status': 'unlock_opportunity',
            'potential_points': 3,
            'recommendation': 'Add CIBIL score to unlock 3 points'
        }
    
    # Debt-to-Income Ratio (4 points)
    home_loan_emi = liabilities.get('home_loan', {}).get('monthly_emi', 0)
    personal_loan_emi = liabilities.get('personal_loan', {}).get('monthly_emi', 0)
    monthly_emi = home_loan_emi + personal_loan_emi
    
    take_home = financial_profile.get('take_home')
    if monthly_emi > 0 and take_home:
        debt_to_income_ratio = (monthly_emi / take_home) * 100
        
        details['debt_to_income'] = {
            'value': debt_to_income_ratio,
            'monthly_emi': monthly_emi,
            'status': 'excellent' if debt_to_income_ratio <= 20 else 'good' if debt_to_income_ratio <= 30 else 'fair' if debt_to_income_ratio <= 40 else 'poor'
        }
        
        if debt_to_income_ratio <= 20:
            score += 4
        elif debt_to_income_ratio <= 30:
            score += 3
        elif debt_to_income_ratio <= 40:
            score += 2
        else:
            score += 1
    else:
        details['debt_to_income'] = {
            'status': 'unlock_opportunity',
            'potential_points': 4,
            'recommendation': 'Add loan/EMI details to unlock 4 points'
        }
    
    # Credit Utilization (3 points)
    credit_card = liabilities.get('credit_card', {})
    outstanding_amount = credit_card.get('outstanding_amount')
    
    if outstanding_amount is not None:
        details['credit_utilization'] = {
            'value': outstanding_amount,
            'status': 'excellent' if outstanding_amount == 0 else 'good' if outstanding_amount <= 50000 else 'fair' if outstanding_amount <= 100000 else 'poor'
        }
        
        if outstanding_amount == 0:
            score += 3
        elif outstanding_amount <= 50000:
            score += 2
        elif outstanding_amount <= 100000:
            score += 1
    else:
        details['credit_utilization'] = {
            'status': 'unlock_opportunity',
            'potential_points': 3,
            'recommendation': 'Add credit card details to unlock 3 points'
        }
    
    return {'score': score, 'max_score': 10, 'details': details, 'category': 'Liabilities & Credit'}


def calculate_goal_planning_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Goal Planning Score (15 points)"""
    goals = user_context.get('goals', {})
    
    score = 0
    details = {}
    
    goal_list = goals.get('goals', [])
    if not goal_list:
        details['goal_clarity'] = {
            'status': 'no_goals',
            'potential_points': 5,
            'recommendation': 'Define financial goals to unlock 5 points'
        }
        details['goal_funding'] = {
            'status': 'no_goals',
            'potential_points': 7,
            'recommendation': 'Set up goal funding to unlock 7 points'
        }
        details['retirement_planning'] = {
            'status': 'no_goals',
            'potential_points': 3,
            'recommendation': 'Add retirement planning to unlock 3 points'
        }
        return {'score': score, 'max_score': 15, 'details': details, 'category': 'Goal Planning & Progress'}
    
    # Goal clarity (5 points)
    defined_goals = [goal for goal in goal_list if goal.get('target_amount') and goal.get('target_date')]
    details['goal_clarity'] = {
        'defined_goals': len(defined_goals),
        'total_goals': len(goal_list),
        'status': 'excellent' if len(defined_goals) >= 3 else 'good' if len(defined_goals) >= 2 else 'average' if len(defined_goals) >= 1 else 'poor'
    }
    
    if len(defined_goals) >= 3:
        score += 5
    elif len(defined_goals) >= 2:
        score += 4
    elif len(defined_goals) >= 1:
        score += 3
    
    # Goal funding ratio (7 points)
    total_progress = 0
    goal_count = 0
    
    for goal in defined_goals:
        progress = goal.get('progress_percentage')
        if progress is not None:
            total_progress += progress
            goal_count += 1
    
    average_progress = total_progress / goal_count if goal_count > 0 else 0
    details['goal_funding'] = {
        'average_progress': average_progress,
        'status': 'on_track' if average_progress >= 70 else 'moderate' if average_progress >= 50 else 'behind'
    }
    
    if average_progress >= 70:
        score += 7
    elif average_progress >= 50:
        score += 5
    elif average_progress >= 30:
        score += 3
    elif average_progress >= 10:
        score += 2
    
    # Retirement planning (3 points)
    retirement_goal = None
    for goal in goal_list:
        goal_id = goal.get('id', '').lower()
        goal_name = goal.get('name', '').lower()
        if 'retirement' in goal_id or 'retirement' in goal_name:
            retirement_goal = goal
            break
    
    details['retirement_planning'] = {
        'has_retirement_goal': bool(retirement_goal),
        'status': 'defined' if retirement_goal else 'missing'
    }
    
    if retirement_goal:
        score += 3
    
    return {'score': score, 'max_score': 15, 'details': details, 'category': 'Goal Planning & Progress'}


def calculate_tax_efficiency_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Tax Efficiency Score (10 points)"""
    tax_planning = user_context.get('tax_planning', {})
    
    score = 0
    details = {}
    
    # Section 80C Investments (5 points)
    section_80c = tax_planning.get('section_80c', {})
    investment = section_80c.get('annual_investment')
    
    if investment:
        max_limit = 150000  # ₹1.5L annual limit for 80C
        
        details['section_80c_investments'] = {
            'value': investment,
            'max_limit': max_limit,
            'utilization_percentage': min((investment / max_limit) * 100, 100),
            'status': 'excellent' if investment >= max_limit else 'good' if investment >= 100000 else 'moderate' if investment >= 50000 else 'basic'
        }
        
        if investment >= max_limit:
            score += 5
        elif investment >= 100000:
            score += 4
        elif investment >= 50000:
            score += 3
        else:
            score += 2
    else:
        details['section_80c_investments'] = {
            'status': 'unlock_opportunity',
            'potential_points': 5,
            'recommendation': 'Add Section 80C investments to unlock 5 points'
        }
    
    # Additional Tax Planning Instruments (5 points)
    additional_instruments = 0
    total_additional_investment = 0
    
    # NPS Contributions (80CCD(1B))
    nps = tax_planning.get('nps', {})
    nps_contribution = nps.get('annual_contribution')
    if nps_contribution:
        additional_instruments += 1
        total_additional_investment += nps_contribution
    
    # Health Insurance Premium (80D)
    section_80d = tax_planning.get('section_80d', {})
    premium = section_80d.get('annual_premium')
    if premium:
        additional_instruments += 1
        total_additional_investment += premium
    
    if additional_instruments > 0:
        details['additional_tax_planning'] = {
            'instruments_count': additional_instruments,
            'total_investment': total_additional_investment,
            'status': 'comprehensive' if additional_instruments >= 2 else 'basic'
        }
        
        if additional_instruments >= 2:
            score += 5
        else:
            score += 3
    else:
        details['additional_tax_planning'] = {
            'status': 'unlock_opportunity',
            'potential_points': 5,
            'recommendation': 'Add NPS, health insurance premium details to unlock 5 points'
        }
    
    return {'score': score, 'max_score': 10, 'details': details, 'category': 'Tax Efficiency & Estate'}


def calculate_behavioral_score(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate Behavioral Discipline Score (5 points)"""
    investment_profile = user_context.get('investment_profile', {})
    portfolio = user_context.get('portfolio', {})
    
    score = 0
    details = {}
    
    # Investment experience (2 points)
    started_investing = investment_profile.get('started_investing')
    if started_investing:
        months_investing = months_between(started_investing, datetime.now())
        details['investment_experience'] = {
            'months': months_investing,
            'status': 'experienced' if months_investing >= 24 else 'intermediate' if months_investing >= 12 else 'beginner'
        }
        
        if months_investing >= 24:
            score += 2
        elif months_investing >= 12:
            score += 1
    
    # Diversification behavior (3 points)
    stocks = portfolio.get('stocks', [])
    mutual_funds = portfolio.get('mutual_funds', [])
    has_balance = len(stocks) > 0 and len(mutual_funds) > 0
    
    details['diversification_behavior'] = {
        'has_mixed_portfolio': has_balance,
        'status': 'diversified' if has_balance else 'concentrated'
    }
    
    if has_balance:
        score += 3
    else:
        score += 1
    
    return {'score': score, 'max_score': 5, 'details': details, 'category': 'Behavioral & Monitoring Discipline'}


def identify_unlock_opportunities(health_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Identify unlock opportunities based on missing data"""
    opportunities = []
    
    # Risk Protection - highest impact
    risk_category = next((cat for cat in health_data['categories'] if cat['category'] == 'Risk Protection'), None)
    if risk_category and risk_category['score'] < 10:
        opportunities.append({
            'category': 'Risk Protection',
            'title': 'Complete Insurance Profile',
            'description': 'Add life and health insurance details',
            'potential_gain': 15,
            'effort_level': 'medium',
            'data_needed': ['life_insurance_amount', 'health_insurance_details'],
            'priority': 1
        })
    
    # Liabilities & Credit
    credit_category = next((cat for cat in health_data['categories'] if cat['category'] == 'Liabilities & Credit'), None)
    if credit_category and credit_category['score'] < 5:
        opportunities.append({
            'category': 'Liabilities & Credit',
            'title': 'Add Credit & Debt Information',
            'description': 'Include loan details and credit score',
            'potential_gain': 10,
            'effort_level': 'easy',
            'data_needed': ['loans', 'credit_score', 'emi_details'],
            'priority': 2
        })
    
    # Tax Efficiency
    tax_category = next((cat for cat in health_data['categories'] if cat['category'] == 'Tax Efficiency & Estate'), None)
    if tax_category and tax_category['score'] < 5:
        opportunities.append({
            'category': 'Tax Efficiency & Estate',
            'title': 'Optimize Tax Planning',
            'description': 'Review tax-saving investments and estate planning',
            'potential_gain': 10,
            'effort_level': 'medium',
            'data_needed': ['tax_instruments', 'estate_documents'],
            'priority': 3
        })
    
    return sorted(opportunities, key=lambda x: x['potential_gain'], reverse=True)


def calculate_financial_health(user_context: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to calculate comprehensive financial health score"""
    try:
        # Calculate individual category scores
        income_health = calculate_income_health_score(user_context)
        asset_health = calculate_asset_allocation_score(user_context)
        risk_health = calculate_risk_protection_score(user_context)
        credit_health = calculate_liabilities_score(user_context)
        goal_health = calculate_goal_planning_score(user_context)
        tax_health = calculate_tax_efficiency_score(user_context)
        behavioral_health = calculate_behavioral_score(user_context)
        
        categories = [
            income_health,
            asset_health,
            risk_health,
            credit_health,
            goal_health,
            tax_health,
            behavioral_health
        ]
        
        # Calculate overall scores
        total_score = sum(cat['score'] for cat in categories)
        max_possible_score = sum(cat['max_score'] for cat in categories)
        
        # Determine score band
        score_band = 'Poor'
        score_band_color = '#ef4444'
        if total_score >= 85:
            score_band = 'Excellent'
            score_band_color = '#10b981'
        elif total_score >= 70:
            score_band = 'Good'
            score_band_color = '#f59e0b'
        elif total_score >= 55:
            score_band = 'Average'
            score_band_color = '#f97316'
        
        health_data = {
            'overall_score': round(total_score),
            'potential_score': max_possible_score,
            'score_band': score_band,
            'score_band_color': score_band_color,
            'completion_percentage': round((total_score / max_possible_score) * 100),
            'categories': categories,
            'last_updated': datetime.now().isoformat()
        }
        
        # Add unlock opportunities
        health_data['unlock_opportunities'] = identify_unlock_opportunities(health_data)
        
        return {
            'success': True,
            'data': health_data
        }
        
    except Exception as error:
        print(f'Error calculating financial health: {error}')
        return {
            'success': False,
            'error': 'Failed to calculate financial health score',
            'details': str(error)
        }


class FinancialHealthService:
    """Financial Health Service class to match JavaScript interface"""
    
    def calculate_financial_health(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate financial health score for a user"""
        return calculate_financial_health(user_context)