"""
Risk Analysis Service - Comprehensive portfolio risk calculations
"""

import logging
import math
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class RiskAnalysisService:
    def __init__(self):
        pass
    
    def calculate_sector_risk(self, stocks: List[Dict[str, Any]], portfolio_value: float) -> float:
        """Calculate sector concentration risk"""
        
        if not stocks or portfolio_value <= 0:
            return 0
        
        sector_exposure = {}
        max_sector_exposure = 0
        
        for stock in stocks:
            sector = stock.get('sector', 'Other')
            if sector not in sector_exposure:
                sector_exposure[sector] = 0
            sector_exposure[sector] += stock.get('current_value', 0)
        
        # Calculate percentages and find max exposure
        for sector in sector_exposure:
            percentage = (sector_exposure[sector] / portfolio_value) * 100
            max_sector_exposure = max(max_sector_exposure, percentage)
        
        # Risk score: 0-30 (low), 31-50 (moderate), 51+ (high)
        return min(100, round(max_sector_exposure * 2))
    
    def calculate_concentration_risk(self, holdings: List[Dict[str, Any]], portfolio_value: float) -> float:
        """Calculate concentration risk based on individual holdings"""
        
        if not holdings or portfolio_value <= 0:
            return 0
        
        max_holding_percentage = 0
        top3_holdings_percentage = 0
        
        holding_percentages = []
        for holding in holdings:
            percentage = (holding.get('current_value', 0) / portfolio_value) * 100
            holding_percentages.append(percentage)
        
        holding_percentages.sort(reverse=True)
        
        max_holding_percentage = holding_percentages[0] if holding_percentages else 0
        top3_holdings_percentage = sum(holding_percentages[:3])
        
        # Risk score based on concentration
        risk_score = 0
        
        if max_holding_percentage > 25:
            risk_score += 40
        elif max_holding_percentage > 15:
            risk_score += 25
        elif max_holding_percentage > 10:
            risk_score += 15
        
        if top3_holdings_percentage > 60:
            risk_score += 30
        elif top3_holdings_percentage > 40:
            risk_score += 20
        elif top3_holdings_percentage > 30:
            risk_score += 10
        
        return min(100, risk_score)
    
    def calculate_volatility_risk(self, stocks: List[Dict[str, Any]], mutual_funds: List[Dict[str, Any]]) -> float:
        """Calculate volatility risk based on asset types and performance"""
        
        volatility_score = 30  # Base score
        
        # Small cap exposure increases volatility
        small_cap_funds = len([mf for mf in mutual_funds 
                              if mf.get('fund_category', '').lower().find('small') != -1])
        volatility_score += small_cap_funds * 15
        
        # Mid cap exposure
        mid_cap_funds = len([mf for mf in mutual_funds 
                            if mf.get('fund_category', '').lower().find('mid') != -1])
        volatility_score += mid_cap_funds * 10
        
        # Direct stock exposure
        volatility_score += min(len(stocks) * 5, 25)
        
        # Performance volatility (wide range of returns indicates higher volatility)
        all_returns = []
        for stock in stocks:
            all_returns.append(stock.get('gain_loss_percentage', 0))
        for mf in mutual_funds:
            all_returns.append(mf.get('gain_loss_percentage', 0))
        
        if all_returns:
            max_return = max(all_returns)
            min_return = min(all_returns)
            return_spread = max_return - min_return
            
            if return_spread > 30:
                volatility_score += 20
            elif return_spread > 20:
                volatility_score += 15
            elif return_spread > 10:
                volatility_score += 10
        
        return min(100, round(volatility_score))
    
    def calculate_credit_risk(self, mutual_funds: List[Dict[str, Any]]) -> float:
        """Calculate credit risk based on debt fund quality"""
        
        debt_funds = [mf for mf in mutual_funds 
                     if any(keyword in mf.get('fund_category', '').lower() 
                           for keyword in ['debt', 'bond', 'duration'])]
        
        if not debt_funds:
            return 20  # No debt exposure = low credit risk
        
        # Assume AAA-rated funds have lower risk
        # Higher expense ratio might indicate riskier credit exposure
        total_expense_ratio = sum(mf.get('expense_ratio', 0.5) for mf in debt_funds)
        avg_expense_ratio = total_expense_ratio / len(debt_funds) if debt_funds else 0.5
        
        credit_risk = 25  # Base risk
        if avg_expense_ratio > 0.6:
            credit_risk += 15
        if avg_expense_ratio > 0.8:
            credit_risk += 10
        
        return min(100, credit_risk)
    
    def calculate_liquidity_risk(self, stocks: List[Dict[str, Any]], mutual_funds: List[Dict[str, Any]], portfolio_value: float) -> float:
        """Calculate liquidity risk"""
        
        if portfolio_value <= 0:
            return 40
        
        stock_value = sum(stock.get('current_value', 0) for stock in stocks)
        stock_percentage = (stock_value / portfolio_value) * 100
        
        # Listed stocks are generally liquid
        liquidity_risk = max(0, 40 - stock_percentage)  # Lower risk with more stocks
        
        # Mutual funds are generally liquid (T+1 to T+3)
        liquidity_risk = max(10, liquidity_risk - 10)
        
        # Small cap funds have lower liquidity
        small_cap_value = sum(mf.get('current_value', 0) for mf in mutual_funds
                             if 'small' in mf.get('fund_category', '').lower())
        small_cap_percentage = (small_cap_value / portfolio_value) * 100
        
        liquidity_risk += small_cap_percentage * 0.5
        
        return min(100, round(liquidity_risk))
    
    def calculate_currency_risk(self, mutual_funds: List[Dict[str, Any]], portfolio_value: float) -> float:
        """Calculate currency risk (international exposure)"""
        
        if portfolio_value <= 0:
            return 0
        
        international_value = sum(mf.get('current_value', 0) for mf in mutual_funds
                                 if 'international' in mf.get('fund_category', '').lower())
        international_percentage = (international_value / portfolio_value) * 100
        
        # Currency risk increases with international exposure
        return min(100, round(international_percentage * 2))
    
    def generate_risk_factors(self, portfolio: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate risk factors analysis"""
        
        stocks = portfolio.get('stocks', [])
        mutual_funds = portfolio.get('mutual_funds', [])
        summary = portfolio.get('summary', {})
        portfolio_value = summary.get('total_current_value', 0)
        
        concentration_risk = self.calculate_concentration_risk([*stocks, *mutual_funds], portfolio_value)
        sector_risk = self.calculate_sector_risk(stocks, portfolio_value)
        volatility_risk = self.calculate_volatility_risk(stocks, mutual_funds)
        credit_risk = self.calculate_credit_risk(mutual_funds)
        liquidity_risk = self.calculate_liquidity_risk(stocks, mutual_funds, portfolio_value)
        currency_risk = self.calculate_currency_risk(mutual_funds, portfolio_value)
        
        factors = []
        
        # Portfolio Concentration
        concentration_status = 'good'
        concentration_desc = 'Well diversified portfolio with balanced position sizes'
        concentration_rec = 'Current allocation is optimal'
        
        if concentration_risk > 60:
            concentration_status = 'high'
            concentration_desc = 'High concentration in few holdings increases portfolio risk'
            concentration_rec = 'Consider diversifying by reducing large positions and adding more holdings'
        elif concentration_risk > 30:
            concentration_status = 'moderate'
            concentration_desc = 'Moderate concentration risk - some holdings are significantly large'
            concentration_rec = 'Monitor large positions and consider gradual rebalancing'
        
        factors.append({
            'name': 'Portfolio Concentration',
            'score': concentration_risk,
            'status': concentration_status,
            'description': concentration_desc,
            'recommendation': concentration_rec
        })
        
        # Sector Risk
        sector_status = 'good'
        sector_desc = 'Good sector diversification across multiple industries'
        sector_rec = 'Continue maintaining balanced sector allocation'
        
        if sector_risk > 50:
            sector_status = 'high'
            sector_desc = 'High exposure to single sector creates concentration risk'
            sector_rec = 'Diversify across sectors to reduce single-sector dependency'
        elif sector_risk > 30:
            sector_status = 'moderate'
            sector_desc = 'Moderate sector concentration - one sector dominates portfolio'
            sector_rec = 'Consider reducing exposure to dominant sector'
        
        factors.append({
            'name': 'Sector Allocation',
            'score': sector_risk,
            'status': sector_status,
            'description': sector_desc,
            'recommendation': sector_rec
        })
        
        # Market Cap Risk
        small_cap_value = sum(mf.get('current_value', 0) for mf in mutual_funds
                             if 'small' in mf.get('fund_category', '').lower())
        small_cap_percentage = (small_cap_value / portfolio_value) * 100 if portfolio_value > 0 else 0
        
        market_cap_status = 'good'
        market_cap_desc = 'Balanced allocation across market capitalizations'
        market_cap_rec = 'Current market cap allocation is appropriate'
        
        if small_cap_percentage > 30:
            market_cap_status = 'high'
            market_cap_desc = 'High small-cap exposure increases volatility risk'
            market_cap_rec = 'Consider reducing small-cap allocation below 20%'
        elif small_cap_percentage > 20:
            market_cap_status = 'moderate'
            market_cap_desc = 'Moderate small-cap exposure - monitor for volatility'
            market_cap_rec = 'Small-cap exposure is at upper limit, consider rebalancing'
        
        factors.append({
            'name': 'Market Cap Risk',
            'score': min(100, small_cap_percentage * 3),
            'status': market_cap_status,
            'description': market_cap_desc,
            'recommendation': market_cap_rec
        })
        
        # Credit Quality
        factors.append({
            'name': 'Credit Quality',
            'score': credit_risk,
            'status': 'high' if credit_risk > 50 else 'moderate' if credit_risk > 30 else 'good',
            'description': ('Debt funds may have credit quality concerns' if credit_risk > 50 else
                           'Moderate credit risk in debt allocation' if credit_risk > 30 else
                           'High quality debt funds with good credit ratings'),
            'recommendation': ('Review debt fund credit quality and consider AAA-rated funds' if credit_risk > 50 else
                              'Monitor debt fund performance closely' if credit_risk > 30 else
                              'Maintain current credit quality standards')
        })
        
        # Liquidity Profile
        factors.append({
            'name': 'Liquidity Profile',
            'score': liquidity_risk,
            'status': 'high' if liquidity_risk > 50 else 'moderate' if liquidity_risk > 30 else 'good',
            'description': ('Lower liquidity due to small-cap heavy allocation' if liquidity_risk > 50 else
                           'Moderate liquidity with some illiquid holdings' if liquidity_risk > 30 else
                           'High liquidity portfolio suitable for emergency needs'),
            'recommendation': ('Increase allocation to large-cap and liquid funds' if liquidity_risk > 50 else
                              'Maintain some allocation to liquid funds' if liquidity_risk > 30 else
                              'Excellent liquidity for emergencies')
        })
        
        return factors
    
    def calculate_var_analysis(self, portfolio: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate VaR and risk metrics"""
        
        summary = portfolio.get('summary', {})
        total_investment = summary.get('total_investment', 0)
        total_current_value = summary.get('total_current_value', 0)
        
        if total_investment > 0:
            total_return = ((total_current_value - total_investment) / total_investment) * 100
        else:
            total_return = 0
        
        # Simplified VaR calculation based on portfolio composition
        asset_allocation = summary.get('asset_allocation', {})
        equity_percentage = 0
        
        # Calculate equity percentage from asset allocation
        for asset_type, data in asset_allocation.items():
            if 'stock' in asset_type.lower() or 'equity' in asset_type.lower():
                equity_percentage += data.get('percentage', 0)
        
        base_volatility = 15  # Base annual volatility
        
        # Adjust volatility based on portfolio composition
        portfolio_volatility = base_volatility * (equity_percentage / 100)
        portfolio_volatility += 5  # Add debt volatility
        
        # Daily VaR at 95% confidence (assuming normal distribution)
        daily_volatility = portfolio_volatility / math.sqrt(252)  # 252 trading days
        daily_var_95 = daily_volatility * 1.645  # 95% confidence z-score
        daily_var_99 = daily_volatility * 2.33   # 99% confidence z-score
        
        # Monthly VaR
        monthly_var_95 = daily_var_95 * math.sqrt(21)  # 21 trading days per month
        
        # Max drawdown estimation
        max_drawdown = min(25, max(5, portfolio_volatility * 0.8))
        
        # Sharpe ratio calculation
        risk_free_rate = 6.5  # Current Indian risk-free rate
        excess_return = total_return - risk_free_rate
        sharpe_ratio = excess_return / portfolio_volatility if portfolio_volatility > 0 else 0
        
        # Beta calculation (vs market)
        market_volatility = 18  # Nifty volatility
        beta = portfolio_volatility / market_volatility if market_volatility > 0 else 1
        
        return {
            'daily_var_95': round(daily_var_95, 2),
            'daily_var_99': round(daily_var_99, 2),
            'monthly_var_95': round(monthly_var_95, 2),
            'max_drawdown': round(max_drawdown, 2),
            'sharpe_ratio': round(sharpe_ratio, 2),
            'beta': round(beta, 2)
        }
    
    def generate_stress_test_scenarios(self, portfolio: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate stress test scenarios"""
        
        summary = portfolio.get('summary', {})
        asset_allocation = summary.get('asset_allocation', {})
        
        equity_percentage = 0
        mutual_funds_percentage = 0
        
        for asset_type, data in asset_allocation.items():
            percentage = data.get('percentage', 0)
            if 'stock' in asset_type.lower():
                equity_percentage += percentage
            elif 'mutual' in asset_type.lower():
                mutual_funds_percentage += percentage
        
        return [
            {
                'scenario': 'Market Crash (-30%)',
                'impact': round(-((equity_percentage * 0.3 + mutual_funds_percentage * 0.25) * 0.01), 2),
                'probability': 'Low (2-5%)'
            },
            {
                'scenario': 'Sector Rotation Impact',
                'impact': round(-(equity_percentage * 0.15 * 0.01), 2),
                'probability': 'Medium (15-20%)'
            },
            {
                'scenario': 'Interest Rate Hike (+200bps)',
                'impact': round(-((mutual_funds_percentage * 0.08 + equity_percentage * 0.05) * 0.01), 2),
                'probability': 'High (30-40%)'
            },
            {
                'scenario': 'Currency Devaluation (-15%)',
                'impact': round(-(equity_percentage * 0.05 * 0.01), 2),
                'probability': 'Medium (10-15%)'
            },
            {
                'scenario': 'Inflation Spike (>7%)',
                'impact': round(-((equity_percentage * 0.08 + mutual_funds_percentage * 0.06) * 0.01), 2),
                'probability': 'Medium (20-25%)'
            }
        ]
    
    def generate_risk_radar_data(self, risk_factors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate radar chart data for risk profile"""
        
        return [{
            'category': factor['name'].split(' ')[0],  # Shortened names for radar
            'current': factor['score'],
            'optimal': 30 if factor['score'] > 50 else 25 if factor['score'] > 30 else factor['score']
        } for factor in risk_factors]
    
    def calculate_risk_analysis(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Main function to calculate comprehensive risk analysis"""
        
        portfolio = user_context.get('portfolio', {})
        user_profile = user_context.get('user_profile', {})
        stocks = portfolio.get('stocks', [])
        mutual_funds = portfolio.get('mutual_funds', [])
        summary = portfolio.get('summary', {})
        portfolio_value = summary.get('total_current_value', 0)
        
        # Calculate individual risk scores
        concentration_risk = self.calculate_concentration_risk([*stocks, *mutual_funds], portfolio_value)
        sector_risk = self.calculate_sector_risk(stocks, portfolio_value)
        volatility_risk = self.calculate_volatility_risk(stocks, mutual_funds)
        credit_risk = self.calculate_credit_risk(mutual_funds)
        liquidity_risk = self.calculate_liquidity_risk(stocks, mutual_funds, portfolio_value)
        currency_risk = self.calculate_currency_risk(mutual_funds, portfolio_value)
        
        # Calculate overall risk score
        overall_risk = round((concentration_risk + sector_risk + volatility_risk + 
                             credit_risk + liquidity_risk + currency_risk) / 6)
        
        risk_metrics = {
            'overall_score': overall_risk,
            'risk_level': 'aggressive' if overall_risk > 70 else 'moderate' if overall_risk > 40 else 'conservative',
            'volatility_score': volatility_risk,
            'concentration_risk': concentration_risk,
            'sector_risk': sector_risk,
            'credit_risk': credit_risk,
            'liquidity_risk': liquidity_risk,
            'currency_risk': currency_risk
        }
        
        risk_factors = self.generate_risk_factors(portfolio)
        var_analysis = self.calculate_var_analysis(portfolio, user_profile)
        stress_test = self.generate_stress_test_scenarios(portfolio)
        radar_data = self.generate_risk_radar_data(risk_factors)
        
        return {
            'metrics': risk_metrics,
            'factors': risk_factors,
            'var_analysis': var_analysis,
            'stress_test': stress_test,
            'radar_data': radar_data
        }