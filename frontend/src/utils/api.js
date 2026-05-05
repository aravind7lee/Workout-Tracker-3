// Production-Optimized API Configuration
import axios from 'axios';

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // ALWAYS use deployed backend (local MongoDB connection is blocked)
  return 'https://workout-tracker-backend-wga7.onrender.com/api';
};

// Request queue to prevent rate limiting
const requestQueue = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0) {
    const { resolve, reject, config } = requestQueue.shift();
    
    try {
      const response = await axios(config);
      resolve(response);
    } catch (error) {
      reject(error);
    }
    
    // Small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  isProcessingQueue = false;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  validateStatus: (status) => status < 500,
});

console.log('🔗 API Base URL:', getApiBaseUrl());

// Enhanced request interceptor with token validation
api.interceptors.request.use(
  (config) => {
    // Skip auth for public endpoints
    const publicEndpoints = ['/health', '/auth/login', '/auth/register'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (isPublicEndpoint) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        // Basic token format validation
        const parts = token.split('.');
        if (parts.length === 3) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('Invalid token format, removing from storage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Cancel request if token is invalid
          return Promise.reject(new Error('Invalid authentication token'));
        }
      } catch (e) {
        console.warn('Token validation failed, removing from storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.reject(new Error('Token validation failed'));
      }
    } else if (!isPublicEndpoint) {
      // No token for protected endpoint - cancel request
      return Promise.reject(new Error('No authentication token'));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with better token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle browser extension conflicts
    if (error.message?.includes('contentScript') || error.message?.includes('extension')) {
      return Promise.resolve({ data: null, status: 200 });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      
      // Clear invalid/expired tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch logout event to clean up auth context
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      // Only redirect if not already on auth pages
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        console.log('🔓 Token invalid/expired, redirecting to login');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Mark network errors for offline handling
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      error.offline = true;
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

// Simple connection test
export const testConnection = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default api;