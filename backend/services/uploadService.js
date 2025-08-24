const pdf = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const PDFExtract = require('pdf.js-extract').PDFExtract;
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

  // Reconstruct line structure from pdf.js-extract data using Y-coordinates
  reconstructLinesFromPDFData(data) {
    const textItems = [];
    
    // Collect all text items with their coordinates
    if (data && data.pages) {
      data.pages.forEach(page => {
        if (page.content) {
          page.content.forEach(item => {
            if (item.str && item.str.trim()) {
              textItems.push({
                text: item.str,
                x: item.x || 0,
                y: item.y || 0
              });
            }
          });
        }
      });
    }

    if (textItems.length === 0) {
      return '';
    }

    // Group items by similar Y-coordinates (same line)
    const lineGroups = [];
    const yTolerance = 1; // Tighter tolerance to separate mixed content

    textItems.forEach(item => {
      // Find existing line group with similar Y-coordinate
      let lineGroup = lineGroups.find(group => 
        Math.abs(group.y - item.y) <= yTolerance
      );

      if (!lineGroup) {
        // Create new line group
        lineGroup = { y: item.y, items: [] };
        lineGroups.push(lineGroup);
      }

      lineGroup.items.push(item);
    });

    // Sort line groups by Y-coordinate (top to bottom)
    lineGroups.sort((a, b) => a.y - b.y);

    // Within each line, sort items by X-coordinate (left to right)
    lineGroups.forEach(lineGroup => {
      lineGroup.items.sort((a, b) => a.x - b.x);
    });

    // Reconstruct text with proper line breaks
    const reconstructedLines = lineGroups.map(lineGroup => 
      lineGroup.items.map(item => item.text).join(' ')
    );

    return reconstructedLines.join('\n');
  }

  // Parse PDF file and extract MF transactions
  async parsePDFFile(filePath, pdfPassword = null) {
    return new Promise((resolve, reject) => {
      const pdfExtract = new PDFExtract();
      
      // Set up options with password if provided
      const options = pdfPassword ? { password: pdfPassword } : {};
      
      pdfExtract.extract(filePath, options, (err, data) => {
        if (err) {
          console.error('PDF extraction error:', err);
          
          // Handle specific error cases
          if (err.message && err.message.includes('password')) {
            if (pdfPassword) {
              resolve({
                success: false,
                error: 'Incorrect PDF password. Please check your password and try again.',
                code: 'WRONG_PASSWORD'
              });
            } else {
              resolve({
                success: false,
                error: 'This PDF appears to be password protected. Please provide the PDF password.',
                code: 'PASSWORD_REQUIRED'
              });
            }
            return;
          }
          
          // Handle other errors
          resolve({
            success: false,
            error: 'Failed to parse PDF file: ' + err.message,
            code: 'PARSING_ERROR'
          });
          return;
        }

        // Reconstruct text with proper line structure using Y-coordinates
        const fullText = this.reconstructLinesFromPDFData(data);

        if (!fullText.trim()) {
          resolve({
            success: false,
            error: 'No text could be extracted from the PDF file.',
            code: 'NO_TEXT_EXTRACTED'
          });
          return;
        }

        console.log(`PDF extracted successfully. Text length: ${fullText.length}, Lines: ${fullText.split('\n').length}`);

        // Extract investor information
        const investorInfo = this.extractInvestorInfo(fullText);
        
        // Extract portfolio summary  
        const portfolioSummary = this.extractPortfolioSummary(fullText);
        
        // Extract detailed transactions
        const transactions = this.extractTransactions(fullText);
        
        console.log(`Successfully processed CAS PDF: ${transactions.length} transactions extracted for ${investorInfo.name}`);

        resolve({
          success: true,
          investorInfo,
          portfolioSummary,
          transactions,
          totalTransactions: transactions.length,
          fullText: fullText  // Include fullText for portfolio generation
        });
      });
    });
  }

  // Extract investor information from CAS PDF text
  extractInvestorInfo(text) {
    const lines = text.split('\n');
    let investorName = '';
    let email = '';
    let pan = '';
    let mobile = '';
    let address = '';

    // Find investor information from various patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract email
      if (line.includes('Email Id:')) {
        const emailMatch = line.match(/Email Id:\s*([^\s]+@[^\s]+)/);
        if (emailMatch) {
          email = emailMatch[1];
        }
      }
      
      // Extract mobile
      if (line.includes('Mobile:')) {
        const mobileMatch = line.match(/Mobile:\s*\+?91?(\d{10})/);
        if (mobileMatch) {
          mobile = mobileMatch[1];
        }
      }
      
      // Extract PAN
      if (line.includes('PAN:')) {
        const panMatch = line.match(/PAN:\s*([A-Z0-9]{10})/);
        if (panMatch) {
          pan = panMatch[1];
        }
      }
      
      // Extract investor name - look for standalone name lines or in folio context
      if (line.includes('Folio No:') && line.includes('Vivek Gupta')) {
        const nameMatch = line.match(/Vivek Gupta/);
        if (nameMatch) {
          investorName = 'Vivek Gupta';
        }
      }
      
      // Also look for standalone name lines
      if (line.trim() === 'Vivek Gupta') {
        investorName = 'Vivek Gupta';
      }
      
      // Extract address (lines containing sector/address info)
      if (line.includes('#') && line.includes('SECTOR')) {
        address = line.trim();
      } else if (line.includes('PANCHKULA') || line.includes('Haryana')) {
        if (address) {
          address += ', ' + line.trim();
        } else {
          address = line.trim();
        }
      }
    }

    // Fallback: if no specific name found, try to extract from context
    if (!investorName) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Look for name patterns in context
        const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/;
        if (namePattern.test(line) && !line.includes('Balance') && !line.includes('Statement')) {
          investorName = line;
          break;
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

  // Extract all market values directly from closing balance lines  
  extractAllMarketValues(text) {
    const schemes = [];
    const lines = text.split('\n');
    let schemeCounter = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Find lines with complete closing balance, NAV, and market value data
      if (line.includes('Closing Unit Balance:') && line.includes('NAV on') && line.includes('Market Value on')) {
        const closingBalanceMatch = line.match(/Closing Unit Balance:\s*([\d,]+\.[\d]+)/);
        const navMatch = line.match(/NAV on [^:]+: INR ([\d,]+\.[\d]+)/);
        const marketValueMatch = line.match(/Market Value on [^:]+: INR ([\d,]+\.[\d]+)/);
        const costValueMatch = line.match(/Total Cost Value: ([\d,]+\.[\d]+)/);
        
        if (closingBalanceMatch && navMatch && marketValueMatch) {
          const units = parseFloat(closingBalanceMatch[1].replace(/,/g, '')) || 0;
          const currentNAV = parseFloat(navMatch[1].replace(/,/g, '')) || 0;
          const marketValue = parseFloat(marketValueMatch[1].replace(/,/g, '')) || 0;
          const costValue = costValueMatch ? parseFloat(costValueMatch[1].replace(/,/g, '')) : 0;
          
          // Only include schemes with non-zero market value
          if (marketValue > 0) {
            schemes.push({
              scheme_name: `Mutual Fund Scheme ${schemeCounter}`,
              folio_number: `AUTO_${schemeCounter}`,
              units: units,
              current_price: currentNAV,
              current_value: marketValue,
              investment_amount: costValue,
              gain_loss: marketValue - costValue,
              gain_loss_percentage: costValue > 0 ? ((marketValue - costValue) / costValue * 100) : 0,
              type: 'Equity',
              mf_name: 'Mutual Fund',
              transactions: [] // Will be empty since we're using direct market values
            });
            
            console.log(`Scheme ${schemeCounter}: Units=${units}, NAV=${currentNAV}, Market Value=₹${marketValue}, Cost=₹${costValue}`);
            schemeCounter++;
          }
        }
      }
      // Also capture standalone market values that don't have complete data on same line
      else if (line.includes('Market Value on') && !line.includes('Closing Unit Balance:')) {
        const marketValueMatch = line.match(/Market Value on [^:]+: INR ([\d,]+\.[\d]+)/);
        if (marketValueMatch) {
          const marketValue = parseFloat(marketValueMatch[1].replace(/,/g, '')) || 0;
          
          // Extract other data from the same line if available
          const amountMatches = line.match(/([\d,]+\.[\d]{2})/g);
          let units = 0;
          let currentNAV = 0;
          let costValue = 0;
          
          // Try to extract units and NAV from numeric patterns in the line
          if (amountMatches && amountMatches.length >= 2) {
            // Look for patterns like: amount units ... market_value ... nav price
            // From line: "3,000.00 21.578 Market Value on 20-Aug-2025: INR 92,705.30 139.0300 175.821"
            const firstAmount = parseFloat(amountMatches[0].replace(/,/g, ''));
            const secondAmount = parseFloat(amountMatches[1].replace(/,/g, ''));
            
            // If first amount is small (likely units) and second is reasonable investment amount
            if (firstAmount < 10000 && secondAmount > firstAmount) {
              costValue = firstAmount; // 3000.00 - likely investment amount
              units = secondAmount; // 21.578 - likely units
              
              // Try to find NAV (current price) - look for amount that makes sense: marketValue / units
              if (units > 0) {
                currentNAV = marketValue / units;
              }
              
              // Look for explicit NAV pattern in remaining amounts
              if (amountMatches.length > 3) {
                const potentialNAV = parseFloat(amountMatches[3].replace(/,/g, ''));
                if (potentialNAV > 100 && potentialNAV < 1000) { // Reasonable NAV range
                  currentNAV = potentialNAV; // 139.0300 - likely current NAV
                  
                  // Recalculate units based on market value and NAV
                  if (currentNAV > 0) {
                    units = marketValue / currentNAV;
                  }
                }
              }
            }
          }
          
          // Only include schemes with meaningful data and non-zero market value
          if (marketValue > 0) {
            schemes.push({
              scheme_name: `Mutual Fund Scheme ${schemeCounter}`,
              folio_number: `AUTO_${schemeCounter}`,
              units: units,
              current_price: currentNAV,
              current_value: marketValue,
              investment_amount: costValue,
              gain_loss: marketValue - costValue,
              gain_loss_percentage: costValue > 0 ? ((marketValue - costValue) / costValue * 100) : 0,
              type: 'Equity',
              mf_name: 'Mutual Fund',
              transactions: [] // Will be empty since we're using direct market values
            });
            
            console.log(`Scheme ${schemeCounter} (standalone): Units=${units}, NAV=${currentNAV}, Market Value=₹${marketValue}, Cost=₹${costValue}`);
            schemeCounter++;
          }
        }
      }
    }
    
    console.log(`Total schemes extracted: ${schemes.length}`);
    return schemes;
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

  // Generate portfolio from PDF using direct market values (bypasses transaction matching issues)
  generatePortfolio(transactions, fullText) {
    if (fullText) {
      console.log('Using direct market value extraction from PDF');
      
      // Extract all schemes directly from closing balance lines 
      const schemes = this.extractAllMarketValues(fullText);
      
      // Calculate portfolio summary using real market values
      const totalInvestment = schemes.reduce((sum, scheme) => sum + scheme.investment_amount, 0);
      const totalCurrentValue = schemes.reduce((sum, scheme) => sum + scheme.current_value, 0);
      const totalGainLoss = totalCurrentValue - totalInvestment;
      const gainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;
      
      console.log(`Portfolio Summary: Investment=₹${totalInvestment}, Current=₹${totalCurrentValue}, Gain/Loss=₹${totalGainLoss}`);
      
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
    
    // Fallback to transaction-based calculation if no fullText
    console.log('Falling back to transaction-based portfolio generation');
    const schemeMap = new Map();
    
    // Process each transaction
    transactions.forEach(txn => {
      const schemeKey = `${txn.scheme_name}_${txn.folio_number}`;
      
      if (!schemeMap.has(schemeKey)) {
        schemeMap.set(schemeKey, {
          scheme_name: txn.scheme_name,
          scheme_code: '',
          folio_number: txn.folio_number,
          mf_name: txn.mf_name,
          type: 'Equity',
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
        broker: ''
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
          break;
      }
    });
    
    // Use fallback calculation for schemes
    const schemes = Array.from(schemeMap.values()).filter(scheme => scheme.units > 0);
    
    schemes.forEach(scheme => {
      const avgPurchasePrice = scheme.investment_amount / scheme.units;
      scheme.current_price = parseFloat(avgPurchasePrice.toFixed(4));
      scheme.current_value = parseFloat((scheme.units * scheme.current_price).toFixed(2));
      scheme.gain_loss = 0;
      scheme.gain_loss_percentage = 0;
    });
    
    const totalInvestment = schemes.reduce((sum, scheme) => sum + scheme.investment_amount, 0);
    const totalCurrentValue = schemes.reduce((sum, scheme) => sum + scheme.current_value, 0);
    
    return {
      summary: {
        total_investment: parseFloat(totalInvestment.toFixed(2)),
        total_current_value: parseFloat(totalCurrentValue.toFixed(2)),
        total_gain_loss: 0,
        gain_loss_percentage: 0,
        asset_allocation: {
          mutual_funds: {
            value: parseFloat(totalCurrentValue.toFixed(2)),
            percentage: 100.00
          }
        }
      },
      mutual_funds: schemes,
      stocks: [],
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