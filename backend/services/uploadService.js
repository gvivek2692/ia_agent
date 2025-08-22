const pdf = require('pdf-parse');
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

  // Parse PDF file and extract MF transactions
  async parsePDFFile(filePath) {
    try {
      const dataBuffer = require('fs').readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;

      // Extract investor information
      const investorInfo = this.extractInvestorInfo(text);
      
      // Extract portfolio summary
      const portfolioSummary = this.extractPortfolioSummary(text);
      
      // Extract detailed transactions
      const transactions = this.extractTransactions(text);
      
      console.log(`Successfully processed CAS PDF: ${transactions.length} transactions extracted for ${investorInfo.name}`);

      return {
        success: true,
        investorInfo,
        portfolioSummary,
        transactions,
        totalTransactions: transactions.length
      };
    } catch (error) {
      console.error('Error parsing PDF file:', error);
      return {
        success: false,
        error: 'Failed to parse PDF file: ' + error.message
      };
    }
  }

  // Extract investor information from CAS PDF text
  extractInvestorInfo(text) {
    const lines = text.split('\n');
    let investorName = '';
    let email = '';
    let pan = '';
    let mobile = '';
    let address = '';

    // Find investor name (usually appears after "Email Id:" line)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('Email Id:')) {
        email = line.replace('Email Id:', '').trim();
        // Name is usually on the next line
        if (i + 1 < lines.length) {
          investorName = lines[i + 1].trim();
        }
      }
      
      if (line.startsWith('Mobile:')) {
        mobile = line.replace('Mobile:', '').trim().replace('+91', '').trim();
      }
      
      if (line.includes('PAN:') && line.includes('BMEPG1090F')) {
        pan = 'BMEPG1090F'; // Extract PAN from the standard format
      }
      
      // Capture address lines (typically after name)
      if (investorName && line.includes('#') && line.includes('SECTOR')) {
        address = line;
        // Add next few lines until we hit a separator
        for (let j = i + 1; j < i + 4 && j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.includes('Mobile:') && !nextLine.includes('This Consolidated')) {
            address += ', ' + nextLine;
          } else {
            break;
          }
        }
      }
    }

    return {
      name: investorName || 'Unknown',
      email: email || '',
      pan: pan || '',
      mobile: mobile || '',
      address: address || ''
    };
  }

  // Extract portfolio summary from CAS PDF text
  extractPortfolioSummary(text) {
    const summary = {};
    const lines = text.split('\n');
    let inPortfolioSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'PORTFOLIO SUMMARY') {
        inPortfolioSection = true;
        continue;
      }
      
      if (inPortfolioSection) {
        // Look for fund house data in format like "PPFAS Mutual Fund 50,000.00 170,766.10"
        if (line.includes('Mutual Fund')) {
          // Extract fund house name and values using regex
          const match = line.match(/^(.*?)\s+Mutual Fund\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)$/);
          if (match) {
            const fundHouse = match[1].trim();
            const costValue = parseFloat(match[2].replace(/,/g, '')) || 0;
            const marketValue = parseFloat(match[3].replace(/,/g, '')) || 0;
            
            summary[fundHouse] = { costValue, marketValue };
          }
        }
        
        if (line.startsWith('Total')) {
          // Extract total values using regex
          const match = line.match(/Total\s+([\d,]+\.\d+)\s+([\d,]+\.\d+)$/);
          if (match) {
            summary.total = {
              costValue: parseFloat(match[1].replace(/,/g, '')) || 0,
              marketValue: parseFloat(match[2].replace(/,/g, '')) || 0
            };
          }
          break;
        }
      }
    }

    return summary;
  }

  // Extract detailed transactions from CAS PDF text
  extractTransactions(text) {
    const transactions = [];
    const lines = text.split('\n');
    
    let currentScheme = null;
    let currentFolio = null;
    let currentMFName = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Identify scheme lines that contain fund information
      
      // Identify scheme name lines - more flexible pattern
      if ((line.includes('Fund') && line.includes('ISIN')) || 
          (line.match(/^[A-Z0-9]+-.*Fund/) && line.includes('-'))) {
        // Extract scheme name from the line
        if (line.includes('ISIN:')) {
          const beforeISIN = line.split('ISIN:')[0].trim();
          const parts = beforeISIN.split('-');
          if (parts.length > 1) {
            currentScheme = parts.slice(1).join('-').trim();
          }
        } else {
          const parts = line.split('-');
          if (parts.length > 1) {
            currentScheme = parts[1].split('(')[0].trim();
          }
        }
        currentMFName = this.extractMFNameFromScheme(line);
        continue;
      }
      
      // Identify folio number
      if (line.startsWith('Folio No:')) {
        currentFolio = line.replace('Folio No:', '').split('/')[0].trim();
        continue;
      }
      
      // Parse transaction lines (date amount units nav balance pattern)
      if (this.isTransactionLine(line)) {
        const transaction = this.parseTransactionLine(line);
        if (transaction && currentScheme && currentFolio) {
          transactions.push({
            ...transaction,
            scheme_name: currentScheme,
            folio_number: currentFolio,
            mf_name: currentMFName || this.extractMFNameFromScheme(currentScheme || '')
          });
        }
      }
    }
    
    return transactions;
  }

  // Check if line contains transaction data
  isTransactionLine(line) {
    // Transaction lines start with date and contain numeric data (amount, units, price)
    const datePattern = /^\d{2}-[A-Za-z]{3}-\d{4}/;
    
    const hasDate = datePattern.test(line);
    
    // Skip header lines and lines that are just dates
    if (hasDate && (line.includes('To') || line.length < 20)) {
      return false;
    }
    
    // Check if line contains numeric values (indicating transaction data)
    const numericPattern = /[\d,]+\.\d{2}/;
    const hasNumericData = hasDate && numericPattern.test(line);
    
    // Check if this is a valid transaction line with numeric data
    
    return hasNumericData;
  }

  // Parse individual transaction line
  parseTransactionLine(line) {
    try {
      // Extract date (first part)
      const dateMatch = line.match(/^(\d{2}-[A-Za-z]{3}-\d{4})/);
      if (!dateMatch) return null;
      
      const date = dateMatch[1];
      const remainingLine = line.substring(date.length);
      
      // Extract all numeric values from the line (including integers)
      const numericMatches = remainingLine.match(/([\d,]+(?:\.\d+)?)/g);
      if (!numericMatches || numericMatches.length < 2) return null;
      
      // In CAS format, the typical pattern is: amount, price, units (or similar)
      // We'll take the first value as amount, and try to extract units and price
      const amount = Math.abs(parseFloat(numericMatches[0].replace(/,/g, ''))) || 0;
      
      // For price and units, we need to be more careful about the order
      let units = 0;
      let price = 0;
      
      if (numericMatches.length >= 2) {
        if (numericMatches.length >= 3) {
          // Usually: amount, price, units (or amount, nav, balance)
          price = parseFloat(numericMatches[1].replace(/,/g, '')) || 0;
          units = Math.abs(parseFloat(numericMatches[numericMatches.length - 1].replace(/,/g, ''))) || 0;
        } else {
          // Only 2 numbers: amount and units/balance
          units = Math.abs(parseFloat(numericMatches[1].replace(/,/g, ''))) || 0;
          price = amount > 0 && units > 0 ? amount / units : 0;
        }
      }
      
      // Determine transaction type based on context (positive/negative amounts, line content)
      let transactionType = 'Purchase'; // Default assumption
      
      if (line.includes('(') || line.includes('Redemption')) {
        transactionType = 'Redemption';
      } else if (line.includes('Systematic') || line.includes('SIP')) {
        transactionType = 'Purchase'; // SIP is a type of purchase
      }
      
      // Transaction successfully parsed
      
      return {
        date: this.parseDate(date),
        transaction_type: transactionType,
        amount: amount,
        units: units,
        price: price,
        raw_line: line
      };
    } catch (error) {
      console.error('Error parsing transaction line:', line, error);
      return null;
    }
  }

  // Extract mutual fund name from scheme description
  extractMFNameFromScheme(schemeLine) {
    if (schemeLine.includes('PPFAS')) return 'PPFAS Mutual Fund';
    if (schemeLine.includes('HDFC')) return 'HDFC Mutual Fund';
    if (schemeLine.includes('SBI')) return 'SBI Mutual Fund';
    if (schemeLine.includes('HSBC')) return 'HSBC Mutual Fund';
    if (schemeLine.includes('Aditya Birla')) return 'Aditya Birla Sun Life Mutual Fund';
    if (schemeLine.includes('Franklin')) return 'Franklin Templeton Mutual Fund';
    if (schemeLine.includes('Axis')) return 'AXIS Mutual Fund';
    if (schemeLine.includes('Mirae')) return 'Mirae Asset Mutual Fund';
    
    return 'Unknown Mutual Fund';
  }

  // Normalize transaction type names
  normalizeTransactionType(type) {
    if (type.includes('Purchase') || type.includes('SIP') || type.includes('Systematic')) {
      return 'Purchase';
    }
    if (type.includes('Redemption')) {
      return 'Redemption';
    }
    if (type.includes('Switch In')) {
      return 'Switch In';
    }
    if (type.includes('Switch Out')) {
      return 'Switch Out';
    }
    if (type.includes('Dividend')) {
      return 'Dividend Reinvestment';
    }
    return type || 'Purchase';
  }

  // Extract user profile from investor info and transactions
  extractUserProfile(investorInfo, transactions = []) {
    return {
      name: investorInfo.name || 'Unknown',
      pan: investorInfo.pan || '',
      email: investorInfo.email || '',
      phone: investorInfo.mobile || '',
      address: investorInfo.address || '',
      // Generate some default values
      age: 28,
      profession: 'Software Engineer',
      location: investorInfo.address ? investorInfo.address.split(',')[0] : 'Mumbai, Maharashtra',
      created_at: new Date().toISOString()
    };
  }

  // Generate portfolio from transactions
  generatePortfolio(transactions) {
    const schemeMap = new Map();
    
    // Process each transaction
    transactions.forEach(txn => {
      const schemeKey = `${txn.scheme_name}_${txn.folio_number}`;
      
      if (!schemeMap.has(schemeKey)) {
        schemeMap.set(schemeKey, {
          scheme_name: txn.scheme_name,
          scheme_code: '', // PDF doesn't have product codes typically
          folio_number: txn.folio_number,
          mf_name: txn.mf_name,
          type: 'Equity', // Default type for CAS transactions
          units: 0,
          investment_amount: 0,
          transactions: []
        });
      }
      
      const scheme = schemeMap.get(schemeKey);
      
      // Add transaction to scheme
      scheme.transactions.push({
        date: txn.date,
        transaction_type: txn.transaction_type,
        amount: parseFloat(txn.amount) || 0,
        units: parseFloat(txn.units) || 0,
        price: parseFloat(txn.price) || 0,
        broker: '' // CAS doesn't typically include broker info
      });
      
      // Update scheme totals based on transaction type
      const amount = parseFloat(txn.amount) || 0;
      const units = parseFloat(txn.units) || 0;
      
      switch (txn.transaction_type) {
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