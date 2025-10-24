/**
 * Utility functions for building and formatting insight context for AI chat
 */

import { InsightData, InsightContext, PortfolioSummary, UserGoal, MarketContext, InsightContextMessage } from '../types/insight';

/**
 * Build comprehensive insight context for AI chat
 */
export const buildInsightContext = (
  insight: InsightData,
  portfolioSummary: PortfolioSummary,
  options: {
    relevantHoldings?: any[];
    userGoals?: UserGoal[];
    marketContext?: MarketContext;
    userId?: string;
    userName?: string;
  } = {}
): InsightContext => {
  return {
    insight,
    portfolioSummary,
    relevantHoldings: options.relevantHoldings || [],
    userGoals: options.userGoals || [],
    marketContext: options.marketContext,
    userId: options.userId,
    userName: options.userName,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format currency values for display
 */
const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) { // 1 crore+
    return `₹${(amount / 10000000).toFixed(2)} crores`;
  } else if (amount >= 100000) { // 1 lakh+
    return `₹${(amount / 100000).toFixed(2)} lakhs`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

/**
 * Get insight type emoji
 */
const getInsightEmoji = (type: string): string => {
  switch (type) {
    case 'performance': return '📈';
    case 'risk': return '⚠️';
    case 'opportunity': return '💡';
    case 'warning': return '🚨';
    case 'goal': return '🎯';
    case 'market': return '📊';
    default: return '🧠';
  }
};

/**
 * Get impact color indicator
 */
const getImpactIndicator = (impact: string): string => {
  switch (impact) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
};

/**
 * Format insight context as a user-friendly message for AI chat
 */
export const formatInsightContextMessage = (context: InsightContext | undefined): string => {
  // Safety check for undefined context
  if (!context || !context.insight) {
    return 'Please provide information about your financial question or concern.';
  }

  const { insight, portfolioSummary, userGoals } = context;

  const emoji = getInsightEmoji(insight.type);
  const impactIndicator = getImpactIndicator(insight.impact);
  
  // Build portfolio context section
  const portfolioSection = `
**📊 Your Portfolio Context**:
• Total Value: ${formatCurrency(portfolioSummary.total_current_value)}
• Total Investment: ${formatCurrency(portfolioSummary.total_investment)}
• Overall Return: ${formatCurrency(portfolioSummary.total_current_value - portfolioSummary.total_investment)} (${portfolioSummary.total_return_percent ? portfolioSummary.total_return_percent.toFixed(2) : 'N/A'}%)
• Today's Change: ${portfolioSummary.day_change >= 0 ? '+' : ''}${formatCurrency(portfolioSummary.day_change)} (${portfolioSummary.day_change_percent >= 0 ? '+' : ''}${portfolioSummary.day_change_percent?.toFixed(2) || 'N/A'}%)`;

  // Build goals section if available
  const goalsSection = userGoals && userGoals.length > 0 ? `

**🎯 Related Financial Goals**:
${userGoals.slice(0, 3).map(goal => 
  `• ${goal.name}: ${goal.progress_percentage.toFixed(1)}% complete (${formatCurrency(goal.current_amount)}/${formatCurrency(goal.target_amount)})`
).join('\n')}` : '';

  // Build data section if available
  const dataSection = insight.data ? `

**📋 Insight Data**:
${insight.data.current_value ? `• Current Value: ${insight.data.current_value}` : ''}
${insight.data.target_value ? `• Target Value: ${insight.data.target_value}` : ''}
${insight.data.change ? `• Change: ${insight.data.change}` : ''}`.trim() : '';

  // Main context message
  const contextMessage = `${emoji} **Deep Dive Analysis Request**

**Insight Details**:
• **Title**: ${insight.title}
• **Type**: ${insight.type.toUpperCase()} ${emoji}
• **Impact**: ${insight.impact.toUpperCase()} ${impactIndicator}
• **Confidence**: ${insight.confidence}%
• **Description**: ${insight.description}
${insight.recommendation ? `• **Recommendation**: ${insight.recommendation}` : ''}
${dataSection}
${portfolioSection}
${goalsSection}

**❓ My Request**: Can you provide a detailed explanation of this insight? Please help me understand:
1. **Why** this insight is relevant to my portfolio
2. **What specific factors** are driving this analysis  
3. **What actions** I should consider taking
4. **How this impacts** my overall financial strategy and goals
5. **Any risks or considerations** I should be aware of

Please provide a comprehensive analysis with specific recommendations tailored to my portfolio and financial situation.`;

  return contextMessage;
};

/**
 * Create insight context message for WebSocket transmission
 */
export const createInsightContextMessage = (
  context: InsightContext,
  conversationId: string
): InsightContextMessage => {
  return {
    type: 'insight_context',
    context,
    userMessage: formatInsightContextMessage(context)
  };
};