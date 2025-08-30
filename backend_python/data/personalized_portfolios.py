"""
Personalized Portfolio Holdings - Different portfolios for different demo users
Each user gets holdings that match their risk profile and investment style
"""

import random
from typing import Dict, Any, List
from datetime import datetime

# Stock universe - Available stocks for portfolio creation
available_stocks = {
    "large_cap": [
        {"symbol": "TCS", "company_name": "Tata Consultancy Services", "sector": "Information Technology", "base_price": 4100},
        {"symbol": "INFY", "company_name": "Infosys Limited", "sector": "Information Technology", "base_price": 1520},
        {"symbol": "HDFCBANK", "company_name": "HDFC Bank Limited", "sector": "Banking", "base_price": 1750},
        {"symbol": "ICICIBANK", "company_name": "ICICI Bank Limited", "sector": "Banking", "base_price": 1200},
        {"symbol": "RELIANCE", "company_name": "Reliance Industries Limited", "sector": "Oil & Gas", "base_price": 2920},
        {"symbol": "BHARTIARTL", "company_name": "Bharti Airtel Limited", "sector": "Telecom", "base_price": 1650},
        {"symbol": "ITC", "company_name": "ITC Limited", "sector": "FMCG", "base_price": 470},
        {"symbol": "HINDUNILVR", "company_name": "Hindustan Unilever Limited", "sector": "FMCG", "base_price": 2800}
    ],
    "mid_cap": [
        {"symbol": "BAJFINANCE", "company_name": "Bajaj Finance Limited", "sector": "Financial Services", "base_price": 7650},
        {"symbol": "PIDILITIND", "company_name": "Pidilite Industries Limited", "sector": "Chemicals", "base_price": 3200},
        {"symbol": "PAGEIND", "company_name": "Page Industries Limited", "sector": "Textiles", "base_price": 42000},
        {"symbol": "DMART", "company_name": "Avenue Supermarts Limited", "sector": "Retail", "base_price": 4800},
        {"symbol": "MCDOWELL-N", "company_name": "United Spirits Limited", "sector": "Beverages", "base_price": 1100},
        {"symbol": "APOLLOHOSP", "company_name": "Apollo Hospitals Enterprise", "sector": "Healthcare", "base_price": 6500}
    ],
    "small_cap": [
        {"symbol": "TATACHEM", "company_name": "Tata Chemicals Limited", "sector": "Chemicals", "base_price": 1200},
        {"symbol": "DIXON", "company_name": "Dixon Technologies Limited", "sector": "Electronics", "base_price": 15000},
        {"symbol": "CAMS", "company_name": "Computer Age Management Services", "sector": "Financial Services", "base_price": 4500},
        {"symbol": "ROUTE", "company_name": "Route Mobile Limited", "sector": "Technology", "base_price": 2100},
        {"symbol": "HAPPSTMNDS", "company_name": "Happiest Minds Technologies", "sector": "Technology", "base_price": 1000}
    ]
}

# Mutual Fund universe - Available funds for portfolio creation
available_mutual_funds = {
    "large_cap": [
        {"name": "SBI Bluechip Fund - Direct Growth", "code": "SBI-BC-DG", "category": "Large Cap", "expense_ratio": 0.65, "nav": 78.50},
        {"name": "Mirae Asset Large Cap Fund - Direct Growth", "code": "MA-LC-DG", "category": "Large Cap", "expense_ratio": 0.52, "nav": 95.30},
        {"name": "Nippon India Large Cap Fund - Direct Growth", "code": "NI-LC-DG", "category": "Large Cap", "expense_ratio": 0.68, "nav": 67.80}
    ],
    "mid_cap": [
        {"name": "Axis Midcap Fund - Direct Growth", "code": "AXIS-MC-DG", "category": "Mid Cap", "expense_ratio": 0.73, "nav": 112.40},
        {"name": "Kotak Emerging Equity Fund - Direct Growth", "code": "KOTAK-EE-DG", "category": "Mid Cap", "expense_ratio": 0.65, "nav": 78.90},
        {"name": "DSP Midcap Fund - Direct Growth", "code": "DSP-MC-DG", "category": "Mid Cap", "expense_ratio": 0.71, "nav": 156.20}
    ],
    "small_cap": [
        {"name": "SBI Small Cap Fund - Direct Growth", "code": "SBI-SC-DG", "category": "Small Cap", "expense_ratio": 0.82, "nav": 98.70},
        {"name": "Axis Small Cap Fund - Direct Growth", "code": "AXIS-SC-DG", "category": "Small Cap", "expense_ratio": 0.78, "nav": 86.50},
        {"name": "Nippon India Small Cap Fund - Direct Growth", "code": "NI-SC-DG", "category": "Small Cap", "expense_ratio": 0.85, "nav": 134.60}
    ],
    "debt": [
        {"name": "HDFC Corporate Bond Fund - Direct Growth", "code": "HDFC-CB-DG", "category": "Corporate Bond", "expense_ratio": 0.28, "nav": 26.80},
        {"name": "ICICI Prudential Corporate Bond Fund - Direct Growth", "code": "ICICI-CB-DG", "category": "Corporate Bond", "expense_ratio": 0.32, "nav": 31.50},
        {"name": "SBI Magnum Medium Duration Fund - Direct Growth", "code": "SBI-MD-DG", "category": "Medium Duration", "expense_ratio": 0.45, "nav": 45.20}
    ],
    "hybrid": [
        {"name": "HDFC Balanced Advantage Fund - Direct Growth", "code": "HDFC-BA-DG", "category": "Balanced Advantage", "expense_ratio": 0.42, "nav": 68.90},
        {"name": "ICICI Prudential Equity & Debt Fund - Direct Growth", "code": "ICICI-ED-DG", "category": "Aggressive Hybrid", "expense_ratio": 0.58, "nav": 234.70}
    ],
    "international": [
        {"name": "Motilal Oswal Nasdaq 100 Fund - Direct Growth", "code": "MO-NASDAQ-DG", "category": "International", "expense_ratio": 0.65, "nav": 45.60},
        {"name": "PPFAS Long Term Equity Fund - Direct Growth", "code": "PPFAS-LTE-DG", "category": "International", "expense_ratio": 0.73, "nav": 67.80}
    ]
}

def generate_stock_holding(stock: Dict[str, Any], investment_amount: int) -> Dict[str, Any]:
    """Generate stock holding with realistic performance variation"""
    # More varied price movements (-15% to +25%)
    price_multiplier = 0.85 + random.random() * 0.4
    current_price = round(stock["base_price"] * price_multiplier)
    
    # Purchase price with more variation
    purchase_price_multiplier = 0.8 + random.random() * 0.3
    avg_purchase_price = round(current_price * purchase_price_multiplier)
    
    quantity = investment_amount // avg_purchase_price
    actual_investment = quantity * avg_purchase_price
    current_value = quantity * current_price
    gain_loss = current_value - actual_investment
    gain_loss_percentage = (gain_loss / actual_investment) * 100 if actual_investment > 0 else 0

    return {
        "symbol": stock["symbol"],
        "company_name": stock["company_name"],
        "quantity": quantity,
        "avg_purchase_price": avg_purchase_price,
        "current_price": current_price,
        "investment_amount": actual_investment,
        "current_value": current_value,
        "gain_loss": gain_loss,
        "gain_loss_percentage": round(gain_loss_percentage, 2),
        "sector": stock["sector"],
        "exchange": "NSE",
        "purchase_dates": ["2023-08-15", "2024-01-20"]
    }

def generate_mutual_fund_holding(fund: Dict[str, Any], investment_amount: int, sip_amount: int = 0) -> Dict[str, Any]:
    """Generate mutual fund holding with varied performance"""
    # More varied NAV performance (-8% to +18%)
    nav_multiplier = 0.92 + random.random() * 0.26
    current_nav = round(fund["nav"] * nav_multiplier, 2)
    
    # Average purchase NAV with variation
    avg_nav_multiplier = 0.85 + random.random() * 0.2
    avg_purchase_nav = round(current_nav * avg_nav_multiplier, 2)
    
    units = investment_amount / avg_purchase_nav
    current_value = units * current_nav
    gain_loss = current_value - investment_amount
    gain_loss_percentage = (gain_loss / investment_amount) * 100 if investment_amount > 0 else 0

    return {
        "scheme_name": fund["name"],
        "scheme_code": fund["code"],
        "units": round(units, 2),
        "nav": current_nav,
        "current_value": round(current_value),
        "investment_amount": investment_amount,
        "gain_loss": round(gain_loss),
        "gain_loss_percentage": round(gain_loss_percentage, 2),
        "category": fund["category"],
        "fund_house": fund["name"].split(' ')[0] + " Mutual Fund",
        "sip_amount": sip_amount,
        "sip_date": random.randint(1, 28),
        "sip_start_date": "2023-06-05",
        "expense_ratio": fund["expense_ratio"]
    }

def generate_conservative_portfolio(total_amount: int) -> Dict[str, Any]:
    """Generate conservative portfolio: 40% Stocks (Large Cap), 60% MFs (Large Cap + Debt)"""
    stocks = []
    mutual_funds = []
    
    stock_amount = int(total_amount * 0.40)
    mutual_fund_amount = int(total_amount * 0.60)
    
    # Add 3-4 large cap stocks
    selected_stocks = random.sample(available_stocks["large_cap"], 4)
    stock_amount_per_holding = stock_amount // len(selected_stocks)
    
    for stock in selected_stocks:
        stocks.append(generate_stock_holding(stock, stock_amount_per_holding))
    
    # Add mutual funds - mostly large cap and debt
    large_cap = random.choice(available_mutual_funds["large_cap"])
    debt = random.choice(available_mutual_funds["debt"])
    hybrid = random.choice(available_mutual_funds["hybrid"])
    
    mutual_funds.append(generate_mutual_fund_holding(large_cap, int(mutual_fund_amount * 0.5), 8000))
    mutual_funds.append(generate_mutual_fund_holding(debt, int(mutual_fund_amount * 0.3), 5000))
    mutual_funds.append(generate_mutual_fund_holding(hybrid, int(mutual_fund_amount * 0.2), 3000))
    
    return {"stocks": stocks, "mutual_funds": mutual_funds}

def generate_moderate_portfolio(total_amount: int) -> Dict[str, Any]:
    """Generate moderate portfolio: 50% Stocks (Mix of Large+Mid), 50% MFs (Diversified)"""
    stocks = []
    mutual_funds = []
    
    stock_amount = int(total_amount * 0.50)
    mutual_fund_amount = int(total_amount * 0.50)
    
    # Mix of large cap and mid cap stocks
    large_caps = random.sample(available_stocks["large_cap"], 3)
    mid_caps = random.sample(available_stocks["mid_cap"], 2)
    all_stocks = large_caps + mid_caps
    stock_amount_per_holding = stock_amount // len(all_stocks)
    
    for stock in all_stocks:
        stocks.append(generate_stock_holding(stock, stock_amount_per_holding))
    
    # Diversified mutual funds
    large_cap = random.choice(available_mutual_funds["large_cap"])
    mid_cap = random.choice(available_mutual_funds["mid_cap"])
    debt = random.choice(available_mutual_funds["debt"])
    international = random.choice(available_mutual_funds["international"])
    
    mutual_funds.append(generate_mutual_fund_holding(large_cap, int(mutual_fund_amount * 0.35), 10000))
    mutual_funds.append(generate_mutual_fund_holding(mid_cap, int(mutual_fund_amount * 0.25), 7000))
    mutual_funds.append(generate_mutual_fund_holding(debt, int(mutual_fund_amount * 0.25), 5000))
    mutual_funds.append(generate_mutual_fund_holding(international, int(mutual_fund_amount * 0.15), 3000))
    
    return {"stocks": stocks, "mutual_funds": mutual_funds}

def generate_aggressive_portfolio(total_amount: int) -> Dict[str, Any]:
    """Generate aggressive portfolio: 70% Stocks (All caps), 30% MFs (Growth focused)"""
    stocks = []
    mutual_funds = []
    
    stock_amount = int(total_amount * 0.70)
    mutual_fund_amount = int(total_amount * 0.30)
    
    # Mix of all categories with emphasis on growth
    large_caps = random.sample(available_stocks["large_cap"], 2)
    mid_caps = random.sample(available_stocks["mid_cap"], 3)
    small_caps = random.sample(available_stocks["small_cap"], 2)
    all_stocks = large_caps + mid_caps + small_caps
    stock_amount_per_holding = stock_amount // len(all_stocks)
    
    for stock in all_stocks:
        stocks.append(generate_stock_holding(stock, stock_amount_per_holding))
    
    # Growth-focused mutual funds
    mid_cap = random.choice(available_mutual_funds["mid_cap"])
    small_cap = random.choice(available_mutual_funds["small_cap"])
    international = random.choice(available_mutual_funds["international"])
    
    mutual_funds.append(generate_mutual_fund_holding(mid_cap, int(mutual_fund_amount * 0.4), 12000))
    mutual_funds.append(generate_mutual_fund_holding(small_cap, int(mutual_fund_amount * 0.4), 10000))
    mutual_funds.append(generate_mutual_fund_holding(international, int(mutual_fund_amount * 0.2), 5000))
    
    return {"stocks": stocks, "mutual_funds": mutual_funds}

def generate_personalized_portfolio(risk_profile: str, total_amount: int) -> Dict[str, Any]:
    """Main function to generate personalized portfolio based on risk profile"""
    if risk_profile == "conservative":
        return generate_conservative_portfolio(total_amount)
    elif risk_profile == "moderate":
        return generate_moderate_portfolio(total_amount)
    elif risk_profile == "aggressive":
        return generate_aggressive_portfolio(total_amount)
    else:
        return generate_moderate_portfolio(total_amount)

def calculate_portfolio_summary(stocks: List[Dict[str, Any]], mutual_funds: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate portfolio summary from stocks and mutual funds"""
    stock_investment = sum(stock["investment_amount"] for stock in stocks)
    stock_current_value = sum(stock["current_value"] for stock in stocks)
    stock_gain_loss = stock_current_value - stock_investment
    
    mf_investment = sum(mf["investment_amount"] for mf in mutual_funds)
    mf_current_value = sum(mf["current_value"] for mf in mutual_funds)
    mf_gain_loss = mf_current_value - mf_investment
    
    total_investment = stock_investment + mf_investment
    total_current_value = stock_current_value + mf_current_value
    total_gain_loss = total_current_value - total_investment
    gain_loss_percentage = (total_gain_loss / total_investment) * 100 if total_investment > 0 else 0
    
    # Calculate asset allocation
    stocks_percentage = (stock_current_value / total_current_value) * 100 if total_current_value > 0 else 0
    mutual_funds_percentage = (mf_current_value / total_current_value) * 100 if total_current_value > 0 else 0
    
    return {
        "total_investment": round(total_investment),
        "total_current_value": round(total_current_value),
        "total_gain_loss": round(total_gain_loss),
        "gain_loss_percentage": round(gain_loss_percentage, 2),
        "updated_at": datetime.now().isoformat(),
        "asset_allocation": {
            "stocks": {
                "value": round(stock_current_value),
                "percentage": round(stocks_percentage, 2)
            },
            "mutual_funds": {
                "value": round(mf_current_value), 
                "percentage": round(mutual_funds_percentage, 2)
            }
        }
    }

def get_complete_portfolio_data(risk_profile: str, total_amount: int) -> Dict[str, Any]:
    """Get complete portfolio data with summary"""
    portfolio_holdings = generate_personalized_portfolio(risk_profile, total_amount)
    portfolio_summary = calculate_portfolio_summary(
        portfolio_holdings["stocks"],
        portfolio_holdings["mutual_funds"]
    )
    
    return {
        "summary": portfolio_summary,
        "stocks": portfolio_holdings["stocks"],
        "mutual_funds": portfolio_holdings["mutual_funds"]
    }