/**
 * Web Search Service using Serper API
 * Provides intelligent web search capabilities for the wealth advisor
 */

const axios = require('axios');

class WebSearchService {
  constructor() {
    this.apiKey = process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev/search';
    this.defaultLocation = 'India';
    this.defaultGl = 'in'; // India
    
    // Log configuration status (without exposing the actual key)
    console.log('Web Search Service initialized');
    console.log('Serper API configured:', !!this.apiKey);
  }

  /**
   * Perform web search using Serper API
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} Search results
   */
  async search(query, options = {}) {
    if (!this.apiKey) {
      console.warn('Serper API key not configured');
      return { error: 'Web search not available' };
    }

    try {
      const searchParams = {
        q: query,
        location: options.location || this.defaultLocation,
        gl: options.gl || this.defaultGl,
        num: options.num || 5, // Limit results for faster response
        ...options
      };

      const response = await axios.post(this.baseUrl, searchParams, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      return this.formatSearchResults(response.data);
    } catch (error) {
      console.error('Web search error:', error.message);
      return { error: 'Failed to perform web search' };
    }
  }

  /**
   * Format search results for better readability
   * @param {Object} rawResults - Raw search results from Serper
   * @returns {Object} Formatted results
   */
  formatSearchResults(rawResults) {
    if (!rawResults || rawResults.error) {
      return { error: rawResults?.error || 'No search results available' };
    }

    const results = {
      searchQuery: rawResults.searchParameters?.q || '',
      totalResults: rawResults.searchInformation?.totalResults || 0,
      searchTime: rawResults.searchInformation?.searchTime || 0,
      organic: [],
      answerBox: null,
      knowledgeGraph: null
    };

    // Format organic results
    if (rawResults.organic && Array.isArray(rawResults.organic)) {
      results.organic = rawResults.organic.slice(0, 5).map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        date: result.date
      }));
    }

    // Include answer box if available
    if (rawResults.answerBox) {
      results.answerBox = {
        answer: rawResults.answerBox.answer,
        title: rawResults.answerBox.title,
        link: rawResults.answerBox.link
      };
    }

    // Include knowledge graph if available
    if (rawResults.knowledgeGraph) {
      results.knowledgeGraph = {
        title: rawResults.knowledgeGraph.title,
        type: rawResults.knowledgeGraph.type,
        description: rawResults.knowledgeGraph.description
      };
    }

    return results;
  }

  /**
   * Determine if a query needs web search based on content analysis
   * @param {string} query - User query
   * @param {Object} userContext - User's financial context
   * @returns {boolean} Whether web search is needed
   */
  shouldPerformWebSearch(query, userContext = {}) {
    const lowerQuery = query.toLowerCase();
    
    // Keywords that indicate need for current information
    const webSearchTriggers = [
      // Market data queries
      'current price', 'today price', 'latest price', 'stock price',
      'market today', 'nifty today', 'sensex today', 'market update',
      'current market', 'today market', 'market news',
      
      // Current events and news
      'news', 'latest news', 'recent news', 'today news',
      'what happened', 'recent developments', 'latest update',
      'major news', 'breaking news', 'headlines',
      
      // Holdings and portfolio specific
      'holdings news', 'my holdings', 'portfolio news',
      'stock news', 'investment news',
      
      // Economic indicators
      'interest rate', 'repo rate', 'inflation rate', 'gdp',
      'economic news', 'rbi news', 'budget news',
      
      // Specific company news
      'earnings', 'quarterly results', 'annual report',
      'company news', 'stock split', 'dividend',
      
      // Investment opportunities
      'new ipo', 'upcoming ipo', 'new schemes', 'new funds',
      'investment opportunities', 'market opportunities',
      
      // Regulatory changes
      'new rules', 'sebi news', 'tax changes', 'policy changes'
    ];

    // Check if query contains web search triggers
    const needsWebSearch = webSearchTriggers.some(trigger => 
      lowerQuery.includes(trigger)
    );

    // Additional logic: Check if query mentions specific stocks from user's portfolio
    if (!needsWebSearch && userContext.portfolio?.stocks) {
      const stockSymbols = userContext.portfolio.stocks.map(stock => 
        stock.symbol.toLowerCase()
      );
      
      const mentionsUserStock = stockSymbols.some(symbol => 
        lowerQuery.includes(symbol) || 
        lowerQuery.includes(symbol.replace('ltd', '').trim())
      );
      
      if (mentionsUserStock && (
        lowerQuery.includes('how is') || lowerQuery.includes('performance') ||
        lowerQuery.includes('doing') || lowerQuery.includes('price')
      )) {
        return true;
      }
    }

    return needsWebSearch;
  }

  /**
   * Generate search query based on user's question and context
   * @param {string} userQuery - Original user query
   * @param {Object} userContext - User's financial context
   * @returns {string} Optimized search query
   */
  generateSearchQuery(userQuery, userContext = {}) {
    const lowerQuery = userQuery.toLowerCase();
    
    // Holdings news queries
    if (lowerQuery.includes('holdings news') || 
        lowerQuery.includes('portfolio news') ||
        (lowerQuery.includes('news') && (lowerQuery.includes('holdings') || lowerQuery.includes('my')))) {
      
      if (userContext.portfolio?.stocks && userContext.portfolio.stocks.length > 0) {
        // Get user's stock symbols for targeted search
        const stockSymbols = userContext.portfolio.stocks.slice(0, 3).map(stock => stock.symbol);
        return `${stockSymbols.join(' ')} latest news stock market India today`;
      }
    }
    
    // If query is about specific stocks in user's portfolio
    if (userContext.portfolio?.stocks) {
      const stockSymbols = userContext.portfolio.stocks.map(stock => stock.symbol);
      const mentionedStock = stockSymbols.find(symbol => 
        lowerQuery.includes(symbol.toLowerCase())
      );
      
      if (mentionedStock) {
        if (lowerQuery.includes('price') || lowerQuery.includes('today')) {
          return `${mentionedStock} stock price today NSE BSE`;
        }
        if (lowerQuery.includes('news') || lowerQuery.includes('update')) {
          return `${mentionedStock} stock news latest updates`;
        }
      }
    }

    // Market queries
    if (lowerQuery.includes('nifty') || lowerQuery.includes('sensex')) {
      return `Nifty Sensex today market update India`;
    }

    // Interest rate queries
    if (lowerQuery.includes('interest rate') || lowerQuery.includes('repo rate')) {
      return `RBI repo rate interest rates India latest`;
    }

    // Default: return original query with India context
    return `${userQuery} India finance investment`;
  }

  /**
   * Summarize search results for AI consumption
   * @param {Object} searchResults - Formatted search results
   * @returns {string} Summary text for AI
   */
  summarizeSearchResults(searchResults) {
    if (searchResults.error) {
      return `Web search unavailable: ${searchResults.error}`;
    }

    let summary = `CURRENT WEB SEARCH RESULTS for "${searchResults.searchQuery}":\n\n`;

    // Add answer box if available
    if (searchResults.answerBox) {
      summary += `DIRECT ANSWER: ${searchResults.answerBox.answer}\nSource: ${searchResults.answerBox.title} (${searchResults.answerBox.link})\n\n`;
    }

    // Add knowledge graph if available
    if (searchResults.knowledgeGraph) {
      summary += `KEY INFORMATION: ${searchResults.knowledgeGraph.title} - ${searchResults.knowledgeGraph.description}\n\n`;
    }

    // Add top organic results with detailed information
    if (searchResults.organic && searchResults.organic.length > 0) {
      summary += 'LATEST INFORMATION FROM WEB SOURCES:\n';
      searchResults.organic.slice(0, 4).forEach((result, index) => {
        summary += `${index + 1}. TITLE: ${result.title}\n`;
        summary += `   CONTENT: ${result.snippet}\n`;
        summary += `   SOURCE: ${result.link}\n`;
        if (result.date) summary += `   PUBLISHED: ${result.date}\n`;
        summary += `   ---\n`;
      });
    }

    summary += `\nIMPORTANT INSTRUCTIONS:\n`;
    summary += `- Use this current, real-time information in your response\n`;
    summary += `- Always cite sources using [Source: Title](link) format\n`;
    summary += `- Mention specific data points from the search results\n`;
    summary += `- Include "Sources:" section at the end with numbered references\n`;

    return summary;
  }

  /**
   * Extract source links from search results for citation
   * @param {Object} searchResults - Formatted search results
   * @returns {Array} Array of source objects with title and link
   */
  extractSources(searchResults) {
    if (searchResults.error || !searchResults.organic) {
      return [];
    }

    const sources = [];
    
    // Add answer box source if available
    if (searchResults.answerBox && searchResults.answerBox.link) {
      sources.push({
        title: searchResults.answerBox.title,
        link: searchResults.answerBox.link
      });
    }

    // Add organic result sources
    searchResults.organic.slice(0, 4).forEach(result => {
      sources.push({
        title: result.title,
        link: result.link,
        date: result.date
      });
    });

    return sources;
  }
}

module.exports = new WebSearchService();