// frontend/src/services/authService.js
const USERS_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';
const TOKEN_KEY = 'token';

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      // Check if user already exists
      const userExists = existingUsers.find(user => user.email === userData.email);
      if (userExists) {
        throw new Error('User already exists with this email');
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // In real app, this would be hashed
        createdAt: new Date().toISOString()
      };
      
      // Save user
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      
      // Auto login after registration
      const token = `token_${newUser.id}_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }));
      
      return {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        },
        token
      };
    } catch (error) {
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      // Find user
      const user = existingUsers.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Create session
      const token = `token_${user.id}_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      };
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem(CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // Get demo account
  getDemoAccount: () => {
    return {
      email: 'demo@gym.com',
      password: 'demo123',
      name: 'Demo User'
    };
  }
};