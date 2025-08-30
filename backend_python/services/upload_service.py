"""
PDF upload and parsing service with password protection support
"""

import os
import json
import uuid
import bcrypt
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import PyPDF2
import pdfplumber
from pdfplumber.pdf import PDF
import re

from models.user import User, UserCreate, UserProfile, FinancialProfile, InvestmentProfile, Portfolio, PortfolioSummary
from models.portfolio import UploadRequest, UploadResponse
from services.auth_service import AuthService

logger = logging.getLogger(__name__)


class UploadService:
    def __init__(self):
        self.users_file = "data/users.json"
        self.portfolio_transactions_dir = "data/portfolioTransactions"
        self.auth_service = AuthService()
        
        # Ensure directories exist
        os.makedirs(os.path.dirname(self.users_file), exist_ok=True)
        os.makedirs(self.portfolio_transactions_dir, exist_ok=True)
        
        # Create users file if it doesn't exist
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump([], f)
    
    def check_user_exists(self, username: str) -> bool:
        """Check if username already exists"""
        users = self._load_users()
        for user in users:
            if user.get('credentials', {}).get('username') == username:
                return True
        return False
    
    def _load_users(self) -> List[Dict[str, Any]]:
        """Load users from JSON file"""
        try:
            with open(self.users_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []
    
    def _save_users(self, users: List[Dict[str, Any]]):
        """Save users to JSON file"""
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    async def parse_pdf_file(self, file_path: str, password: Optional[str] = None) -> Dict[str, Any]:
        """Parse PDF file with optional password protection"""
        try:
            logger.info(f"Parsing PDF file: {file_path}")
            
            # First, try to open with PyPDF2 to check if password is needed
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Check if PDF is encrypted
                if pdf_reader.is_encrypted:
                    logger.info("PDF is password protected")
                    
                    if not password:
                        return {
                            "success": False,
                            "error": "PDF is password protected. Please provide password.",
                            "code": "PASSWORD_REQUIRED"
                        }
                    
                    # Try to decrypt with provided password
                    try:
                        decrypt_result = pdf_reader.decrypt(password)
                        if not decrypt_result:
                            return {
                                "success": False,
                                "error": "Incorrect password provided",
                                "code": "WRONG_PASSWORD"
                            }
                        logger.info("PDF successfully decrypted")
                    except Exception as e:
                        logger.error(f"Error decrypting PDF: {str(e)}")
                        return {
                            "success": False,
                            "error": "Failed to decrypt PDF with provided password",
                            "code": "WRONG_PASSWORD"
                        }
            
            # Now parse the PDF content using pdfplumber for better text extraction
            extracted_data = self._extract_pdf_content_with_pdfplumber(file_path, password)
            
            if not extracted_data["success"]:
                return extracted_data
            
            # Parse the extracted text for mutual fund data
            parsed_data = self._parse_mutual_fund_data(extracted_data["full_text"])
            
            return {
                "success": True,
                "investor_info": parsed_data["investor_info"],
                "transactions": parsed_data["transactions"],
                "schemes": parsed_data["schemes"],
                "portfolio_value": parsed_data["portfolio_value"],
                "full_text": extracted_data["full_text"],
                "total_transactions": len(parsed_data["transactions"])
            }
            
        except Exception as e:
            logger.error(f"Error parsing PDF: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to parse PDF: {str(e)}",
                "code": "PARSING_ERROR"
            }
    
    def _extract_pdf_content_with_pdfplumber(self, file_path: str, password: Optional[str] = None) -> Dict[str, Any]:
        """Extract PDF content using pdfplumber with password support"""
        try:
            # Open PDF with pdfplumber
            pdf_kwargs = {}
            if password:
                pdf_kwargs['password'] = password
            
            with pdfplumber.open(file_path, **pdf_kwargs) as pdf:
                full_text = ""
                text_items = []
                
                for page_num, page in enumerate(pdf.pages):
                    try:
                        # Extract text with layout preservation
                        page_text = page.extract_text()
                        if page_text:
                            full_text += page_text + "\n\n"
                        
                        # Extract detailed character information for better parsing
                        chars = page.chars
                        for char in chars:
                            text_items.append({
                                "text": char.get("text", ""),
                                "x": char.get("x0", 0),
                                "y": char.get("y0", 0),
                                "page": page_num
                            })
                    
                    except Exception as e:
                        logger.warning(f"Error extracting from page {page_num}: {str(e)}")
                        continue
                
                # Reconstruct lines using coordinate information
                reconstructed_text = self._reconstruct_lines_from_coordinates(text_items)
                
                return {
                    "success": True,
                    "full_text": full_text if full_text.strip() else reconstructed_text,
                    "raw_text": full_text,
                    "reconstructed_text": reconstructed_text
                }
        
        except Exception as e:
            logger.error(f"Error extracting PDF content: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to extract PDF content: {str(e)}",
                "code": "EXTRACTION_ERROR"
            }
    
    def _reconstruct_lines_from_coordinates(self, text_items: List[Dict[str, Any]]) -> str:
        """Reconstruct proper line structure from coordinate data"""
        if not text_items:
            return ""
        
        # Group text items by Y coordinate (same line)
        lines = {}
        for item in text_items:
            y_coord = int(item["y"])
            if y_coord not in lines:
                lines[y_coord] = []
            lines[y_coord].append(item)
        
        # Sort lines by Y coordinate (top to bottom)
        sorted_lines = sorted(lines.keys(), reverse=True)
        
        reconstructed_text = ""
        for y_coord in sorted_lines:
            # Sort items in each line by X coordinate (left to right)
            line_items = sorted(lines[y_coord], key=lambda x: x["x"])
            line_text = "".join([item["text"] for item in line_items]).strip()
            
            if line_text:
                reconstructed_text += line_text + "\n"
        
        return reconstructed_text
    
    def _parse_mutual_fund_data(self, text: str) -> Dict[str, Any]:
        """Parse mutual fund data from CAS statement text"""
        logger.info("Parsing mutual fund data from extracted text")
        
        parsed_data = {
            "investor_info": {},
            "transactions": [],
            "schemes": [],
            "portfolio_value": 0.0
        }
        
        try:
            # Extract investor information
            investor_info = self._extract_investor_info(text)
            parsed_data["investor_info"] = investor_info
            
            # Extract scheme information and portfolio values
            schemes_data = self._extract_schemes_and_values(text)
            parsed_data["schemes"] = schemes_data["schemes"]
            parsed_data["portfolio_value"] = schemes_data["total_value"]
            
            # Extract transaction history
            transactions = self._extract_transactions(text)
            parsed_data["transactions"] = transactions
            
            logger.info(f"Parsed {len(parsed_data['schemes'])} schemes, {len(transactions)} transactions")
            logger.info(f"Total portfolio value: ₹{parsed_data['portfolio_value']:,.2f}")
            
        except Exception as e:
            logger.error(f"Error parsing mutual fund data: {str(e)}")
        
        return parsed_data
    
    def _extract_investor_info(self, text: str) -> Dict[str, Any]:
        """Extract investor information from CAS text"""
        investor_info = {
            "name": "",
            "email": "",
            "mobile": "",
            "pan": "",
            "address": ""
        }
        
        # Extract name (usually appears after "Name" or similar)
        name_patterns = [
            r"Name[\s:]+([A-Za-z\s]+)",
            r"Investor Name[\s:]+([A-Za-z\s]+)",
            r"Mr\.?\s+([A-Za-z\s]+)",
            r"Ms\.?\s+([A-Za-z\s]+)"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                investor_info["name"] = match.group(1).strip()
                break
        
        # Extract email
        email_pattern = r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"
        email_match = re.search(email_pattern, text)
        if email_match:
            investor_info["email"] = email_match.group(1)
        
        # Extract mobile number
        mobile_patterns = [
            r"Mobile[\s:]+(\+?91[\s-]?\d{10})",
            r"(\+?91[\s-]?\d{10})",
            r"(\d{10})"
        ]
        
        for pattern in mobile_patterns:
            match = re.search(pattern, text)
            if match:
                investor_info["mobile"] = match.group(1)
                break
        
        # Extract PAN
        pan_pattern = r"PAN[\s:]+([A-Z]{5}\d{4}[A-Z])"
        pan_match = re.search(pan_pattern, text, re.IGNORECASE)
        if pan_match:
            investor_info["pan"] = pan_match.group(1)
        
        return investor_info
    
    def _extract_schemes_and_values(self, text: str) -> Dict[str, Any]:
        """Extract mutual fund schemes and their current values"""
        schemes = []
        total_value = 0.0
        
        # Pattern to match scheme information with market values
        scheme_patterns = [
            r"([A-Za-z\s&\-()0-9]+?(?:Fund|Growth|Dividend|Plan|Direct))\s+.*?Market Value[\s:]+₹?([\d,]+\.?\d*)",
            r"([A-Za-z\s&\-()0-9]+?Fund[^₹\n]*?).*?₹([\d,]+\.?\d*)",
            r"Scheme Name[\s:]+([A-Za-z\s&\-()0-9]+).*?Market Value[\s:]+₹?([\d,]+\.?\d*)"
        ]
        
        # Also look for direct market value lines
        market_value_lines = re.findall(r"Market Value[\s:]+₹?([\d,]+\.?\d*)", text, re.IGNORECASE)
        
        # Extract scheme names and values
        lines = text.split('\n')
        current_scheme = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Look for scheme names
            if any(keyword in line.lower() for keyword in ['fund', 'growth', 'dividend', 'plan', 'direct']):
                # Clean scheme name
                scheme_name = re.sub(r'[^\w\s&\-()]', '', line).strip()
                if len(scheme_name) > 10:  # Valid scheme name
                    current_scheme = scheme_name
            
            # Look for market values
            if 'market value' in line.lower() and current_scheme:
                value_match = re.search(r'₹?([\d,]+\.?\d*)', line)
                if value_match:
                    try:
                        value = float(value_match.group(1).replace(',', ''))
                        schemes.append({
                            "scheme_name": current_scheme,
                            "market_value": value,
                            "nav": 0.0,  # Will be updated if found
                            "units": 0.0  # Will be updated if found
                        })
                        total_value += value
                        current_scheme = None
                    except ValueError:
                        continue
        
        # If no schemes found using the above method, try to extract market values directly
        if not schemes and market_value_lines:
            for i, value_str in enumerate(market_value_lines):
                try:
                    value = float(value_str.replace(',', ''))
                    schemes.append({
                        "scheme_name": f"Mutual Fund Scheme {i+1}",
                        "market_value": value,
                        "nav": 0.0,
                        "units": 0.0
                    })
                    total_value += value
                except ValueError:
                    continue
        
        logger.info(f"Extracted {len(schemes)} schemes with total value: ₹{total_value:,.2f}")
        
        return {
            "schemes": schemes,
            "total_value": total_value
        }
    
    def _extract_transactions(self, text: str) -> List[Dict[str, Any]]:
        """Extract transaction history from CAS text"""
        transactions = []
        
        # Pattern to match transaction lines
        transaction_patterns = [
            r"(\d{2}[-/]\d{2}[-/]\d{4})\s+([A-Za-z\s]+)\s+₹?([\d,]+\.?\d*)",
            r"(\d{2}-[A-Za-z]{3}-\d{4})\s+([A-Za-z\s]+)\s+₹?([\d,]+\.?\d*)"
        ]
        
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
            
            # Look for transaction patterns
            for pattern in transaction_patterns:
                matches = re.findall(pattern, line)
                for match in matches:
                    try:
                        date_str, description, amount_str = match
                        
                        # Parse date
                        transaction_date = self._parse_date(date_str)
                        
                        # Parse amount
                        amount = float(amount_str.replace(',', ''))
                        
                        # Determine transaction type
                        transaction_type = "credit" if any(word in description.lower() 
                                                        for word in ['purchase', 'sip', 'investment']) else "debit"
                        
                        transactions.append({
                            "id": str(uuid.uuid4()),
                            "date": transaction_date.isoformat(),
                            "description": description.strip(),
                            "amount": amount,
                            "type": transaction_type
                        })
                    
                    except (ValueError, AttributeError) as e:
                        logger.warning(f"Error parsing transaction line '{line}': {str(e)}")
                        continue
        
        # Sort transactions by date (most recent first)
        transactions.sort(key=lambda x: x["date"], reverse=True)
        
        return transactions
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string in various formats"""
        date_formats = [
            "%d/%m/%Y",
            "%d-%m-%Y", 
            "%d-%b-%Y",
            "%d/%m/%y",
            "%d-%m-%y"
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        # Default to current date if parsing fails
        return datetime.now()
    
    def extract_user_profile(self, investor_info: Dict[str, Any], transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract user profile from parsed data"""
        
        # Calculate basic financial metrics from transactions
        total_investments = sum(t["amount"] for t in transactions if t["type"] == "credit")
        
        # Estimate monthly income (very rough estimation)
        estimated_monthly_income = max(total_investments / 12, 50000)  # Minimum 50k assumption
        
        return {
            "user_profile": {
                "name": investor_info.get("name", "User"),
                "age": 35,  # Default age
                "profession": "Professional",
                "location": "Mumbai, India",
                "email": investor_info.get("email", ""),
                "phone": investor_info.get("mobile", "")
            },
            "financial_profile": {
                "annual_income_after_tax": estimated_monthly_income * 12,
                "monthly_income_after_tax": estimated_monthly_income,
                "take_home": estimated_monthly_income,
                "monthly_expenses": estimated_monthly_income * 0.7,
                "savings_rate": 0.3
            },
            "investment_profile": {
                "risk_tolerance": "Moderate",
                "investment_experience": "Developing",
                "investment_horizon": 10,
                "preferred_investment_types": ["Mutual Funds", "SIP"]
            }
        }
    
    def generate_portfolio(self, transactions: List[Dict[str, Any]], full_text: str) -> Dict[str, Any]:
        """Generate portfolio from transactions and extracted scheme data"""
        
        # Parse scheme information again for detailed portfolio
        parsed_data = self._parse_mutual_fund_data(full_text)
        schemes = parsed_data["schemes"]
        
        # Convert schemes to mutual fund holdings
        mutual_funds = []
        total_investment = 0
        total_current_value = 0
        
        for scheme in schemes:
            # Estimate investment amount (80% of current value as approximation)
            estimated_investment = scheme["market_value"] * 0.8
            gain_loss = scheme["market_value"] - estimated_investment
            gain_loss_percentage = (gain_loss / estimated_investment * 100) if estimated_investment > 0 else 0
            
            mutual_fund = {
                "scheme_name": scheme["scheme_name"],
                "folio_number": f"FOL{len(mutual_funds) + 1:03d}",
                "units": scheme.get("units", scheme["market_value"] / 100),  # Estimate units
                "nav": scheme.get("nav", 100),  # Estimate NAV
                "investment_amount": estimated_investment,
                "current_value": scheme["market_value"],
                "gain_loss": gain_loss,
                "gain_loss_percentage": gain_loss_percentage,
                "sip_amount": 5000,  # Default SIP amount
                "fund_type": "Equity",
                "fund_category": "Large Cap"
            }
            
            mutual_funds.append(mutual_fund)
            total_investment += estimated_investment
            total_current_value += scheme["market_value"]
        
        # Calculate overall portfolio metrics
        total_gain_loss = total_current_value - total_investment
        gain_loss_percentage = (total_gain_loss / total_investment * 100) if total_investment > 0 else 0
        
        # Asset allocation
        asset_allocation = {
            "mutual_funds": {
                "value": total_current_value,
                "percentage": 100.0  # All mutual funds for now
            }
        }
        
        portfolio = {
            "summary": {
                "total_investment": total_investment,
                "total_current_value": total_current_value,
                "total_gain_loss": total_gain_loss,
                "gain_loss_percentage": gain_loss_percentage,
                "asset_allocation": asset_allocation,
                "updated_at": datetime.now().isoformat()
            },
            "stocks": [],  # Empty for CAS statement uploads
            "mutual_funds": mutual_funds
        }
        
        return portfolio
    
    async def create_user(self, user_profile: Dict[str, Any], username: str, password: str, portfolio: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user account with portfolio data"""
        
        try:
            # Generate user ID
            user_id = str(uuid.uuid4())
            
            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Create user object
            user_data = {
                "id": user_id,
                "user_profile": user_profile["user_profile"],
                "financial_profile": user_profile["financial_profile"],
                "investment_profile": user_profile["investment_profile"],
                "portfolio": portfolio,
                "financial_goals": [],  # Will be populated later
                "recent_transactions": [],
                "credentials": {
                    "email": user_profile["user_profile"]["email"],
                    "username": username,
                    "password": password_hash,
                    "provider": "upload"
                },
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # Load existing users
            users = self._load_users()
            
            # Add new user
            users.append(user_data)
            
            # Save users
            self._save_users(users)
            
            # Save portfolio transactions
            portfolio_file = os.path.join(self.portfolio_transactions_dir, f"{user_id}.json")
            with open(portfolio_file, 'w') as f:
                json.dump(portfolio, f, indent=2, default=str)
            
            logger.info(f"Created new user account: {user_id}")
            
            return {
                "success": True,
                "userId": user_id,
                "message": "User created successfully"
            }
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to create user: {str(e)}"
            }