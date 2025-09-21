// Frontend API Configuration - FIXED BACKEND URLS
export const API_CONFIG = {
  // Your deployed backend URL
  BASE_URL: 'https://grindx-backend.vercel.app',
  
  // API Endpoints
  ENDPOINTS: {
    // Root API
    ROOT: '/api',
    
    // Test endpoint
    TEST: '/api/test',
    
    // Health check
    HEALTH: '/api/health',
    
    // Authentication
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
  },
  
  // Full URLs for direct use
  URLS: {
    ROOT: 'https://grindx-backend.vercel.app/api',
    TEST: 'https://grindx-backend.vercel.app/api/test',
    HEALTH: 'https://grindx-backend.vercel.app/api/health',
    REGISTER: 'https://grindx-backend.vercel.app/api/auth/register',
    LOGIN: 'https://grindx-backend.vercel.app/api/auth/login',
  }
};

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Authentication API calls
export const authAPI = {
  register: async (userData) => {
    return apiCall(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  login: async (credentials) => {
    return apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  testConnection: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.TEST);
  },
  
  healthCheck: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.HEALTH);
  }
};

export default API_CONFIG;