/**
 * Types and interfaces for AI Insights and "Know More" functionality
 */

// Re-export existing InsightData interface for consistency
export interface InsightData {
  id: string;
  type: 'performance' | 'risk' | 'opportunity' | 'warning' | 'goal' | 'market';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
  data?: any;
  generated_at: string;
}

// Portfolio summary interface for context
export interface PortfolioSummary {
  total_current_value: number;
  total_investment: number;
  day_change: number;
  day_change_percent: number;
  total_return: number;
  total_return_percent: number;
  asset_allocation?: {
    equity_percent: number;
    debt_percent: number;
    other_percent: number;
  };
}

// User goal interface for context
export interface UserGoal {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  priority: string;
  category: string;
  progress_percentage: number;
}

// Market context interface
export interface MarketContext {
  market_outlook: 'bullish' | 'bearish' | 'neutral';
  relevant_indices?: {
    name: string;
    value: number;
    change: number;
    change_percent: number;
  }[];
  sector_performance?: {
    sector: string;
    performance: number;
  }[];
}

// Main insight context interface for passing to AI chat
export interface InsightContext {
  insight: InsightData;
  portfolioSummary: PortfolioSummary;
  relevantHoldings?: any[];
  userGoals?: UserGoal[];
  marketContext?: MarketContext;
  userId?: string;
  userName?: string;
  timestamp: string;
}

// Chat message interface for insight context
export interface InsightContextMessage {
  type: 'insight_context';
  context: InsightContext;
  userMessage: string;
}