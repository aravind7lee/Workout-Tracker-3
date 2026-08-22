// Frontend API Configuration - LOCAL DEVELOPMENT
export const API_CONFIG = {
  // Local development backend URL
  BASE_URL:
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    (import.meta.env.DEV || window?.location?.hostname === 'localhost' ? "http://localhost:5000" : "https://workout-tracker-backend-wga7.onrender.com"),

  // API Endpoints
  ENDPOINTS: {
    // Root API
    ROOT: "/api",

    // Test endpoint
    TEST: "/api/test",

    // Health check
    HEALTH: "/api/health",

    // Authentication
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
  },

  // Full URLs for direct use (dynamically generated)
  get URLS() {
    return {
      ROOT: `${this.BASE_URL}/api`,
      TEST: `${this.BASE_URL}/api/test`,
      HEALTH: `${this.BASE_URL}/api/health`,
      REGISTER: `${this.BASE_URL}/api/auth/register`,
      LOGIN: `${this.BASE_URL}/api/auth/login`,
    };
  },
};

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
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
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiCall(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  testConnection: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.TEST);
  },

  healthCheck: async () => {
    return apiCall(API_CONFIG.ENDPOINTS.HEALTH);
  },
};

// Legacy export for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;
