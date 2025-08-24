const KiteConnect = require('kiteconnect').KiteConnect;

class KiteService {
  constructor() {
    this.apiKey = process.env.KITE_API_KEY;
    this.apiSecret = process.env.KITE_API_SECRET;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Kite API credentials not found in environment variables');
    }
    
    // Initialize Kite Connect instance
    this.kc = new KiteConnect({
      api_key: this.apiKey,
      debug: process.env.NODE_ENV === 'development'
    });
    
    console.log('KiteService initialized with API Key:', this.apiKey);
    console.log('Redirect URL is configured in Kite Connect dashboard (not controlled by backend)');
  }

  // Generate login URL for OAuth flow
  getLoginUrl() {
    try {
      // Use KiteConnect's official method to generate login URL
      // The redirect URL is configured in Kite Connect dashboard, not here
      const loginUrl = this.kc.getLoginURL();
      console.log('Generated Kite login URL:', loginUrl);
      console.log('Redirect URL is configured in Kite Connect dashboard');
      
      return loginUrl;
    } catch (error) {
      console.error('Error generating Kite login URL:', error);
      throw error;
    }
  }

  // Generate session from request token
  async generateSession(requestToken) {
    try {
      console.log('Generating Kite session with request token:', requestToken);
      console.log('Using API Key:', this.apiKey);
      console.log('API Secret configured:', !!this.apiSecret);
      
      const response = await this.kc.generateSession(requestToken, this.apiSecret);
      console.log('Kite session generated successfully:', response);
      
      // Set access token for subsequent API calls
      this.kc.setAccessToken(response.access_token);
      
      return {
        accessToken: response.access_token,
        publicToken: response.public_token,
        userId: response.user_id,
        userShortname: response.user_shortname,
        userName: response.user_name,
        userType: response.user_type,
        email: response.email,
        broker: response.broker,
        exchanges: response.exchanges,
        products: response.products,
        orderTypes: response.order_types,
        loginTime: response.login_time
      };
    } catch (error) {
      console.error('Error generating Kite session:', error);
      
      // Enhanced error logging for debugging
      if (error.response && error.response.data) {
        console.error('Kite API Error Response:', error.response.data);
      }
      
      // Provide more specific error messages
      if (error.message && error.message.includes('user is not enabled')) {
        const enhancedError = new Error(`Kite Connect Error: The user is not enabled for this app. 
        
This usually means:
1. Your Kite Connect app is in development mode and this user is not in the test users list
2. Add the user's Zerodha User ID to the 'Test Users' list in your Kite Connect app settings
3. Or request production approval from Zerodha to allow all users

API Key: ${this.apiKey}
Original Error: ${error.message}`);
        
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  // Set access token for API calls
  setAccessToken(accessToken) {
    this.kc.setAccessToken(accessToken);
  }

  // Fetch user profile
  async getUserProfile() {
    try {
      const profile = await this.kc.getProfile();
      console.log('Fetched Kite user profile:', profile);
      return profile;
    } catch (error) {
      console.error('Error fetching Kite user profile:', error);
      throw error;
    }
  }

  // Fetch portfolio holdings
  async getPortfolioHoldings() {
    try {
      console.log('Fetching Kite portfolio holdings...');
      const holdings = await this.kc.getHoldings();
      console.log('Fetched Kite holdings:', holdings.length, 'positions');
      return holdings;
    } catch (error) {
      console.error('Error fetching Kite portfolio holdings:', error);
      throw error;
    }
  }

  // Fetch mutual fund holdings
  async getMutualFundHoldings() {
    try {
      console.log('Fetching Kite mutual fund holdings...');
      const mfHoldings = await this.kc.getMFHoldings();
      console.log('Fetched Kite MF holdings:', mfHoldings.length, 'funds');
      return mfHoldings;
    } catch (error) {
      console.error('Error fetching Kite mutual fund holdings:', error);
      throw error;
    }
  }

  // Get margins
  async getMargins() {
    try {
      const margins = await this.kc.getMargins();
      console.log('Fetched Kite margins:', margins);
      return margins;
    } catch (error) {
      console.error('Error fetching Kite margins:', error);
      throw error;
    }
  }

  // Transform Kite holdings to our portfolio format
  transformKiteToPortfolio(kiteHoldings, kiteMFHoldings, userProfile) {
    try {
      console.log('Transforming Kite data to portfolio format...');
      
      // Transform stock holdings
      const stocks = kiteHoldings.map(holding => {
        const currentValue = holding.quantity * holding.last_price;
        const investmentAmount = holding.quantity * holding.average_price;
        const gainLoss = currentValue - investmentAmount;
        const gainLossPercentage = investmentAmount > 0 ? (gainLoss / investmentAmount) * 100 : 0;

        return {
          symbol: holding.tradingsymbol,
          company_name: holding.tradingsymbol, // Kite doesn't provide full company name
          quantity: holding.quantity,
          avg_purchase_price: holding.average_price,
          current_price: holding.last_price,
          investment_amount: Math.round(investmentAmount),
          current_value: Math.round(currentValue),
          gain_loss: Math.round(gainLoss),
          gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
          sector: this.getSectorFromSymbol(holding.tradingsymbol),
          exchange: holding.exchange,
          product: holding.product,
          instrument_token: holding.instrument_token,
          isin: holding.isin
        };
      });

      // Transform mutual fund holdings
      const mutualFunds = kiteMFHoldings.map(mf => {
        const currentValue = mf.quantity * mf.last_price;
        const investmentAmount = mf.quantity * mf.average_price;
        const gainLoss = currentValue - investmentAmount;
        const gainLossPercentage = investmentAmount > 0 ? (gainLoss / investmentAmount) * 100 : 0;

        return {
          scheme_name: mf.fund || mf.tradingsymbol, // Use 'fund' field for proper scheme name
          scheme_code: mf.tradingsymbol, // Keep tradingsymbol as scheme code
          units: mf.quantity,
          nav: mf.last_price,
          current_value: Math.round(currentValue),
          investment_amount: Math.round(investmentAmount),
          gain_loss: Math.round(gainLoss),
          gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
          category: this.getMFCategoryFromSymbol(mf.fund || mf.tradingsymbol),
          fund_house: this.getFundHouseFromSymbol(mf.fund || mf.tradingsymbol),
          isin: mf.isin,
          folio_number: mf.folio || `FOLIO${Date.now()}`
        };
      });

      // Calculate portfolio summary
      const stockInvestment = stocks.reduce((sum, stock) => sum + stock.investment_amount, 0);
      const stockCurrentValue = stocks.reduce((sum, stock) => sum + stock.current_value, 0);
      const mfInvestment = mutualFunds.reduce((sum, mf) => sum + mf.investment_amount, 0);
      const mfCurrentValue = mutualFunds.reduce((sum, mf) => sum + mf.current_value, 0);
      
      const totalInvestment = stockInvestment + mfInvestment;
      const totalCurrentValue = stockCurrentValue + mfCurrentValue;
      const totalGainLoss = totalCurrentValue - totalInvestment;
      const gainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

      // Calculate asset allocation
      const stocksPercentage = totalCurrentValue > 0 ? (stockCurrentValue / totalCurrentValue) * 100 : 0;
      const mutualFundsPercentage = totalCurrentValue > 0 ? (mfCurrentValue / totalCurrentValue) * 100 : 0;

      const portfolioSummary = {
        total_investment: totalInvestment,
        total_current_value: totalCurrentValue,
        total_gain_loss: totalGainLoss,
        gain_loss_percentage: Math.round(gainLossPercentage * 100) / 100,
        updated_at: new Date().toISOString(),
        asset_allocation: {
          stocks: {
            value: stockCurrentValue,
            percentage: Math.round(stocksPercentage * 100) / 100
          },
          mutual_funds: {
            value: mfCurrentValue,
            percentage: Math.round(mutualFundsPercentage * 100) / 100
          }
        }
      };

      console.log('Portfolio transformation completed. Summary:', portfolioSummary);

      return {
        stocks,
        mutual_funds: mutualFunds,
        summary: portfolioSummary
      };
    } catch (error) {
      console.error('Error transforming Kite data to portfolio format:', error);
      throw error;
    }
  }

  // Helper function to determine sector from symbol (basic mapping)
  getSectorFromSymbol(symbol) {
    const sectorMapping = {
      'TCS': 'Information Technology',
      'INFY': 'Information Technology',
      'WIPRO': 'Information Technology',
      'HCLTECH': 'Information Technology',
      'TECHM': 'Information Technology',
      'HDFCBANK': 'Banking',
      'ICICIBANK': 'Banking',
      'SBIN': 'Banking',
      'AXISBANK': 'Banking',
      'KOTAKBANK': 'Banking',
      'RELIANCE': 'Oil & Gas',
      'ONGC': 'Oil & Gas',
      'BPCL': 'Oil & Gas',
      'IOC': 'Oil & Gas',
      'HINDUNILVR': 'FMCG',
      'ITC': 'FMCG',
      'NESTLEIND': 'FMCG',
      'BRITANNIA': 'FMCG',
      'BAJFINANCE': 'Financial Services',
      'BAJAJFINSV': 'Financial Services',
      'LT': 'Construction',
      'ULTRACEMCO': 'Cement',
      'ASIANPAINT': 'Paints',
      'MARUTI': 'Automobile',
      'M&M': 'Automobile',
      'TATAMOTORS': 'Automobile'
    };

    // Extract base symbol (remove suffixes like -EQ, -BE etc.)
    const baseSymbol = symbol.split('-')[0];
    return sectorMapping[baseSymbol] || 'Other';
  }

  // Helper function to determine MF category from scheme name
  getMFCategoryFromSymbol(schemeName) {
    if (!schemeName) return 'Other';
    
    const lowerName = schemeName.toLowerCase();
    
    // Order matters - check more specific categories first
    if (lowerName.includes('elss') || lowerName.includes('tax saver')) return 'ELSS';
    if (lowerName.includes('liquid')) return 'Liquid Fund';
    if (lowerName.includes('ultra short') || lowerName.includes('money market')) return 'Ultra Short Duration Fund';
    if (lowerName.includes('short') && lowerName.includes('duration')) return 'Short Duration Fund';
    if (lowerName.includes('medium') && lowerName.includes('duration')) return 'Medium Duration Fund';
    if (lowerName.includes('long') && lowerName.includes('duration')) return 'Long Duration Fund';
    if (lowerName.includes('gilt') || lowerName.includes('government')) return 'Gilt Fund';
    if (lowerName.includes('corporate bond') || lowerName.includes('credit')) return 'Corporate Bond Fund';
    if (lowerName.includes('debt') || lowerName.includes('bond')) return 'Debt Fund';
    if (lowerName.includes('balanced') || lowerName.includes('hybrid')) return 'Hybrid Fund';
    if (lowerName.includes('aggressive hybrid')) return 'Aggressive Hybrid Fund';
    if (lowerName.includes('conservative hybrid')) return 'Conservative Hybrid Fund';
    if (lowerName.includes('large cap') || lowerName.includes('bluechip')) return 'Large Cap Fund';
    if (lowerName.includes('mid cap')) return 'Mid Cap Fund';
    if (lowerName.includes('small cap')) return 'Small Cap Fund';
    if (lowerName.includes('multi cap') || lowerName.includes('multicap')) return 'Multi Cap Fund';
    if (lowerName.includes('flexi cap') || lowerName.includes('flexicap')) return 'Flexi Cap Fund';
    if (lowerName.includes('sectoral') || lowerName.includes('thematic')) return 'Sectoral/Thematic Fund';
    if (lowerName.includes('index') || lowerName.includes('nifty') || lowerName.includes('sensex')) return 'Index Fund';
    if (lowerName.includes('equity')) return 'Equity Fund';
    if (lowerName.includes('international') || lowerName.includes('global')) return 'International Fund';
    
    return 'Other';
  }

  // Helper function to extract fund house from symbol/name
  getFundHouseFromSymbol(symbol) {
    if (!symbol) return 'Unknown Fund House';
    
    const upperSymbol = symbol.toUpperCase();
    const fundHouseMapping = {
      'SBI': 'SBI Mutual Fund',
      'HDFC': 'HDFC Mutual Fund',
      'ICICI': 'ICICI Prudential Mutual Fund',
      'AXIS': 'Axis Mutual Fund',
      'KOTAK': 'Kotak Mutual Fund',
      'NIPPON': 'Nippon India Mutual Fund',
      'ADITYA BIRLA': 'Aditya Birla Sun Life Mutual Fund',
      'BIRLA SUN LIFE': 'Aditya Birla Sun Life Mutual Fund',
      'UTI': 'UTI Mutual Fund',
      'DSP': 'DSP Mutual Fund',
      'FRANKLIN': 'Franklin Templeton Mutual Fund',
      'INVESCO': 'Invesco Mutual Fund',
      'MIRAE': 'Mirae Asset Mutual Fund',
      'TATA': 'Tata Mutual Fund',
      'RELIANCE': 'Reliance Mutual Fund',
      'MAHINDRA': 'Mahindra Mutual Fund',
      'L&T': 'L&T Mutual Fund',
      'MOTILAL': 'Motilal Oswal Mutual Fund',
      'EDELWEISS': 'Edelweiss Mutual Fund',
      'CANARA': 'Canara Robeco Mutual Fund',
      'ROBECO': 'Canara Robeco Mutual Fund',
      'BARODA': 'Baroda BNP Paribas Mutual Fund',
      'BNP PARIBAS': 'Baroda BNP Paribas Mutual Fund'
    };

    for (const [key, value] of Object.entries(fundHouseMapping)) {
      if (upperSymbol.includes(key)) {
        return value;
      }
    }
    return 'Unknown Fund House';
  }

  // Create user profile from Kite data
  createUserProfile(kiteProfile, sessionData) {
    return {
      user_profile: {
        name: kiteProfile.user_name || sessionData.userName,
        email: kiteProfile.email || sessionData.email,
        age: 30, // Default age as Kite doesn't provide this
        profession: 'Investor',
        location: 'India',
        kite_user_id: kiteProfile.user_id || sessionData.userId
      },
      financial_profile: {
        monthly_salary: 100000, // Default values as Kite doesn't provide this
        annual_ctc: 1200000,
        take_home: 85000
      },
      investment_profile: {
        risk_tolerance: 'moderate', // Default, can be updated based on portfolio analysis
        investment_experience: 'intermediate',
        investment_horizon: '5-10 years'
      }
    };
  }
}

module.exports = KiteService;