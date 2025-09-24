// Enhanced API Configuration with Better Error Handling
import axios from 'axios';

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // In development, prefer local backend if available
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  // In production, use the deployed backend
  return 'https://workout-tracker-backend-wga7.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status < 500,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent browser extension conflicts
    if (error.message?.includes('contentScript') || error.message?.includes('extension')) {
      return Promise.resolve({ data: null, status: 200 });
    }
    
    // Handle network errors
    if (!error.response) {
      error.code = 'ERR_NETWORK';
      error.message = 'Network error - please check your connection';
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - server may be slow';
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      error.message = 'Server error - please try again later';
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Test backend connectivity with fallback
export const testConnection = async () => {
  const urls = [
    'http://localhost:5000/api',
    'https://workout-tracker-backend-wga7.onrender.com/api'
  ];
  
  for (const baseURL of urls) {
    try {
      const testApi = axios.create({ 
        baseURL, 
        timeout: 3000,
        validateStatus: (status) => status < 500
      });
      const response = await testApi.get('/health');
      
      if (response.status === 200) {
        api.defaults.baseURL = baseURL;
        return { success: true, data: response.data, url: baseURL };
      }
    } catch (error) {
      // Silently continue to next URL
      continue;
    }
  }
  
  return { success: false, error: 'No backend servers available' };
};

export default api;