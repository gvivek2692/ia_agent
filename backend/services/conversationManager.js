/**
 * Conversation Manager - Handles conversation memory and context
 * Implements Phase 3.4 - Conversation Memory Implementation
 */

class ConversationManager {
  constructor() {
    this.conversations = new Map(); // In-memory storage for demo
    this.maxHistoryLength = 20; // Keep last 20 messages
  }

  // Create a new conversation
  createConversation(conversationId) {
    const conversation = {
      id: conversationId,
      messages: [],
      context: {
        topics_discussed: [],
        financial_focus_areas: [],
        recommendations_made: [],
        user_preferences: {},
        last_portfolio_discussion: null,
        last_goals_discussion: null
      },
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    this.conversations.set(conversationId, conversation);
    return conversation;
  }

  // Add message to conversation
  addMessage(conversationId, message, isBot = false) {
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      conversation = this.createConversation(conversationId);
    }

    const messageObj = {
      id: Date.now(),
      content: message,
      isBot,
      timestamp: new Date().toISOString()
    };

    conversation.messages.push(messageObj);
    conversation.last_updated = new Date().toISOString();

    // Keep only recent messages
    if (conversation.messages.length > this.maxHistoryLength) {
      conversation.messages = conversation.messages.slice(-this.maxHistoryLength);
    }

    // Update context based on message content
    this.updateContext(conversation, message, isBot);

    return conversation;
  }

  // Update conversation context based on message content
  updateContext(conversation, message, isBot) {
    const lowerMessage = message.toLowerCase();
    
    // Track topics discussed
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('investment')) {
      if (!conversation.context.topics_discussed.includes('portfolio')) {
        conversation.context.topics_discussed.push('portfolio');
      }
      conversation.context.last_portfolio_discussion = new Date().toISOString();
    }

    if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      if (!conversation.context.topics_discussed.includes('goals')) {
        conversation.context.topics_discussed.push('goals');
      }
      conversation.context.last_goals_discussion = new Date().toISOString();
    }

    if (lowerMessage.includes('market') || lowerMessage.includes('nifty') || lowerMessage.includes('sensex')) {
      if (!conversation.context.topics_discussed.includes('market_analysis')) {
        conversation.context.topics_discussed.push('market_analysis');
      }
    }

    // Track financial focus areas
    const focusAreas = [
      'emergency_fund', 'retirement', 'tax_saving', 'rebalancing', 
      'sip', 'mutual_funds', 'stocks', 'ppf', 'elss'
    ];
    
    focusAreas.forEach(area => {
      if (lowerMessage.includes(area.replace('_', ' ')) || lowerMessage.includes(area)) {
        if (!conversation.context.financial_focus_areas.includes(area)) {
          conversation.context.financial_focus_areas.push(area);
        }
      }
    });

    // Track user preferences (basic sentiment analysis)
    if (lowerMessage.includes('risk') && lowerMessage.includes('low')) {
      conversation.context.user_preferences.risk_preference = 'conservative';
    } else if (lowerMessage.includes('risk') && lowerMessage.includes('high')) {
      conversation.context.user_preferences.risk_preference = 'aggressive';
    }
  }

  // Get conversation history for AI context
  getConversationContext(conversationId) {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      return null;
    }

    return {
      recent_messages: conversation.messages.slice(-6), // Last 6 messages
      topics_discussed: conversation.context.topics_discussed,
      financial_focus_areas: conversation.context.financial_focus_areas,
      user_preferences: conversation.context.user_preferences,
      conversation_summary: this.generateConversationSummary(conversation)
    };
  }

  // Generate a summary of the conversation for context
  generateConversationSummary(conversation) {
    const messageCount = conversation.messages.length;
    const userMessages = conversation.messages.filter(m => !m.isBot).length;
    const botMessages = conversation.messages.filter(m => m.isBot).length;
    
    return {
      message_count: messageCount,
      user_messages: userMessages,
      bot_messages: botMessages,
      duration_minutes: Math.round((new Date() - new Date(conversation.created_at)) / (1000 * 60)),
      main_topics: conversation.context.topics_discussed.slice(0, 3),
      focus_areas: conversation.context.financial_focus_areas.slice(0, 3)
    };
  }

  // Clear conversation
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  // Get all conversations (for admin/debug)
  getAllConversations() {
    return Array.from(this.conversations.values());
  }

  // Build enhanced context for AI prompt
  buildConversationContext(conversationId) {
    const context = this.getConversationContext(conversationId);
    
    if (!context) {
      return '';
    }

    let contextStr = `\nCONVERSATION CONTEXT:`;
    
    if (context.recent_messages.length > 0) {
      contextStr += `\nRECENT CONVERSATION:\n`;
      context.recent_messages.forEach(msg => {
        const speaker = msg.isBot ? 'AI' : 'User';
        contextStr += `${speaker}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
    }

    if (context.topics_discussed.length > 0) {
      contextStr += `\nTOPICS PREVIOUSLY DISCUSSED: ${context.topics_discussed.join(', ')}`;
    }

    if (context.financial_focus_areas.length > 0) {
      contextStr += `\nFINANCIAL AREAS OF INTEREST: ${context.financial_focus_areas.join(', ')}`;
    }

    if (Object.keys(context.user_preferences).length > 0) {
      contextStr += `\nUSER PREFERENCES: ${JSON.stringify(context.user_preferences)}`;
    }

    contextStr += `\nCONVERSATION SUMMARY: ${context.conversation_summary.message_count} messages over ${context.conversation_summary.duration_minutes} minutes`;

    return contextStr;
  }
}

// Export singleton instance
const conversationManager = new ConversationManager();
module.exports = conversationManager;