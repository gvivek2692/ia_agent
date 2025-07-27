/**
 * Market Data Service - Simulates real-time market data integration
 * In production, this would integrate with actual market APIs
 */

class MarketDataService {
  constructor() {
    this.marketData = {
      nifty50: {
        current: 24850,
        change: +125.50,
        changePercent: +0.51,
        lastUpdated: new Date().toISOString()
      },
      sensex: {
        current: 81550,
        change: +220.75,
        changePercent: +0.27,
        lastUpdated: new Date().toISOString()
      },
      stocks: {
        'INFY': { price: 1520, change: +15.20, changePercent: +1.01 },
        'HDFCBANK': { price: 1750, change: +22.50, changePercent: +1.30 },
        'RELIANCE': { price: 2920, change: -18.75, changePercent: -0.64 },
        'TCS': { price: 4100, change: +45.80, changePercent: +1.13 },
        'BAJFINANCE': { price: 7650, change: +125.00, changePercent: +1.66 }
      },
      news: [
        {
          headline: "RBI keeps repo rate unchanged at 6.5% in latest monetary policy review",
          summary: "Central bank maintains status quo on interest rates, citing balanced inflation concerns",
          impact: "Positive for debt funds, neutral for equity markets",
          timestamp: new Date().toISOString()
        },
        {
          headline: "IT sector shows strong Q2 results with double-digit growth",
          summary: "Major IT companies report robust earnings driven by AI and digital transformation deals",
          impact: "Positive for IT stocks like INFY, TCS in your portfolio",
          timestamp: new Date().toISOString()
        },
        {
          headline: "Mutual fund inflows hit record high of ₹40,000 crore in July 2024",
          summary: "SIP contributions continue to drive steady inflows into equity mutual funds",
          impact: "Validates your SIP strategy across multiple fund categories",
          timestamp: new Date().toISOString()
        }
      ]
    };
  }

  // Get current market overview
  getMarketOverview() {
    return {
      indices: {
        nifty50: this.marketData.nifty50,
        sensex: this.marketData.sensex
      },
      market_sentiment: this.calculateMarketSentiment(),
      last_updated: new Date().toISOString()
    };
  }

  // Get specific stock data
  getStockData(symbol) {
    return this.marketData.stocks[symbol] || null;
  }

  // Get portfolio-relevant market data
  getPortfolioMarketData(holdings) {
    const portfolioStocks = holdings.filter(h => h.symbol);
    const marketData = {};
    
    portfolioStocks.forEach(stock => {
      const stockData = this.getStockData(stock.symbol);
      if (stockData) {
        marketData[stock.symbol] = {
          ...stockData,
          your_holding: stock.quantity,
          current_value: stock.current_value,
          your_gain_loss: stock.gain_loss
        };
      }
    });

    return marketData;
  }

  // Get relevant market news
  getRelevantNews(userContext) {
    // Filter news based on user's portfolio and interests
    const relevantNews = this.marketData.news.filter(news => {
      if (userContext && userContext.portfolio) {
        // Check if news is relevant to user's holdings
        const hasITStocks = userContext.portfolio.stocks.some(s => 
          s.sector === 'Information Technology'
        );
        
        if (hasITStocks && news.headline.toLowerCase().includes('it')) {
          return true;
        }
        
        if (news.headline.toLowerCase().includes('mutual fund') || 
            news.headline.toLowerCase().includes('sip')) {
          return true;
        }
      }
      
      return news.headline.toLowerCase().includes('rbi') || 
             news.headline.toLowerCase().includes('repo rate');
    });

    return relevantNews;
  }

  // Calculate market sentiment
  calculateMarketSentiment() {
    const niftyChange = this.marketData.nifty50.changePercent;
    const sensexChange = this.marketData.sensex.changePercent;
    const avgChange = (niftyChange + sensexChange) / 2;

    if (avgChange > 1) return 'Bullish';
    if (avgChange > 0.5) return 'Positive';
    if (avgChange > -0.5) return 'Neutral';
    if (avgChange > -1) return 'Cautious';
    return 'Bearish';
  }

  // Generate market insights for AI context
  generateMarketInsights(userContext) {
    const overview = this.getMarketOverview();
    const news = this.getRelevantNews(userContext);
    
    let insights = `\nCURRENT MARKET CONDITIONS:\n`;
    insights += `- Nifty 50: ${overview.indices.nifty50.current} (${overview.indices.nifty50.change >= 0 ? '+' : ''}${overview.indices.nifty50.change}, ${overview.indices.nifty50.changePercent}%)\n`;
    insights += `- Sensex: ${overview.indices.sensex.current} (${overview.indices.sensex.change >= 0 ? '+' : ''}${overview.indices.sensex.change}, ${overview.indices.sensex.changePercent}%)\n`;
    insights += `- Market Sentiment: ${overview.market_sentiment}\n`;

    if (userContext && userContext.portfolio && userContext.portfolio.stocks) {
      const portfolioMarketData = this.getPortfolioMarketData(userContext.portfolio.stocks);
      insights += `\nYOUR PORTFOLIO STOCKS TODAY:\n`;
      Object.entries(portfolioMarketData).forEach(([symbol, data]) => {
        insights += `- ${symbol}: ₹${data.price} (${data.change >= 0 ? '+' : ''}${data.change}, ${data.changePercent}%) - Your holding: ${data.your_holding} shares\n`;
      });
    }

    if (news.length > 0) {
      insights += `\nRELEVANT MARKET NEWS:\n`;
      news.slice(0, 2).forEach(newsItem => {
        insights += `- ${newsItem.headline}\n  Impact: ${newsItem.impact}\n`;
      });
    }

    return insights;
  }

  // Simulate real-time updates (for demo purposes)
  updateMarketData() {
    // Small random fluctuations to simulate real-time updates
    const fluctuation = () => (Math.random() - 0.5) * 10;
    
    this.marketData.nifty50.current += fluctuation();
    this.marketData.sensex.current += fluctuation() * 2;
    
    Object.keys(this.marketData.stocks).forEach(symbol => {
      this.marketData.stocks[symbol].price += fluctuation() * 5;
    });
    
    this.marketData.nifty50.lastUpdated = new Date().toISOString();
    this.marketData.sensex.lastUpdated = new Date().toISOString();
  }
}

// Export singleton instance
const marketDataService = new MarketDataService();

// Simulate real-time updates every 30 seconds
setInterval(() => {
  marketDataService.updateMarketData();
}, 30000);

module.exports = marketDataService;