"""
Market Analysis Service - Generate personalized market impact based on user's portfolio
"""

import logging
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import math

logger = logging.getLogger(__name__)


class MarketAnalysisService:
    def __init__(self):
        # Sector market data - in production this would come from a market data API
        self.sector_market_data = {
            'Information Technology': {
                'performance': 1.6,
                'outlook': 'bullish',
                'recommendation': 'Strong Buy',
                'reasoning': 'AI adoption driving growth, strong export demand'
            },
            'Banking': {
                'performance': -0.3,
                'outlook': 'neutral',
                'recommendation': 'Hold',
                'reasoning': 'Credit growth slowing, NPA concerns persist'
            },
            'Oil & Gas': {
                'performance': 2.1,
                'outlook': 'bullish',
                'recommendation': 'Buy',
                'reasoning': 'Refining margins improving, stable crude prices'
            },
            'FMCG': {
                'performance': -0.5,
                'outlook': 'bearish',
                'recommendation': 'Sell',
                'reasoning': 'Rural demand weakness, margin pressure'
            },
            'Healthcare': {
                'performance': 0.8,
                'outlook': 'bullish',
                'recommendation': 'Buy',
                'reasoning': 'Generic drug demand stable, export growth'
            },
            'Financial Services': {
                'performance': -0.2,
                'outlook': 'neutral',
                'recommendation': 'Hold',
                'reasoning': 'Interest rate cycle peaking, asset quality stable'
            },
            'Telecom': {
                'performance': 1.2,
                'outlook': 'bullish',
                'recommendation': 'Buy',
                'reasoning': '5G rollout driving capex, ARPU improvement'
            },
            'Chemicals': {
                'performance': 0.3,
                'outlook': 'neutral',
                'recommendation': 'Hold',
                'reasoning': 'China +1 benefit offset by pricing pressure'
            },
            'Textiles': {
                'performance': -1.2,
                'outlook': 'bearish',
                'recommendation': 'Sell',
                'reasoning': 'Global demand slowdown, cotton price volatility'
            },
            'Retail': {
                'performance': 0.9,
                'outlook': 'bullish',
                'recommendation': 'Buy',
                'reasoning': 'Festive season demand, omnichannel growth'
            }
        }
        
        # Sample sector movements for impact calculation
        self.sector_movements = {
            'Information Technology': 1.6,
            'Banking': -0.3,
            'Oil & Gas': 2.1,
            'FMCG': -0.5,
            'Healthcare': 0.8,
            'Financial Services': -0.2,
            'Telecom': 1.2,
            'Chemicals': 0.3,
            'Textiles': -1.2,
            'Retail': 0.9
        }
    
    def generate_sector_analysis(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate portfolio-specific sector analysis"""
        
        portfolio = user_context.get('portfolio', {})
        stocks = portfolio.get('stocks', [])
        portfolio_value = portfolio.get('summary', {}).get('total_current_value', 0)
        
        if not stocks or portfolio_value <= 0:
            return []
        
        # Calculate user's sector exposure
        sector_exposure = {}
        for stock in stocks:
            sector = stock.get('sector', 'Other')
            if sector not in sector_exposure:
                sector_exposure[sector] = {'value': 0, 'percentage': 0, 'stocks': []}
            sector_exposure[sector]['value'] += stock.get('current_value', 0)
            sector_exposure[sector]['stocks'].append(stock)
        
        # Calculate percentages
        for sector in sector_exposure:
            sector_exposure[sector]['percentage'] = (sector_exposure[sector]['value'] / portfolio_value) * 100
        
        # Generate sector analysis based on user's actual holdings
        sectors = []
        for sector, data in sector_exposure.items():
            market_info = self.sector_market_data.get(sector, {
                'performance': random.uniform(-1, 2),  # Random between -1 and 2
                'outlook': 'neutral',
                'recommendation': 'Hold',
                'reasoning': 'Mixed sector fundamentals'
            })
            
            sectors.append({
                'name': sector,
                'user_exposure': data['percentage'],
                'performance': market_info['performance'],
                'outlook': market_info['outlook'],
                'recommendation': market_info['recommendation'],
                'reasoning': market_info['reasoning'],
                'stocks_held': ', '.join(stock.get('symbol', '') for stock in data['stocks']),
                'impact_on_portfolio': (data['percentage'] * market_info['performance']) / 100
            })
        
        # Sort by user exposure (most relevant sectors first)
        return sorted(sectors, key=lambda x: x['user_exposure'], reverse=True)
    
    def calculate_portfolio_impact(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate portfolio impact from market movements"""
        
        portfolio = user_context.get('portfolio', {})
        stocks = portfolio.get('stocks', [])
        portfolio_value = portfolio.get('summary', {}).get('total_current_value', 0)
        
        if not stocks or portfolio_value <= 0:
            return {
                'total_impact': 0,
                'positive_impact': 0,
                'negative_impact': 0,
                'sector_impacts': []
            }
        
        # Calculate sector-wise impact
        total_positive_impact = 0
        total_negative_impact = 0
        sector_impacts = []
        
        sector_exposure = {}
        for stock in stocks:
            sector = stock.get('sector', 'Other')
            if sector not in sector_exposure:
                sector_exposure[sector] = {'value': 0, 'percentage': 0}
            sector_exposure[sector]['value'] += stock.get('current_value', 0)
        
        for sector, data in sector_exposure.items():
            movement = self.sector_movements.get(sector, 0)
            impact = (data['value'] * movement) / 100
            
            if impact > 0:
                total_positive_impact += impact
            else:
                total_negative_impact += abs(impact)
            
            sector_impacts.append({
                'sector': sector,
                'movement': movement,
                'impact': impact,
                'value': data['value']
            })
        
        # Sort by absolute impact (most impactful first)
        sector_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)
        
        return {
            'total_impact': total_positive_impact - total_negative_impact,
            'positive_impact': total_positive_impact,
            'negative_impact': total_negative_impact,
            'sector_impacts': sector_impacts
        }
    
    def generate_market_sentiment(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate market sentiment based on user's portfolio characteristics"""
        
        portfolio = user_context.get('portfolio', {})
        investment_profile = user_context.get('investment_profile', {})
        risk_tolerance = investment_profile.get('risk_tolerance', 'moderate').lower()
        asset_allocation = portfolio.get('summary', {}).get('asset_allocation', {})
        
        # Calculate equity percentage
        equity_percentage = 0
        for asset_type, data in asset_allocation.items():
            if 'stock' in asset_type.lower():
                equity_percentage += data.get('percentage', 0)
            elif 'mutual' in asset_type.lower():
                # Assuming 70% of MFs are equity
                equity_percentage += data.get('percentage', 0) * 0.7
        
        sentiment_score = 65  # Base sentiment
        factors = []
        
        # Adjust sentiment based on portfolio characteristics
        if equity_percentage > 70:
            sentiment_score += 10
            factors.append('High equity exposure benefits from market rally')
        elif equity_percentage < 40:
            sentiment_score -= 5
            factors.append('Conservative allocation limits upside participation')
        
        # Risk tolerance impact
        if risk_tolerance == 'aggressive':
            sentiment_score += 5
            factors.append('Aggressive risk profile aligns with market momentum')
        elif risk_tolerance == 'conservative':
            sentiment_score -= 5
            factors.append('Conservative approach provides downside protection')
        
        # Add general market factors
        factors.extend([
            'Strong corporate earnings growth',
            'Stable inflation and interest rates',
            'Positive foreign institutional investor flows'
        ])
        
        sentiment_score = max(0, min(100, sentiment_score))
        trend = 'bullish' if sentiment_score > 70 else 'bearish' if sentiment_score < 50 else 'neutral'
        
        return {
            'score': sentiment_score,
            'trend': trend,
            'factors': factors[:4]
        }
    
    def generate_personalized_news(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate personalized news based on user's holdings"""
        
        portfolio = user_context.get('portfolio', {})
        stocks = portfolio.get('stocks', [])
        mutual_funds = portfolio.get('mutual_funds', [])
        news = []
        
        # Get unique sectors from user's holdings
        sectors = list(set(stock.get('sector', '') for stock in stocks if stock.get('sector')))
        
        # Base market news
        news.append({
            'title': 'Indian markets show resilience amid global volatility',
            'impact': 'positive',
            'source': 'Economic Times',
            'relevance': 'high'
        })
        
        # Sector-specific news based on user's holdings
        if 'Information Technology' in sectors:
            it_stocks = [s.get('symbol', '') for s in stocks if s.get('sector') == 'Information Technology']
            news.append({
                'title': 'IT sector shows strong Q3 results, AI adoption accelerating',
                'impact': 'positive',
                'source': 'Moneycontrol',
                'relevance': 'high',
                'reason': f'You hold IT stocks: {", ".join(it_stocks)}'
            })
        
        if any(sector in sectors for sector in ['Banking', 'Financial Services']):
            banking_stocks = [s.get('symbol', '') for s in stocks 
                            if s.get('sector') in ['Banking', 'Financial Services']]
            news.append({
                'title': 'RBI maintains accommodative stance, banking sector relief',
                'impact': 'positive',
                'source': 'Business Standard',
                'relevance': 'high',
                'reason': f'You hold banking/financial stocks: {", ".join(banking_stocks)}'
            })
        
        if 'Oil & Gas' in sectors:
            oil_stocks = [s.get('symbol', '') for s in stocks if s.get('sector') == 'Oil & Gas']
            news.append({
                'title': 'Crude oil prices stabilize, refining margins improve',
                'impact': 'positive',
                'source': 'Reuters',
                'relevance': 'medium',
                'reason': f'You hold oil & gas stocks: {", ".join(oil_stocks)}'
            })
        
        # Mutual fund related news
        international_funds = [mf for mf in mutual_funds 
                             if 'international' in mf.get('fund_category', '').lower()]
        if international_funds:
            news.append({
                'title': 'Global markets show resilience, USD strengthening',
                'impact': 'positive',
                'source': 'Financial Express',
                'relevance': 'medium',
                'reason': 'You hold international funds'
            })
        
        debt_funds = [mf for mf in mutual_funds 
                     if 'debt' in mf.get('fund_category', '').lower()]
        if debt_funds:
            news.append({
                'title': 'Debt market outlook stable with rate cycle peaking',
                'impact': 'neutral',
                'source': 'Mint',
                'relevance': 'medium',
                'reason': 'You hold debt funds'
            })
        
        return news[:5]  # Return top 5 relevant news items
    
    def generate_chart_data(self, user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate historical chart data with portfolio correlation"""
        
        portfolio = user_context.get('portfolio', {})
        summary = portfolio.get('summary', {})
        total_investment = summary.get('total_investment', 0)
        total_current_value = summary.get('total_current_value', 0)
        
        portfolio_return = 0
        if total_investment > 0:
            portfolio_return = ((total_current_value - total_investment) / total_investment) * 100
        
        # Generate 30 days of data
        chart_data = []
        base_date = datetime.now() - timedelta(days=30)
        
        # Starting values
        nifty_base = 19350
        sensex_base = 65000
        nifty_bank_base = 44500
        nifty_it_base = 30200
        portfolio_base = 100  # Portfolio index starting at 100
        
        for i in range(30):
            current_date = base_date + timedelta(days=i)
            
            # Generate realistic market movements
            market_movement = (random.random() - 0.5) * 2  # ±1% daily movement
            nifty_base *= (1 + market_movement / 100)
            sensex_base *= (1 + market_movement / 100)
            
            # Sector indices with different correlations to main market
            bank_movement = market_movement * 1.2 + (random.random() - 0.5) * 1  # Banking more volatile
            it_movement = market_movement * 0.9 + (random.random() - 0.5) * 1.5  # IT with tech-specific volatility
            
            nifty_bank_base *= (1 + bank_movement / 100)
            nifty_it_base *= (1 + it_movement / 100)
            
            # Portfolio movement correlated but with user's beta
            portfolio_beta = 1.1  # Slightly more volatile than market
            portfolio_movement = market_movement * portfolio_beta + (random.random() - 0.5) * 0.5
            portfolio_base *= (1 + portfolio_movement / 100)
            
            chart_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'nifty': round(nifty_base),
                'sensex': round(sensex_base),
                'nifty_bank': round(nifty_bank_base),
                'nifty_it': round(nifty_it_base),
                'portfolio': round(portfolio_base * 100) / 100
            })
        
        return chart_data
    
    def generate_market_analysis(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Main function to generate complete market analysis"""
        
        sector_analysis = self.generate_sector_analysis(user_context)
        portfolio_impact = self.calculate_portfolio_impact(user_context)
        market_sentiment = self.generate_market_sentiment(user_context)
        personalized_news = self.generate_personalized_news(user_context)
        chart_data = self.generate_chart_data(user_context)
        
        # Current market indices (in real implementation, fetch from market data API)
        indices = {
            'nifty50': {'value': 19856.50, 'change': 245.30, 'change_percent': 1.25},
            'sensex': {'value': 66598.20, 'change': 823.45, 'change_percent': 1.25},
            'nifty_bank': {'value': 44234.10, 'change': -156.80, 'change_percent': -0.35},
            'nifty_it': {'value': 29567.30, 'change': 467.20, 'change_percent': 1.60}
        }
        
        return {
            'indices': indices,
            'sectors': sector_analysis,
            'market_sentiment': market_sentiment,
            'portfolio_impact': portfolio_impact,
            'chart_data': chart_data,
            'news_summary': personalized_news,
            'last_updated': datetime.now().isoformat(),
            'user_specific': True
        }