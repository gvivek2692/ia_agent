const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

class UploadService {
  constructor() {
    this.usersFilePath = path.join(__dirname, '../data/users.json');
    this.portfolioTransactionsPath = path.join(__dirname, '../data/portfolioTransactions');
    
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  ensureDirectoriesExist() {
    const directories = [
      path.dirname(this.usersFilePath),
      this.portfolioTransactionsPath
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Parse Excel file and extract MF transactions
  parseExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Filter only valid transactions (those with AMOUNT, UNITS, PRICE)
      const validTransactions = data.filter(row => 
        row.AMOUNT && 
        row.UNITS && 
        row.PRICE && 
        row.TRANSACTION_TYPE && 
        ['Purchase', 'Redemption', 'Switch In', 'Switch Out', 'Dividend Reinvestment'].includes(row.TRANSACTION_TYPE)
      );

      return {
        success: true,
        transactions: validTransactions,
        totalRows: data.length,
        validRows: validTransactions.length
      };
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      return {
        success: false,
        error: 'Failed to parse Excel file: ' + error.message
      };
    }
  }

  // Extract user profile from transactions
  extractUserProfile(transactions) {
    if (transactions.length === 0) {
      throw new Error('No transactions found to extract user profile');
    }

    const firstTransaction = transactions[0];
    
    return {
      name: firstTransaction.INVESTOR_NAME?.trim() || 'Unknown',
      pan: firstTransaction.PAN || '',
      // Generate some default values
      age: 28,
      profession: 'Software Engineer',
      location: 'Mumbai, Maharashtra',
      phone: '',
      email: '',
      created_at: new Date().toISOString()
    };
  }

  // Generate portfolio from transactions
  generatePortfolio(transactions) {
    const schemeMap = new Map();
    
    // Process each transaction
    transactions.forEach(txn => {
      const schemeKey = `${txn.SCHEME_NAME}_${txn.FOLIO_NUMBER}`;
      
      if (!schemeMap.has(schemeKey)) {
        schemeMap.set(schemeKey, {
          scheme_name: txn.SCHEME_NAME,
          scheme_code: txn.PRODUCT_CODE || '',
          folio_number: txn.FOLIO_NUMBER,
          mf_name: txn.MF_NAME,
          type: txn.Type || 'Equity',
          units: 0,
          investment_amount: 0,
          transactions: []
        });
      }
      
      const scheme = schemeMap.get(schemeKey);
      
      // Add transaction to scheme
      scheme.transactions.push({
        date: this.parseDate(txn.TRADE_DATE),
        transaction_type: txn.TRANSACTION_TYPE,
        amount: parseFloat(txn.AMOUNT) || 0,
        units: parseFloat(txn.UNITS) || 0,
        price: parseFloat(txn.PRICE) || 0,
        broker: txn.BROKER || ''
      });
      
      // Update scheme totals based on transaction type
      const amount = parseFloat(txn.AMOUNT) || 0;
      const units = parseFloat(txn.UNITS) || 0;
      
      switch (txn.TRANSACTION_TYPE) {
        case 'Purchase':
        case 'Switch In':
        case 'Dividend Reinvestment':
          scheme.units += units;
          scheme.investment_amount += amount;
          break;
        case 'Redemption':
        case 'Switch Out':
          scheme.units -= units;
          // For redemption, we don't subtract from investment_amount as it represents historical investment
          break;
      }
    });
    
    // Convert map to array and calculate current values
    const schemes = Array.from(schemeMap.values()).filter(scheme => scheme.units > 0);
    
    // Generate realistic current prices (10-20% above average purchase price)
    schemes.forEach(scheme => {
      const avgPurchasePrice = scheme.investment_amount / scheme.units;
      scheme.avg_purchase_price = parseFloat(avgPurchasePrice.toFixed(4));
      
      // Generate current price (simulate 5-25% growth)
      const growthFactor = 1.05 + (Math.random() * 0.20);
      scheme.current_price = parseFloat((avgPurchasePrice * growthFactor).toFixed(4));
      
      scheme.current_value = parseFloat((scheme.units * scheme.current_price).toFixed(2));
      scheme.gain_loss = parseFloat((scheme.current_value - scheme.investment_amount).toFixed(2));
      scheme.gain_loss_percentage = parseFloat(((scheme.gain_loss / scheme.investment_amount) * 100).toFixed(2));
      
      // Add SIP information if there are multiple purchase transactions
      const purchases = scheme.transactions.filter(txn => txn.transaction_type === 'Purchase');
      if (purchases.length > 1) {
        // Calculate average SIP amount
        const totalSipAmount = purchases.reduce((sum, txn) => sum + txn.amount, 0);
        scheme.sip_amount = Math.round(totalSipAmount / purchases.length);
        scheme.sip_frequency = 'Monthly';
      }
    });
    
    // Calculate portfolio summary
    const totalInvestment = schemes.reduce((sum, scheme) => sum + scheme.investment_amount, 0);
    const totalCurrentValue = schemes.reduce((sum, scheme) => sum + scheme.current_value, 0);
    const totalGainLoss = totalCurrentValue - totalInvestment;
    const gainLossPercentage = (totalGainLoss / totalInvestment) * 100;
    
    return {
      summary: {
        total_investment: parseFloat(totalInvestment.toFixed(2)),
        total_current_value: parseFloat(totalCurrentValue.toFixed(2)),
        total_gain_loss: parseFloat(totalGainLoss.toFixed(2)),
        gain_loss_percentage: parseFloat(gainLossPercentage.toFixed(2)),
        asset_allocation: {
          mutual_funds: {
            value: parseFloat(totalCurrentValue.toFixed(2)),
            percentage: 100.00
          }
        }
      },
      mutual_funds: schemes,
      stocks: [], // Empty as this is MF only
      updated_at: new Date().toISOString()
    };
  }

  parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    
    // Handle DD-MMM-YYYY format (21-FEB-2019)
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[0];
      const monthMap = {
        'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
      };
      const month = monthMap[parts[1]] || '01';
      const year = parts[2];
      
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    
    return new Date().toISOString();
  }

  // Create new user account
  async createUser(userProfile, username, password, portfolio) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      
      const newUser = {
        id: userId,
        credentials: {
          email: username,
          username: username,
          password: hashedPassword
        },
        user_profile: userProfile,
        financial_profile: {
          take_home: 85000, // Default value
          total_income: 100000,
          expenses: {
            housing: 25000,
            food: 8000,
            transport: 5000,
            utilities: 3000,
            entertainment: 4000,
            others: 5000
          }
        },
        investment_profile: {
          risk_tolerance: 'Moderate',
          investment_experience: 'Intermediate',
          investment_horizon: '5-10 years'
        },
        portfolio: portfolio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save user to file
      await this.saveUserToFile(newUser);
      
      // Save portfolio transactions
      await this.savePortfolioTransactions(userId, portfolio);
      
      return {
        success: true,
        userId: userId,
        message: 'User created successfully'
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user: ' + error.message
      };
    }
  }

  async saveUserToFile(user) {
    let users = [];
    
    // Load existing users if file exists
    if (fs.existsSync(this.usersFilePath)) {
      try {
        const data = fs.readFileSync(this.usersFilePath, 'utf8');
        users = JSON.parse(data);
      } catch (error) {
        console.error('Error reading users file:', error);
        users = [];
      }
    }
    
    // Add new user
    users.push(user);
    
    // Save updated users array
    fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2));
  }

  async savePortfolioTransactions(userId, portfolio) {
    const userTransactionsPath = path.join(this.portfolioTransactionsPath, `${userId}.json`);
    
    // Extract all transactions from mutual funds
    const allTransactions = [];
    
    if (portfolio.mutual_funds) {
      portfolio.mutual_funds.forEach(scheme => {
        if (scheme.transactions) {
          scheme.transactions.forEach(txn => {
            allTransactions.push({
              ...txn,
              scheme_name: scheme.scheme_name,
              folio_number: scheme.folio_number,
              mf_name: scheme.mf_name,
              id: uuidv4()
            });
          });
        }
      });
    }
    
    fs.writeFileSync(userTransactionsPath, JSON.stringify({
      userId: userId,
      transactions: allTransactions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, null, 2));
  }

  // Load users from file
  loadUsers() {
    if (!fs.existsSync(this.usersFilePath)) {
      return [];
    }
    
    try {
      const data = fs.readFileSync(this.usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Check if username exists
  checkUserExists(username) {
    const users = this.loadUsers();
    return users.some(user => 
      user.credentials.email === username || 
      user.credentials.username === username
    );
  }
}

module.exports = new UploadService();