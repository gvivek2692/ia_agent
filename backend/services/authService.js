const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { getUserByEmail } = require('../data/multipleUsers');

class AuthService {
  constructor() {
    this.sessions = new Map();
    this.tokens = new Map();
    this.usersFilePath = path.join(__dirname, '../data/users.json');
  }

  // Load users from the new uploaded users file
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

  // Find user by email/username from both uploaded users and existing demo users
  findUser(identifier) {
    // First check uploaded users
    const uploadedUsers = this.loadUsers();
    const uploadedUser = uploadedUsers.find(user => 
      user.credentials.email === identifier || 
      user.credentials.username === identifier
    );
    
    if (uploadedUser) {
      return uploadedUser;
    }
    
    // Fallback to existing demo users
    return getUserByEmail(identifier);
  }

  async login(email, password) {
    try {
      const user = this.findUser(email);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Check if user has hashed password (new uploaded user) or plain text (demo user)
      let isPasswordValid = false;
      
      if (user.credentials.password.startsWith('$2b$')) {
        // Hashed password (new uploaded user)
        isPasswordValid = await bcrypt.compare(password, user.credentials.password);
      } else {
        // Plain text password (demo user)
        isPasswordValid = user.credentials.password === password;
      }

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Create session
      const sessionId = uuidv4();
      const sessionData = {
        userId: user.id,
        email: user.credentials.email,
        username: user.credentials.username || user.credentials.email,
        name: user.user_profile.name,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      this.sessions.set(sessionId, sessionData);

      // Remove password from response
      const { credentials, ...userWithoutCredentials } = user;
      const { password: pwd, ...credentialsWithoutPassword } = credentials;

      // Flatten user structure for frontend compatibility
      const flattenedUser = {
        id: user.id,
        name: user.user_profile?.name || user.name || 'User',
        email: user.credentials.email,
        profession: user.user_profile?.profession || user.profession || 'Professional',
        location: user.user_profile?.location || user.location || 'Location',
        age: user.user_profile?.age || user.age || 28,
        experience_level: user.investment_profile?.investment_experience || user.experience_level || 'Intermediate',
        risk_tolerance: user.investment_profile?.risk_tolerance || user.risk_tolerance || 'Moderate',
        credentials: credentialsWithoutPassword
      };

      return {
        success: true,
        sessionId: sessionId,
        user: flattenedUser,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed',
        code: 'LOGIN_ERROR'
      };
    }
  }

  async logout(sessionId) {
    try {
      if (this.sessions.has(sessionId)) {
        this.sessions.delete(sessionId);
        return {
          success: true,
          message: 'Logout successful'
        };
      } else {
        return {
          success: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      };
    }
  }

  verifyToken(token) {
    // For now, we're using sessions instead of JWT tokens
    // This method is kept for compatibility
    if (this.tokens.has(token)) {
      return {
        success: true,
        valid: true,
        user: this.tokens.get(token)
      };
    }
    
    return {
      success: false,
      valid: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    };
  }

  getSession(sessionId) {
    try {
      if (this.sessions.has(sessionId)) {
        const sessionData = this.sessions.get(sessionId);
        
        // Update last activity
        sessionData.lastActivity = new Date().toISOString();
        this.sessions.set(sessionId, sessionData);
        
        return {
          success: true,
          valid: true,
          session: sessionData
        };
      } else {
        return {
          success: false,
          valid: false,
          error: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        };
      }
    } catch (error) {
      console.error('Get session error:', error);
      return {
        success: false,
        valid: false,
        error: 'Session validation failed',
        code: 'SESSION_ERROR'
      };
    }
  }

  getUserBySession(sessionId) {
    try {
      const sessionResult = this.getSession(sessionId);
      
      if (!sessionResult.success) {
        return sessionResult;
      }

      const userId = sessionResult.session.userId;
      const user = this.findUser(sessionResult.session.email);
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Remove password from response
      const { credentials, ...userWithoutCredentials } = user;
      const { password, ...credentialsWithoutPassword } = credentials;

      // Flatten user structure for frontend compatibility
      const flattenedUser = {
        id: user.id,
        name: user.user_profile?.name || user.name || 'User',
        email: user.credentials.email,
        profession: user.user_profile?.profession || user.profession || 'Professional',
        location: user.user_profile?.location || user.location || 'Location',
        age: user.user_profile?.age || user.age || 28,
        experience_level: user.investment_profile?.investment_experience || user.experience_level || 'Intermediate',
        risk_tolerance: user.investment_profile?.risk_tolerance || user.risk_tolerance || 'Moderate',
        credentials: credentialsWithoutPassword
      };

      return {
        success: true,
        user: flattenedUser
      };
    } catch (error) {
      console.error('Get user by session error:', error);
      return {
        success: false,
        error: 'Failed to retrieve user',
        code: 'USER_RETRIEVAL_ERROR'
      };
    }
  }

  // Clean up expired sessions (call periodically)
  cleanupSessions() {
    const now = new Date();
    const expiredThreshold = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [sessionId, sessionData] of this.sessions.entries()) {
      const lastActivity = new Date(sessionData.lastActivity);
      if (now - lastActivity > expiredThreshold) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

module.exports = new AuthService();