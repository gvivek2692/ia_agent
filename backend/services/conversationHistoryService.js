/**
 * Conversation History Service - Persistent conversation storage
 * Similar to ChatGPT/Claude conversation management
 */

const fs = require('fs').promises;
const path = require('path');

class ConversationHistoryService {
  constructor() {
    this.conversationsDir = path.join(__dirname, '../data/conversations');
    this.indexFile = path.join(this.conversationsDir, 'index.json');
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.conversationsDir, { recursive: true });
      
      // Create index file if it doesn't exist
      try {
        await fs.access(this.indexFile);
      } catch {
        await this.saveIndex([]);
      }
    } catch (error) {
      console.error('Failed to initialize conversation history:', error);
    }
  }

  // Generate conversation title from first message
  generateTitle(firstMessage, maxLength = 50) {
    if (!firstMessage || !firstMessage.trim()) {
      return 'New Conversation';
    }
    
    const cleaned = firstMessage.trim().replace(/[^\w\s]/g, '').substring(0, maxLength);
    return cleaned.length > 0 ? cleaned + '...' : 'New Conversation';
  }

  // Save conversation index
  async saveIndex(conversations) {
    try {
      await fs.writeFile(this.indexFile, JSON.stringify(conversations, null, 2));
    } catch (error) {
      console.error('Failed to save conversation index:', error);
    }
  }

  // Load conversation index
  async loadIndex() {
    try {
      const data = await fs.readFile(this.indexFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load conversation index:', error);
      return [];
    }
  }

  // Create new conversation
  async createConversation(conversationId, title = null, userId = 'demo-user') {
    const conversation = {
      id: conversationId,
      title: title || 'New Conversation',
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      tags: [],
      archived: false
    };

    // Add to index
    const index = await this.loadIndex();
    index.unshift(conversation); // Add to beginning for recent-first order
    await this.saveIndex(index);

    // Create conversation file
    const conversationData = {
      ...conversation,
      messages: []
    };
    
    await this.saveConversation(conversationId, conversationData);
    return conversation;
  }

  // Save conversation data
  async saveConversation(conversationId, conversationData) {
    try {
      const filePath = path.join(this.conversationsDir, `${conversationId}.json`);
      await fs.writeFile(filePath, JSON.stringify(conversationData, null, 2));
    } catch (error) {
      console.error(`Failed to save conversation ${conversationId}:`, error);
    }
  }

  // Load conversation data
  async loadConversation(conversationId) {
    try {
      const filePath = path.join(this.conversationsDir, `${conversationId}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load conversation ${conversationId}:`, error);
      return null;
    }
  }

  // Add message to conversation
  async addMessage(conversationId, message, isBot = false) {
    try {
      let conversation = await this.loadConversation(conversationId);
      
      if (!conversation) {
        // Create new conversation if it doesn't exist
        conversation = await this.createConversation(conversationId);
        conversation = await this.loadConversation(conversationId);
      }

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: message,
        isBot,
        timestamp: new Date().toISOString()
      };

      conversation.messages.push(messageObj);
      conversation.updatedAt = new Date().toISOString();
      conversation.messageCount = conversation.messages.length;

      // Update title from first user message if it's still default
      if (conversation.title === 'New Conversation' && !isBot && conversation.messages.length <= 2) {
        conversation.title = this.generateTitle(message);
      }

      // Save conversation
      await this.saveConversation(conversationId, conversation);

      // Update index
      await this.updateConversationInIndex(conversationId, {
        title: conversation.title,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messageCount
      });

      return messageObj;
    } catch (error) {
      console.error(`Failed to add message to conversation ${conversationId}:`, error);
      return null;
    }
  }

  // Update conversation in index
  async updateConversationInIndex(conversationId, updates) {
    try {
      const index = await this.loadIndex();
      const conversationIndex = index.findIndex(c => c.id === conversationId);
      
      if (conversationIndex >= 0) {
        index[conversationIndex] = { ...index[conversationIndex], ...updates };
        
        // Move to top for recent activity
        const conversation = index.splice(conversationIndex, 1)[0];
        index.unshift(conversation);
        
        await this.saveIndex(index);
      }
    } catch (error) {
      console.error(`Failed to update conversation ${conversationId} in index:`, error);
    }
  }

  // Get conversation list
  async getConversations(userId = 'demo-user', limit = 50, offset = 0) {
    try {
      const index = await this.loadIndex();
      const userConversations = index
        .filter(c => c.userId === userId && !c.archived)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(offset, offset + limit);

      return userConversations;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  // Delete conversation
  async deleteConversation(conversationId) {
    try {
      // Remove from index
      const index = await this.loadIndex();
      const filteredIndex = index.filter(c => c.id !== conversationId);
      await this.saveIndex(filteredIndex);

      // Delete conversation file
      const filePath = path.join(this.conversationsDir, `${conversationId}.json`);
      await fs.unlink(filePath);

      return true;
    } catch (error) {
      console.error(`Failed to delete conversation ${conversationId}:`, error);
      return false;
    }
  }

  // Rename conversation
  async renameConversation(conversationId, newTitle) {
    try {
      const conversation = await this.loadConversation(conversationId);
      if (conversation) {
        conversation.title = newTitle;
        conversation.updatedAt = new Date().toISOString();
        await this.saveConversation(conversationId, conversation);
        
        await this.updateConversationInIndex(conversationId, {
          title: newTitle,
          updatedAt: conversation.updatedAt
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to rename conversation ${conversationId}:`, error);
      return false;
    }
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    try {
      await this.updateConversationInIndex(conversationId, { archived: true });
      return true;
    } catch (error) {
      console.error(`Failed to archive conversation ${conversationId}:`, error);
      return false;
    }
  }

  // Search conversations
  async searchConversations(query, userId = 'demo-user') {
    try {
      const index = await this.loadIndex();
      const userConversations = index.filter(c => c.userId === userId && !c.archived);
      
      const searchResults = userConversations.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase())
      );

      return searchResults.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (error) {
      console.error('Failed to search conversations:', error);
      return [];
    }
  }

  // Get conversation statistics
  async getStats(userId = 'demo-user') {
    try {
      const index = await this.loadIndex();
      const userConversations = index.filter(c => c.userId === userId);
      
      return {
        total: userConversations.length,
        active: userConversations.filter(c => !c.archived).length,
        archived: userConversations.filter(c => c.archived).length,
        totalMessages: userConversations.reduce((sum, c) => sum + (c.messageCount || 0), 0)
      };
    } catch (error) {
      console.error('Failed to get conversation stats:', error);
      return { total: 0, active: 0, archived: 0, totalMessages: 0 };
    }
  }
}

// Export singleton instance
const conversationHistoryService = new ConversationHistoryService();
module.exports = conversationHistoryService;