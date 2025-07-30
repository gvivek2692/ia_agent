/**
 * API Service for communicating with the deployed backend
 */

import { config } from '../config/environment';

interface HealthResponse {
  status: string;
  timestamp: string;
  openai_configured: boolean;
}

interface TestConnectionResult {
  success: boolean;
  data?: HealthResponse;
  error?: string;
}

class ApiService {
  private baseUrl: string;
  private backendUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
    this.backendUrl = config.backendUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Helper method for direct backend requests (not through /api path)
  private async makeDirectRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.backendUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Direct API request failed for ${endpoint}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Health check (at root level, not /api)
  async healthCheck(): Promise<HealthResponse> {
    return this.makeDirectRequest<HealthResponse>('/health');
  }

  // User context
  async getUserContext() {
    return this.makeRequest('/user/context');
  }

  // Portfolio data
  async getPortfolioSummary() {
    return this.makeRequest('/portfolio/summary');
  }

  // Goals data
  async getGoalsOverview() {
    return this.makeRequest('/goals/overview');
  }

  // Transaction data
  async getRecentTransactions() {
    return this.makeRequest('/transactions/recent');
  }

  // Market data
  async getMarketOverview() {
    return this.makeRequest('/market/overview');
  }

  async getPortfolioMarketImpact() {
    return this.makeRequest('/market/portfolio-impact');
  }

  // Test connection to deployed backend
  async testConnection(): Promise<TestConnectionResult> {
    try {
      const health = await this.healthCheck();
      console.log('✅ Backend connection successful:', health);
      return { success: true, data: health };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Backend connection failed:', error);
      return { success: false, error: errorMessage };
    }
  }

  // Conversation History API methods
  async getConversations(limit = 50, offset = 0, userId = 'demo-user') {
    return this.makeRequest(`/conversations?limit=${limit}&offset=${offset}&userId=${userId}`);
  }

  async getConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`);
  }

  async deleteConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  }

  async renameConversation(conversationId: string, title: string) {
    return this.makeRequest(`/conversations/${conversationId}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    });
  }

  async archiveConversation(conversationId: string) {
    return this.makeRequest(`/conversations/${conversationId}/archive`, {
      method: 'PUT'
    });
  }

  async searchConversations(query: string, userId = 'demo-user') {
    return this.makeRequest(`/conversations/search/${encodeURIComponent(query)}?userId=${userId}`);
  }

  async getConversationStats(userId = 'demo-user') {
    return this.makeRequest(`/conversations/stats?userId=${userId}`);
  }

  // Test all API endpoints
  async testAllEndpoints() {
    const results = {
      health: { success: false, error: '' },
      userContext: { success: false, error: '' },
      portfolio: { success: false, error: '' },
      goals: { success: false, error: '' },
      market: { success: false, error: '' }
    };

    try {
      await this.healthCheck();
      results.health.success = true;
    } catch (error) {
      results.health.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      await this.getUserContext();
      results.userContext.success = true;
    } catch (error) {
      results.userContext.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      await this.getPortfolioSummary();
      results.portfolio.success = true;
    } catch (error) {
      results.portfolio.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      await this.getGoalsOverview();
      results.goals.success = true;
    } catch (error) {
      results.goals.error = error instanceof Error ? error.message : 'Unknown error';
    }

    try {
      await this.getMarketOverview();
      results.market.success = true;
    } catch (error) {
      results.market.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return results;
  }
}

export const apiService = new ApiService();
export default apiService;