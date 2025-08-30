"""
Kite Connect integration service for live portfolio data
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from kiteconnect import KiteConnect

from config.settings import get_settings
from models.user import UserProfile, FinancialProfile, InvestmentProfile, Portfolio, StockHolding, MutualFundHolding
from models.portfolio import KiteHolding, KiteMFHolding

logger = logging.getLogger(__name__)
settings = get_settings()


class KiteService:
    def __init__(self):
        if not settings.kite_api_key or not settings.kite_api_secret:
            raise ValueError("Kite API credentials not found in environment variables")
        
        self.api_key = settings.kite_api_key
        self.api_secret = settings.kite_api_secret
        
        # Initialize Kite Connect instance
        self.kite = KiteConnect(api_key=self.api_key)
        
        logger.info(f"KiteService initialized with API Key: {self.api_key}")
        logger.info("Redirect URL is configured in Kite Connect dashboard")
    
    def get_login_url(self) -> str:
        """Generate login URL for OAuth flow"""
        try:
            login_url = self.kite.login_url()
            logger.info(f"Generated Kite login URL: {login_url}")
            return login_url
        except Exception as e:
            logger.error(f"Error generating Kite login URL: {str(e)}")
            raise
    
    async def generate_session(self, request_token: str) -> Dict[str, Any]:
        """Generate session from request token"""
        try:
            logger.info(f"Generating Kite session with request token: {request_token}")
            
            # Generate session
            data = self.kite.generate_session(request_token, api_secret=self.api_secret)
            
            logger.info("Kite session generated successfully")
            
            return {
                "accessToken": data["access_token"],
                "publicToken": data.get("public_token"),
                "userId": data["user_id"],
                "userShortname": data.get("user_shortname"),
                "email": data.get("email"),
                "loginTime": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error generating Kite session: {str(e)}")
            raise
    
    def set_access_token(self, access_token: str):
        """Set access token for API calls"""
        self.kite.set_access_token(access_token)
    
    async def get_user_profile(self) -> Dict[str, Any]:
        """Get user profile from Kite"""
        try:
            profile = self.kite.profile()
            logger.info(f"Fetched Kite user profile for user: {profile.get('user_id')}")
            return profile
        except Exception as e:
            logger.error(f"Error fetching Kite user profile: {str(e)}")
            raise
    
    async def get_portfolio_holdings(self) -> List[Dict[str, Any]]:
        """Get stock portfolio holdings from Kite"""
        try:
            holdings = self.kite.holdings()
            logger.info(f"Fetched {len(holdings)} stock holdings from Kite")
            return holdings
        except Exception as e:
            logger.error(f"Error fetching Kite portfolio holdings: {str(e)}")
            raise
    
    async def get_mutual_fund_holdings(self) -> List[Dict[str, Any]]:
        """Get mutual fund holdings from Kite"""
        try:
            # Note: Kite Connect may have limited MF support, this is a placeholder
            # In practice, you might need to use different endpoints or services
            try:
                mf_holdings = self.kite.holdings()  # Filter for MF if available
                # Filter out non-MF holdings if needed
                mf_only = [h for h in mf_holdings if 'MF' in h.get('exchange', '')]
                logger.info(f"Fetched {len(mf_only)} mutual fund holdings from Kite")
                return mf_only
            except:
                # Return empty list if MF holdings not available
                logger.warning("Mutual fund holdings not available through Kite Connect")
                return []
        except Exception as e:
            logger.error(f"Error fetching Kite MF holdings: {str(e)}")
            return []
    
    def transform_kite_to_portfolio(self, holdings: List[Dict[str, Any]], 
                                  mf_holdings: List[Dict[str, Any]], 
                                  kite_profile: Dict[str, Any]) -> Portfolio:
        """Transform Kite holdings to our portfolio format"""
        
        # Convert stock holdings
        stocks = []
        total_stock_investment = 0
        total_stock_value = 0
        
        for holding in holdings:
            try:
                # Skip if it's actually a mutual fund
                if 'MF' in holding.get('exchange', ''):
                    continue
                
                quantity = holding.get('quantity', 0)
                if quantity <= 0:
                    continue
                
                avg_price = holding.get('average_price', 0)
                current_price = holding.get('last_price', avg_price)
                
                investment_amount = quantity * avg_price
                current_value = quantity * current_price
                gain_loss = current_value - investment_amount
                gain_loss_percentage = (gain_loss / investment_amount * 100) if investment_amount > 0 else 0
                
                stock = {
                    "symbol": holding.get('tradingsymbol', ''),
                    "company_name": holding.get('tradingsymbol', '').replace('-EQ', ''),
                    "quantity": quantity,
                    "avg_cost": avg_price,
                    "current_price": current_price,
                    "investment_amount": investment_amount,
                    "current_value": current_value,
                    "gain_loss": gain_loss,
                    "gain_loss_percentage": gain_loss_percentage,
                    "sector": self._get_sector_from_symbol(holding.get('tradingsymbol', ''))
                }
                
                stocks.append(stock)
                total_stock_investment += investment_amount
                total_stock_value += current_value
                
            except Exception as e:
                logger.warning(f"Error processing stock holding: {str(e)}")
                continue
        
        # Convert mutual fund holdings
        mutual_funds = []
        total_mf_investment = 0
        total_mf_value = 0
        
        for mf_holding in mf_holdings:
            try:
                quantity = mf_holding.get('quantity', 0)
                if quantity <= 0:
                    continue
                
                avg_price = mf_holding.get('average_price', 0)
                current_nav = mf_holding.get('last_price', avg_price)
                
                investment_amount = quantity * avg_price
                current_value = quantity * current_nav
                gain_loss = current_value - investment_amount
                gain_loss_percentage = (gain_loss / investment_amount * 100) if investment_amount > 0 else 0
                
                mf = {
                    "scheme_name": mf_holding.get('tradingsymbol', ''),
                    "folio_number": mf_holding.get('folio', ''),
                    "units": quantity,
                    "nav": current_nav,
                    "investment_amount": investment_amount,
                    "current_value": current_value,
                    "gain_loss": gain_loss,
                    "gain_loss_percentage": gain_loss_percentage,
                    "sip_amount": 0,  # Not available from Kite
                    "fund_type": "Equity",  # Default
                    "fund_category": "Mixed"
                }
                
                mutual_funds.append(mf)
                total_mf_investment += investment_amount
                total_mf_value += current_value
                
            except Exception as e:
                logger.warning(f"Error processing MF holding: {str(e)}")
                continue
        
        # Calculate totals
        total_investment = total_stock_investment + total_mf_investment
        total_current_value = total_stock_value + total_mf_value
        total_gain_loss = total_current_value - total_investment
        gain_loss_percentage = (total_gain_loss / total_investment * 100) if total_investment > 0 else 0
        
        # Asset allocation
        asset_allocation = {}
        
        if total_current_value > 0:
            if total_stock_value > 0:
                asset_allocation["stocks"] = {
                    "value": total_stock_value,
                    "percentage": (total_stock_value / total_current_value * 100)
                }
            
            if total_mf_value > 0:
                asset_allocation["mutual_funds"] = {
                    "value": total_mf_value,
                    "percentage": (total_mf_value / total_current_value * 100)
                }
        
        # Create portfolio summary
        portfolio_summary = {
            "total_investment": total_investment,
            "total_current_value": total_current_value,
            "total_gain_loss": total_gain_loss,
            "gain_loss_percentage": gain_loss_percentage,
            "asset_allocation": asset_allocation,
            "updated_at": datetime.now().isoformat()
        }
        
        return {
            "summary": portfolio_summary,
            "stocks": stocks,
            "mutual_funds": mutual_funds
        }
    
    def create_user_profile(self, kite_profile: Dict[str, Any], session_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile from Kite profile data"""
        
        # Extract user information from Kite profile
        user_name = kite_profile.get('user_name', session_data.get('userShortname', 'Kite User'))
        email = kite_profile.get('email', session_data.get('email', ''))
        
        # Estimate financial profile based on portfolio (rough estimates)
        estimated_income = 1000000  # Default 10L annual income
        
        user_profile = {
            "user_profile": {
                "name": user_name,
                "age": 35,  # Default age
                "profession": "Investor",
                "location": "India",
                "email": email,
                "phone": ""
            },
            "financial_profile": {
                "annual_income_after_tax": estimated_income,
                "monthly_income_after_tax": estimated_income / 12,
                "take_home": estimated_income / 12,
                "monthly_expenses": estimated_income * 0.6 / 12,
                "savings_rate": 0.4
            },
            "investment_profile": {
                "risk_tolerance": "Moderate",
                "investment_experience": "Experienced",  # Assuming Kite users are experienced
                "investment_horizon": 10,
                "preferred_investment_types": ["Stocks", "Mutual Funds"]
            }
        }
        
        return user_profile
    
    def _get_sector_from_symbol(self, symbol: str) -> str:
        """Get sector from stock symbol (simplified mapping)"""
        sector_mapping = {
            'INFY': 'Information Technology',
            'TCS': 'Information Technology',
            'HDFCBANK': 'Banking',
            'ICICIBANK': 'Banking',
            'RELIANCE': 'Oil & Gas',
            'WIPRO': 'Information Technology',
            'ITC': 'FMCG',
            'HINDUNILVR': 'FMCG',
            'BHARTIARTL': 'Telecommunications',
            'SBIN': 'Banking'
        }
        
        # Remove exchange suffix if present
        clean_symbol = symbol.replace('-EQ', '').replace('-BE', '')
        
        return sector_mapping.get(clean_symbol, 'Other')
    
    async def refresh_portfolio_data(self, user_id: str) -> Dict[str, Any]:
        """Refresh portfolio data for a Kite user"""
        try:
            # Fetch fresh data
            holdings = await self.get_portfolio_holdings()
            mf_holdings = await self.get_mutual_fund_holdings()
            
            # Get user profile (cached)
            user_profile = await self.get_user_profile()
            
            # Transform to portfolio format
            portfolio = self.transform_kite_to_portfolio(holdings, mf_holdings, user_profile)
            
            logger.info(f"Refreshed portfolio data for Kite user: {user_id}")
            
            return {
                "success": True,
                "portfolio": portfolio,
                "updated_at": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error refreshing portfolio data: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }