"""
Advanced AI Insights Engine - Port of comprehensive portfolio analysis from Node.js
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import os

from services.risk_analysis_service import RiskAnalysisService

logger = logging.getLogger(__name__)


class AIInsightsService:
    def __init__(self):
        self.risk_service = RiskAnalysisService()
    
    def calculate_portfolio_scores(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate portfolio-specific scores based on actual user data"""
        
        portfolio = user_context.get('portfolio', {})
        summary = portfolio.get('summary', {})
        goals = user_context.get('financial_goals', {}).get('goals', [])
        user_profile = user_context.get('user_profile', {})
        
        # Portfolio Score (0-100)
        portfolio_score = 50
        
        total_investment = summary.get('total_investment', 0)
        total_current_value = summary.get('total_current_value', 0)
        
        if total_investment > 0:
            total_return = ((total_current_value - total_investment) / total_investment) * 100
        else:
            total_return = 0
        
        # Base score on returns
        if total_return > 15:
            portfolio_score += 25
        elif total_return > 12:
            portfolio_score += 20
        elif total_return > 8:
            portfolio_score += 15
        elif total_return > 5:
            portfolio_score += 10
        elif total_return < 0:
            portfolio_score -= 20
        
        # Adjust for diversification
        asset_allocation = summary.get('asset_allocation', {})
        asset_count = len(asset_allocation.keys())
        
        if asset_count >= 4:
            portfolio_score += 10
        elif asset_count >= 3:
            portfolio_score += 5
        else:
            portfolio_score -= 10
        
        # Adjust for goal progress
        completed_goals = len([g for g in goals if g.get('progress_percentage', 0) >= 100])
        on_track_goals = len([g for g in goals if 50 <= g.get('progress_percentage', 0) < 100])
        portfolio_score += (completed_goals * 5) + (on_track_goals * 2)
        
        # Use exact same risk calculation as Risk Analysis for consistency
        risk_analysis_data = self.risk_service.calculate_risk_analysis(user_context)
        overall_risk = risk_analysis_data.get('metrics', {}).get('overall_score', 50)
        
        # Diversification Score (0-100)
        diversification_score = 40
        
        # Asset class diversification
        diversification_score += min(asset_count * 15, 40)
        
        # Check for over-concentration
        for asset_type, data in asset_allocation.items():
            percentage = data.get('percentage', 0)
            if percentage > 80:
                diversification_score -= 30
            elif percentage > 60:
                diversification_score -= 15
            elif percentage < 10:
                diversification_score += 5  # Good for having smaller allocations
        
        # Market outlook based on recent performance
        market_outlook = "neutral"
        if total_return > 15:
            market_outlook = "bullish"
        elif total_return < 0:
            market_outlook = "bearish"
        
        return {
            "portfolio_score": max(0, min(100, round(portfolio_score))),
            "risk_score": max(0, min(100, overall_risk)),
            "diversification_score": max(0, min(100, round(diversification_score))),
            "market_outlook": market_outlook
        }
    
    def generate_personalized_insights(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate comprehensive personalized insights based on user's actual portfolio data"""
        
        insights = []
        portfolio = user_context.get('portfolio', {})
        summary = portfolio.get('summary', {})
        goals = user_context.get('financial_goals', {}).get('goals', [])
        user_profile = user_context.get('user_profile', {})
        asset_allocation = summary.get('asset_allocation', {})
        stocks = portfolio.get('stocks', [])
        mutual_funds = portfolio.get('mutual_funds', [])
        
        total_investment = summary.get('total_investment', 0)
        total_current_value = summary.get('total_current_value', 0)
        total_gain_loss = summary.get('total_gain_loss', 0)
        
        if total_investment > 0:
            total_return = ((total_current_value - total_investment) / total_investment) * 100
        else:
            total_return = 0
        
        portfolio_value = total_current_value
        current_time = int(datetime.now().timestamp() * 1000)
        
        # 1. PERFORMANCE INSIGHTS
        if total_return > 15:
            insights.append({
                "id": f"perf_excellent_{current_time}",
                "type": "performance",
                "title": "Exceptional Portfolio Performance",
                "description": f"Outstanding! Your portfolio has generated {total_return:.1f}% returns, significantly outperforming market benchmarks. Your investment strategy is working exceptionally well.",
                "impact": "high",
                "confidence": 92,
                "actionable": False,
                "data": {
                    "current_value": f"{total_return:.1f}%",
                    "target_value": "15.0%",
                    "change": f"+{(total_return - 15):.1f}%"
                },
                "generated_at": datetime.now().isoformat()
            })
        elif total_return > 12:
            insights.append({
                "id": f"perf_good_{current_time}",
                "type": "performance",
                "title": "Strong Portfolio Performance",
                "description": f"Great job! Your portfolio has delivered {total_return:.1f}% returns, beating most market indices and mutual fund benchmarks.",
                "impact": "high",
                "confidence": 87,
                "actionable": False,
                "data": {
                    "current_value": f"{total_return:.1f}%",
                    "target_value": "12.0%",
                    "change": f"+{(total_return - 12):.1f}%"
                },
                "generated_at": datetime.now().isoformat()
            })
        elif total_return > 8:
            insights.append({
                "id": f"perf_average_{current_time}",
                "type": "performance",
                "title": "Moderate Portfolio Performance",
                "description": f"Your portfolio has generated {total_return:.1f}% returns, which is decent but has room for improvement. Consider reviewing your asset allocation strategy.",
                "impact": "medium",
                "confidence": 78,
                "actionable": True,
                "recommendation": "Review underperforming investments and consider rebalancing towards growth-oriented assets.",
                "generated_at": datetime.now().isoformat()
            })
        elif total_return < 5:
            insights.append({
                "id": f"perf_poor_{current_time}",
                "type": "warning",
                "title": "Portfolio Performance Needs Attention",
                "description": f"Your portfolio returns of {total_return:.1f}% are below market expectations. This requires immediate review and strategic changes.",
                "impact": "high",
                "confidence": 89,
                "actionable": True,
                "recommendation": "Consider switching to better-performing funds, review expense ratios, and optimize asset allocation.",
                "data": {
                    "current_value": f"{total_return:.1f}%",
                    "target_value": "8.0%",
                    "change": f"{(total_return - 8):.1f}%"
                },
                "generated_at": datetime.now().isoformat()
            })
        
        # 2. INDIVIDUAL STOCK PERFORMANCE INSIGHTS
        if stocks:
            # Identify best and worst performing stocks
            sorted_stocks = sorted(stocks, key=lambda x: x.get('gain_loss_percentage', 0), reverse=True)
            best_stock = sorted_stocks[0] if sorted_stocks else None
            worst_stock = sorted_stocks[-1] if sorted_stocks else None
            
            # Best performing stock insight
            if best_stock and best_stock.get('gain_loss_percentage', 0) > 8:
                insights.append({
                    "id": f"stock_winner_{best_stock.get('symbol', 'STOCK')}_{current_time}",
                    "type": "performance",
                    "title": f"{best_stock.get('symbol', 'Stock')} Delivering Strong Returns",
                    "description": f"{best_stock.get('company_name', best_stock.get('symbol', 'Stock'))} is your top performer with {best_stock.get('gain_loss_percentage', 0):.1f}% returns, contributing ₹{abs(best_stock.get('gain_loss', 0)):,.0f} to your portfolio gains.",
                    "impact": "high",
                    "confidence": 88,
                    "actionable": False,
                    "data": {
                        "current_value": f"{best_stock.get('gain_loss_percentage', 0):.1f}%",
                        "target_value": "8.0%",
                        "change": f"+{(best_stock.get('gain_loss_percentage', 0) - 8):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
            
            # Worst performing stock insight
            if worst_stock and worst_stock.get('gain_loss_percentage', 0) < -3:
                insights.append({
                    "id": f"stock_laggard_{worst_stock.get('symbol', 'STOCK')}_{current_time}",
                    "type": "warning",
                    "title": f"{worst_stock.get('symbol', 'Stock')} Underperforming Portfolio",
                    "description": f"{worst_stock.get('company_name', worst_stock.get('symbol', 'Stock'))} is down {abs(worst_stock.get('gain_loss_percentage', 0)):.1f}%, causing a loss of ₹{abs(worst_stock.get('gain_loss', 0)):,.0f}. Monitor closely for recovery signs.",
                    "impact": "medium",
                    "confidence": 82,
                    "actionable": True,
                    "recommendation": f"Consider reviewing {worst_stock.get('company_name', worst_stock.get('symbol', 'the company'))}'s fundamentals and recent news. If the outlook remains weak, consider booking losses and reallocating.",
                    "data": {
                        "current_value": f"{worst_stock.get('gain_loss_percentage', 0):.1f}%",
                        "target_value": "0%",
                        "change": f"{worst_stock.get('gain_loss_percentage', 0):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
            
            # Large position insights
            if portfolio_value > 0:
                large_positions = [stock for stock in stocks if (stock.get('current_value', 0) / portfolio_value) * 100 > 8]
                for stock in large_positions:
                    position_percent = (stock.get('current_value', 0) / portfolio_value) * 100
                    if position_percent > 12:
                        insights.append({
                            "id": f"large_position_{stock.get('symbol', 'STOCK')}_{current_time}",
                            "type": "risk",
                            "title": f"High Concentration Risk in {stock.get('symbol', 'Stock')}",
                            "description": f"{stock.get('company_name', stock.get('symbol', 'Stock'))} represents {position_percent:.1f}% of your portfolio, creating concentration risk in the {stock.get('sector', 'Unknown')} sector.",
                            "impact": "medium",
                            "confidence": 85,
                            "actionable": True,
                            "recommendation": f"Consider reducing {stock.get('symbol', 'this stock')} position to below 8% of portfolio through partial profit booking or by increasing other holdings.",
                            "data": {
                                "current_value": f"{position_percent:.1f}%",
                                "target_value": "8%",
                                "change": f"-{(position_percent - 8):.1f}%"
                            },
                            "generated_at": datetime.now().isoformat()
                        })
        
        # 3. SECTOR-SPECIFIC INSIGHTS
        if stocks:
            # Analyze sector concentration
            sector_allocation = {}
            for stock in stocks:
                sector = stock.get('sector', 'Other')
                if sector not in sector_allocation:
                    sector_allocation[sector] = {'value': 0, 'percentage': 0, 'stocks': []}
                sector_allocation[sector]['value'] += stock.get('current_value', 0)
                sector_allocation[sector]['stocks'].append(stock)
            
            # Calculate sector percentages
            if portfolio_value > 0:
                for sector in sector_allocation:
                    sector_allocation[sector]['percentage'] = (sector_allocation[sector]['value'] / portfolio_value) * 100
            
            # Find dominant sector
            if sector_allocation:
                dominant_sector = max(sector_allocation.items(), key=lambda x: x[1]['percentage'])
                
                if dominant_sector[1]['percentage'] > 25:
                    sector_name, sector_data = dominant_sector
                    stock_symbols = [s.get('symbol', '') for s in sector_data['stocks']]
                    insights.append({
                        "id": f"sector_concentration_{sector_name}_{current_time}",
                        "type": "risk",
                        "title": f"Over-Concentration in {sector_name} Sector",
                        "description": f"Your {sector_name} exposure is {sector_data['percentage']:.1f}% through {', '.join(stock_symbols)}. This creates sector-specific risk.",
                        "impact": "medium",
                        "confidence": 80,
                        "actionable": True,
                        "recommendation": f"Diversify across sectors by reducing {sector_name} exposure and adding holdings in Healthcare, FMCG, or Pharma sectors.",
                        "data": {
                            "current_value": f"{sector_data['percentage']:.1f}%",
                            "target_value": "20%",
                            "change": f"-{(sector_data['percentage'] - 20):.1f}%"
                        },
                        "generated_at": datetime.now().isoformat()
                    })
                
                # IT sector specific insight (common in Indian portfolios)
                it_sector = sector_allocation.get('Information Technology')
                if it_sector and it_sector['percentage'] > 20:
                    stock_symbols = [s.get('symbol', '') for s in it_sector['stocks']]
                    insights.append({
                        "id": f"it_sector_risk_{current_time}",
                        "type": "market",
                        "title": "IT Sector Concentration Risk",
                        "description": f"Your IT sector allocation of {it_sector['percentage']:.1f}% through {', '.join(stock_symbols)} may be vulnerable to global recession fears and currency fluctuations.",
                        "impact": "medium",
                        "confidence": 78,
                        "actionable": True,
                        "recommendation": "Consider reducing IT exposure and increasing allocation to defensive sectors like FMCG, Pharma, and Utilities.",
                        "generated_at": datetime.now().isoformat()
                    })
        
        # 4. MUTUAL FUND SPECIFIC INSIGHTS
        if mutual_funds:
            # Analyze mutual fund performance
            sorted_mfs = sorted(mutual_funds, key=lambda x: x.get('gain_loss_percentage', 0), reverse=True)
            best_mf = sorted_mfs[0] if sorted_mfs else None
            worst_mf = sorted_mfs[-1] if sorted_mfs else None
            
            # Best performing mutual fund
            if best_mf and best_mf.get('gain_loss_percentage', 0) > 12:
                scheme_name_parts = best_mf.get('scheme_name', '').split(' - ')
                fund_name = scheme_name_parts[0] if scheme_name_parts else best_mf.get('scheme_name', 'Fund')
                
                insights.append({
                    "id": f"mf_winner_{best_mf.get('scheme_code', 'MF')}_{current_time}",
                    "type": "performance",
                    "title": f"{best_mf.get('fund_category', 'Mutual')} Fund Outperforming",
                    "description": f"Your {fund_name} fund is delivering excellent {best_mf.get('gain_loss_percentage', 0):.1f}% returns, significantly beating its benchmark.",
                    "impact": "high",
                    "confidence": 87,
                    "actionable": True,
                    "recommendation": f"Consider increasing SIP in this well-performing fund from ₹{best_mf.get('sip_amount', 0):,.0f} to maximize returns.",
                    "data": {
                        "current_value": f"{best_mf.get('gain_loss_percentage', 0):.1f}%",
                        "target_value": "12.0%",
                        "change": f"+{(best_mf.get('gain_loss_percentage', 0) - 12):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
            
            # Underperforming mutual fund
            if worst_mf and worst_mf.get('gain_loss_percentage', 0) < 0:
                scheme_name_parts = worst_mf.get('scheme_name', '').split(' - ')
                fund_name = scheme_name_parts[0] if scheme_name_parts else worst_mf.get('scheme_name', 'Fund')
                
                insights.append({
                    "id": f"mf_laggard_{worst_mf.get('scheme_code', 'MF')}_{current_time}",
                    "type": "warning",
                    "title": f"{worst_mf.get('fund_category', 'Mutual')} Fund Underperforming",
                    "description": f"Your {fund_name} fund is down {abs(worst_mf.get('gain_loss_percentage', 0)):.1f}%. This {worst_mf.get('fund_category', 'mutual')} fund may need review.",
                    "impact": "medium",
                    "confidence": 83,
                    "actionable": True,
                    "recommendation": f"Review fund manager performance and consider switching to a better-performing {worst_mf.get('fund_category', 'mutual')} alternative with lower expense ratio.",
                    "data": {
                        "current_value": f"{worst_mf.get('gain_loss_percentage', 0):.1f}%",
                        "target_value": "8.0%",
                        "change": f"{worst_mf.get('gain_loss_percentage', 0):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
            
            # High SIP amount insight
            total_sip = sum(mf.get('sip_amount', 0) for mf in mutual_funds)
            if total_sip > 20000:
                sip_funds_count = len([mf for mf in mutual_funds if mf.get('sip_amount', 0) > 0])
                insights.append({
                    "id": f"high_sip_{current_time}",
                    "type": "performance",
                    "title": "Excellent SIP Discipline",
                    "description": f"Your total SIP commitment of ₹{total_sip:,.0f}/month across {sip_funds_count} funds shows excellent investment discipline.",
                    "impact": "high",
                    "confidence": 92,
                    "actionable": False,
                    "data": {
                        "current_value": f"₹{total_sip:,.0f}",
                        "target_value": "₹15,000",
                        "change": f"+₹{(total_sip - 15000):,.0f}"
                    },
                    "generated_at": datetime.now().isoformat()
                })
        
        # 5. ASSET ALLOCATION INSIGHTS
        for asset, data in asset_allocation.items():
            asset_name = asset.replace('_', ' ').title()
            percentage = data.get('percentage', 0)
            
            if percentage > 80:
                insights.append({
                    "id": f"conc_critical_{asset}_{current_time}",
                    "type": "warning",
                    "title": f"Critical Over-Concentration in {asset_name}",
                    "description": f"URGENT: {asset_name} represents {percentage:.1f}% of your portfolio, creating extreme concentration risk. This violates fundamental diversification principles.",
                    "impact": "high",
                    "confidence": 95,
                    "actionable": True,
                    "recommendation": f"Immediately reduce {asset_name} allocation to below 60% by diversifying into other asset classes. This is critical for risk management.",
                    "data": {
                        "current_value": f"{percentage:.1f}%",
                        "target_value": "60%",
                        "change": f"-{(percentage - 60):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
            elif percentage > 70:
                insights.append({
                    "id": f"conc_high_{asset}_{current_time}",
                    "type": "risk",
                    "title": f"High Concentration Risk in {asset_name}",
                    "description": f"{asset_name} comprises {percentage:.1f}% of your portfolio, which exceeds recommended limits and increases concentration risk during market volatility.",
                    "impact": "medium",
                    "confidence": 85,
                    "actionable": True,
                    "recommendation": f"Gradually reduce {asset_name} exposure to 50-60% range and diversify into complementary asset classes.",
                    "data": {
                        "current_value": f"{percentage:.1f}%",
                        "target_value": "55%",
                        "change": f"-{(percentage - 55):.1f}%"
                    },
                    "generated_at": datetime.now().isoformat()
                })
        
        # 6. GOAL-BASED INSIGHTS
        for goal in goals:
            target_date = datetime.fromisoformat(goal.get('target_date', datetime.now().isoformat()).replace('Z', '+00:00'))
            months_remaining = max(0, round((target_date - datetime.now()).days / 30))
            remaining_amount = goal.get('target_amount', 0) - goal.get('current_amount', 0)
            required_monthly = remaining_amount / max(months_remaining, 1)
            progress = goal.get('progress_percentage', 0)
            priority = goal.get('priority', 'medium').lower()
            goal_name = goal.get('name', 'Financial Goal')
            
            if progress < 25 and priority == 'high':
                insights.append({
                    "id": f"goal_critical_{goal.get('id', 'GOAL')}_{current_time}",
                    "type": "warning",
                    "title": f"{goal_name} Severely Behind Schedule",
                    "description": f"CRITICAL: Your {goal_name} goal is only {progress:.1f}% complete with {months_remaining} months remaining. Immediate action required.",
                    "impact": "high",
                    "confidence": 95,
                    "actionable": True,
                    "recommendation": f"Urgently increase monthly investment to ₹{required_monthly:,.0f} or reassess goal timeline and target amount.",
                    "data": {
                        "current_value": f"₹{goal.get('current_amount', 0):,.0f}",
                        "target_value": f"₹{goal.get('target_amount', 0):,.0f}",
                        "change": f"₹{remaining_amount:,.0f} needed"
                    },
                    "generated_at": datetime.now().isoformat()
                })
        
        # 7. PORTFOLIO SIZE INSIGHTS  
        if portfolio_value < 100000:
            insights.append({
                "id": f"portfolio_small_{current_time}",
                "type": "opportunity",
                "title": "Building Your Wealth Foundation",
                "description": f"Your current portfolio value of ₹{portfolio_value:,.0f} is a good start! Focus on consistent SIP investments to accelerate wealth building.",
                "impact": "medium",
                "confidence": 85,
                "actionable": True,
                "recommendation": "Increase SIP amounts and maintain disciplined investing to reach ₹5L milestone faster.",
                "generated_at": datetime.now().isoformat()
            })
        elif 1000000 <= portfolio_value < 5000000:
            insights.append({
                "id": f"portfolio_growing_{current_time}",
                "type": "performance",
                "title": "Strong Wealth Accumulation Progress",
                "description": f"Impressive! Your portfolio of ₹{(portfolio_value/100000):.1f}L demonstrates excellent wealth building discipline. You're on track for financial independence.",
                "impact": "high",
                "confidence": 88,
                "actionable": False,
                "generated_at": datetime.now().isoformat()
            })
        
        # Limit to 12 insights
        return insights[:12]
    
    def generate_complete_ai_insights(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Main function to generate complete AI insights for a user"""
        
        scores = self.calculate_portfolio_scores(user_context)
        insights = self.generate_personalized_insights(user_context)
        
        return {
            "insights": insights,
            "portfolio_score": scores["portfolio_score"],
            "risk_score": scores["risk_score"],
            "diversification_score": scores["diversification_score"],
            "market_outlook": scores["market_outlook"],
            "next_review_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "last_updated": datetime.now().isoformat()
        }