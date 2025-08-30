"""
Portfolio Recommendations Service - Generate personalized rebalancing advice
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import math

logger = logging.getLogger(__name__)


class PortfolioRecommendationsService:
    def __init__(self):
        pass
    
    def calculate_asset_allocation_recommendations(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Calculate asset allocation recommendations based on user profile and current holdings"""
        
        user_profile = user_context.get('user_profile', {})
        portfolio = user_context.get('portfolio', {})
        investment_profile = user_context.get('investment_profile', {})
        
        age = user_profile.get('age', 30)
        risk_tolerance = investment_profile.get('risk_tolerance', 'moderate').lower()
        asset_allocation = portfolio.get('summary', {}).get('asset_allocation', {})
        
        # Age-based equity allocation (rule of thumb: 100 - age = equity %)
        target_equity_percentage = max(40, min(80, 100 - age))
        
        # Adjust based on risk tolerance
        if risk_tolerance == 'aggressive':
            target_equity_percentage = min(85, target_equity_percentage + 15)
        elif risk_tolerance == 'conservative':
            target_equity_percentage = max(30, target_equity_percentage - 20)
        
        # Calculate current equity percentage
        stocks_percentage = asset_allocation.get('stocks', {}).get('percentage', 0)
        mf_percentage = asset_allocation.get('mutual_funds', {}).get('percentage', 0)
        current_equity_percentage = stocks_percentage + (mf_percentage * 0.7)  # 70% of MFs are equity
        
        recommendations = []
        
        # Asset allocation recommendations
        if abs(current_equity_percentage - target_equity_percentage) > 10:
            action = 'reduce' if current_equity_percentage > target_equity_percentage else 'increase'
            difference = abs(current_equity_percentage - target_equity_percentage)
            
            recommendations.append({
                'id': f'asset_allocation_{action}_{int(datetime.now().timestamp())}',
                'type': 'reduce' if action == 'reduce' else 'add',
                'title': f'{"Reduce" if action == "reduce" else "Increase"} Equity Allocation',
                'description': f'Your equity allocation of {current_equity_percentage:.1f}% {"exceeds" if action == "reduce" else "is below"} the recommended {target_equity_percentage}% for your age and risk profile.',
                'priority': 'high' if difference > 20 else 'medium',
                'impact_score': min(100, difference * 4),
                'current_allocation': round(current_equity_percentage),
                'recommended_allocation': target_equity_percentage,
                'timeframe': '2-4 weeks' if difference > 20 else '1-3 months',
                'reasoning': [
                    f'Age-appropriate allocation for {age} years old',
                    f'Matches {risk_tolerance} risk tolerance',
                    'Reduce portfolio volatility' if action == 'reduce' else 'Enhance growth potential'
                ],
                'risk_level': 'low' if action == 'reduce' else 'medium'
            })
        
        return recommendations
    
    def analyze_sector_concentration(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze sector concentration and provide rebalancing recommendations"""
        
        portfolio = user_context.get('portfolio', {})
        stocks = portfolio.get('stocks', [])
        recommendations = []
        portfolio_value = portfolio.get('summary', {}).get('total_current_value', 0)
        
        if not stocks or portfolio_value <= 0:
            return recommendations
        
        # Calculate sector allocation
        sector_allocation = {}
        for stock in stocks:
            sector = stock.get('sector', 'Other')
            if sector not in sector_allocation:
                sector_allocation[sector] = {'value': 0, 'percentage': 0, 'stocks': []}
            sector_allocation[sector]['value'] += stock.get('current_value', 0)
            sector_allocation[sector]['stocks'].append(stock)
        
        # Calculate percentages
        for sector in sector_allocation:
            sector_allocation[sector]['percentage'] = (sector_allocation[sector]['value'] / portfolio_value) * 100
        
        # Find overconcentrated sectors (>20% in single sector)
        for sector, data in sector_allocation.items():
            if data['percentage'] > 20:
                stock_symbols = ', '.join(stock.get('symbol', '') for stock in data['stocks'])
                
                recommendations.append({
                    'id': f'sector_concentration_{sector}_{int(datetime.now().timestamp())}',
                    'type': 'reduce',
                    'title': f'Reduce {sector} Sector Concentration',
                    'description': f'Your {sector} exposure is {data["percentage"]:.1f}% through {stock_symbols}. Consider reducing to below 20% to minimize sector-specific risk.',
                    'priority': 'high' if data['percentage'] > 30 else 'medium',
                    'impact_score': min(100, data['percentage'] * 3),
                    'current_allocation': round(data['percentage']),
                    'recommended_allocation': 18,
                    'timeframe': '1-2 weeks' if data['percentage'] > 30 else '1-2 months',
                    'reasoning': [
                        'Sector concentration creates single-point-of-failure risk',
                        'Diversification across sectors improves risk-adjusted returns',
                        f'{sector} sector may face specific regulatory or economic challenges'
                    ],
                    'risk_level': 'medium'
                })
        
        return recommendations
    
    def analyze_stock_concentration(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze individual stock concentration"""
        
        portfolio = user_context.get('portfolio', {})
        stocks = portfolio.get('stocks', [])
        recommendations = []
        portfolio_value = portfolio.get('summary', {}).get('total_current_value', 0)
        
        if not stocks or portfolio_value <= 0:
            return recommendations
        
        # Find individual stocks that are >10% of portfolio
        large_positions = [
            stock for stock in stocks
            if (stock.get('current_value', 0) / portfolio_value) * 100 > 10
        ]
        
        for stock in large_positions:
            position_percent = (stock.get('current_value', 0) / portfolio_value) * 100
            target_percent = 8  # Recommended max per stock
            
            recommendations.append({
                'id': f'stock_concentration_{stock.get("symbol", "unknown")}_{int(datetime.now().timestamp())}',
                'type': 'reduce',
                'title': f'Reduce {stock.get("symbol", "Stock")} Position Size',
                'description': f'{stock.get("company_name", "This stock")} represents {position_percent:.1f}% of your portfolio, creating concentration risk. Consider reducing to below 8%.',
                'priority': 'high' if position_percent > 15 else 'medium',
                'impact_score': min(100, position_percent * 5),
                'current_allocation': round(position_percent),
                'recommended_allocation': target_percent,
                'amount_suggestion': round((position_percent - target_percent) * portfolio_value / 100),
                'timeframe': '1-2 weeks' if position_percent > 15 else '1-2 months',
                'reasoning': [
                    'Single stock concentration increases portfolio volatility',
                    'Idiosyncratic risk from company-specific events',
                    'Opportunity to diversify into other quality stocks'
                ],
                'risk_level': 'medium'
            })
        
        return recommendations
    
    def analyze_mutual_fund_performance(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze mutual fund performance and recommend switches"""
        
        portfolio = user_context.get('portfolio', {})
        mutual_funds = portfolio.get('mutual_funds', [])
        recommendations = []
        
        # Find underperforming funds (negative returns or very low returns)
        underperforming_funds = [
            fund for fund in mutual_funds
            if (fund.get('gain_loss_percentage') is not None and 
                fund.get('gain_loss_percentage', 0) < 5 and
                fund.get('investment_amount', 0) > 50000)
        ]
        
        for fund in underperforming_funds:
            gain_loss_percentage = fund.get('gain_loss_percentage', 0)
            is_negative = gain_loss_percentage < 0
            
            recommendations.append({
                'id': f'fund_performance_{fund.get("scheme_code", "unknown")}_{int(datetime.now().timestamp())}',
                'type': 'reduce',
                'title': f'Review {fund.get("fund_category", "Mutual")} Fund Performance',
                'description': f'Your {fund.get("scheme_name", "mutual").split(" - ")[0]} fund {"has negative returns" if is_negative else "is underperforming"} at {gain_loss_percentage:.1f}%. Consider switching to better alternatives.',
                'priority': 'high' if is_negative else 'medium',
                'impact_score': min(100, abs(gain_loss_percentage) * 8 + 30),
                'current_allocation': gain_loss_percentage,
                'recommended_allocation': 12,  # Target return
                'timeframe': '2-4 weeks' if is_negative else '3-6 months',
                'reasoning': [
                    f'Current returns of {gain_loss_percentage:.1f}% are below expectations',
                    'Opportunity cost of staying in underperforming fund',
                    'Better-performing alternatives available in same category'
                ],
                'risk_level': 'low'
            })
        
        # High expense ratio recommendations
        high_expense_funds = [
            fund for fund in mutual_funds
            if fund.get('expense_ratio', 0) > 1.0
        ]
        
        for fund in high_expense_funds:
            expense_ratio = fund.get('expense_ratio', 0)
            
            recommendations.append({
                'id': f'fund_expense_{fund.get("scheme_code", "unknown")}_{int(datetime.now().timestamp())}',
                'type': 'reduce',
                'title': f'Switch to Lower Cost {fund.get("fund_category", "Mutual")} Fund',
                'description': f'Your {fund.get("scheme_name", "mutual").split(" - ")[0]} fund has a high expense ratio of {expense_ratio}%. Consider switching to direct plans or lower-cost alternatives.',
                'priority': 'medium',
                'impact_score': 60,
                'timeframe': '1-3 months',
                'reasoning': [
                    f'High expense ratio of {expense_ratio}% reduces long-term returns',
                    'Direct plans typically have 0.5-1% lower expense ratios',
                    'Cost savings compound significantly over time'
                ],
                'risk_level': 'low'
            })
        
        return recommendations
    
    def analyze_goal_progress(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze goal progress and generate recommendations"""
        
        financial_goals = user_context.get('financial_goals', {})
        goals = financial_goals.get('goals', [])
        recommendations = []
        
        for goal in goals:
            target_date = datetime.fromisoformat(goal.get('target_date', '').replace('Z', '+00:00')) if goal.get('target_date') else datetime.now()
            months_remaining = max(0, round((target_date - datetime.now()).days / 30))
            remaining_amount = goal.get('target_amount', 0) - goal.get('current_amount', 0)
            required_monthly = remaining_amount / max(months_remaining, 1)
            
            # Goals that are behind schedule
            progress_percentage = goal.get('progress_percentage', 0)
            if (progress_percentage < 30 and 
                goal.get('priority') == 'High' and 
                months_remaining > 6):
                
                recommendations.append({
                    'id': f'goal_behind_{goal.get("id", "unknown")}_{int(datetime.now().timestamp())}',
                    'type': 'goal_based',
                    'title': f'Accelerate {goal.get("name", "Goal")} Savings',
                    'description': f'Your {goal.get("name", "goal")} needs ₹{(remaining_amount/100000):.1f}L more. Consider increasing monthly allocation by ₹{round(required_monthly/2):,}.',
                    'priority': 'high',
                    'impact_score': 85,
                    'amount_suggestion': round(required_monthly/2),
                    'timeframe': 'Immediate',
                    'reasoning': [
                        f'Only {progress_percentage:.1f}% complete with {months_remaining} months left',
                        'Early action provides compounding advantage',
                        'Meeting this goal is crucial for financial security'
                    ],
                    'risk_level': 'low'
                })
            
            # Goals close to completion
            if 85 < progress_percentage < 100:
                recommendations.append({
                    'id': f'goal_final_push_{goal.get("id", "unknown")}_{int(datetime.now().timestamp())}',
                    'type': 'goal_based',
                    'title': f'Final Push for {goal.get("name", "Goal")}',
                    'description': f'You\'re {progress_percentage:.1f}% there! Just ₹{(remaining_amount/1000):.0f}K more needed. Consider a lump sum or increased SIP to complete this goal.',
                    'priority': 'medium',
                    'impact_score': 75,
                    'amount_suggestion': round(remaining_amount),
                    'timeframe': '1-2 months',
                    'reasoning': [
                        'Goal is very close to completion',
                        'Momentum advantage of achieving first goal',
                        'Can redirect funds to other goals once completed'
                    ],
                    'risk_level': 'low'
                })
        
        return recommendations
    
    def calculate_rebalance_data(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate ideal rebalancing allocation"""
        
        portfolio = user_context.get('portfolio', {})
        user_profile = user_context.get('user_profile', {})
        investment_profile = user_context.get('investment_profile', {})
        
        age = user_profile.get('age', 30)
        risk_tolerance = investment_profile.get('risk_tolerance', 'moderate').lower()
        
        # Calculate current allocation from actual holdings
        total_value = portfolio.get('summary', {}).get('total_current_value', 0)
        current = {}
        recommended = {}
        
        if total_value <= 0:
            return {'current': current, 'recommended': recommended, 'difference': {}}
        
        # Current allocation
        stocks = portfolio.get('stocks', [])
        mutual_funds = portfolio.get('mutual_funds', [])
        
        # Group by categories
        large_cap = 0
        mid_cap = 0
        small_cap = 0
        debt = 0
        international = 0
        gold = 0
        
        # Analyze stock holdings (assume large cap stocks)
        for stock in stocks:
            large_cap += stock.get('current_value', 0)
        
        # Analyze mutual fund holdings
        for fund in mutual_funds:
            value = fund.get('current_value', 0)
            category = fund.get('fund_category', '').lower()
            
            if 'large' in category:
                large_cap += value
            elif 'mid' in category:
                mid_cap += value
            elif 'small' in category:
                small_cap += value
            elif 'debt' in category or 'bond' in category:
                debt += value
            elif 'international' in category:
                international += value
            elif 'gold' in category:
                gold += value
            else:
                large_cap += value * 0.7  # Default assumption for mixed funds
        
        # Convert to percentages
        current['Large Cap'] = round((large_cap / total_value) * 100)
        current['Mid Cap'] = round((mid_cap / total_value) * 100)
        current['Small Cap'] = round((small_cap / total_value) * 100)
        current['Debt'] = round((debt / total_value) * 100)
        current['International'] = round((international / total_value) * 100)
        current['Gold'] = round((gold / total_value) * 100)
        
        # Recommended allocation based on risk tolerance
        if risk_tolerance == 'aggressive':
            recommended = {
                'Large Cap': 35,
                'Mid Cap': 25,
                'Small Cap': 15,
                'Debt': 15,
                'International': 8,
                'Gold': 2
            }
        elif risk_tolerance == 'conservative':
            recommended = {
                'Large Cap': 40,
                'Mid Cap': 15,
                'Small Cap': 5,
                'Debt': 30,
                'International': 5,
                'Gold': 5
            }
        else:  # moderate
            recommended = {
                'Large Cap': 38,
                'Mid Cap': 20,
                'Small Cap': 10,
                'Debt': 22,
                'International': 7,
                'Gold': 3
            }
        
        # Calculate differences
        difference = {}
        for category in current:
            difference[category] = recommended.get(category, 0) - current[category]
        
        return {
            'current': current,
            'recommended': recommended,
            'difference': difference
        }
    
    def generate_portfolio_recommendations(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Main function to generate portfolio recommendations"""
        
        recommendations = []
        
        # Get recommendations from different analysis functions
        recommendations.extend(self.calculate_asset_allocation_recommendations(user_context))
        recommendations.extend(self.analyze_sector_concentration(user_context))
        recommendations.extend(self.analyze_stock_concentration(user_context))
        recommendations.extend(self.analyze_mutual_fund_performance(user_context))
        recommendations.extend(self.analyze_goal_progress(user_context))
        
        # Sort by priority and impact score
        priority_order = {'high': 3, 'medium': 2, 'low': 1}
        sorted_recommendations = sorted(
            recommendations,
            key=lambda x: (priority_order.get(x.get('priority', 'low'), 1), x.get('impact_score', 0)),
            reverse=True
        )
        
        # Calculate rebalance data
        rebalance_data = self.calculate_rebalance_data(user_context)
        
        return {
            'recommendations': sorted_recommendations[:8],  # Limit to top 8 recommendations
            'rebalance_data': rebalance_data,
            'last_updated': datetime.now().isoformat(),
            'next_review_date': (datetime.now() + timedelta(days=30)).isoformat()
        }