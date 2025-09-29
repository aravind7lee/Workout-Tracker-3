// Enhanced API Configuration with Silent Error Handling
import axios from 'axios';

// Determine the correct API base URL
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // In development, prefer local backend if available
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // In production, use the deployed backend
  return 'https://workout-tracker-backend-wga7.onrender.com/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
  validateStatus: (status) => status < 500,
});

console.log('🔗 API Base URL:', getApiBaseUrl());

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

// Response interceptor with silent error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle browser extension conflicts
    if (error.message?.includes('contentScript') || error.message?.includes('extension')) {
      return Promise.resolve({ data: null, status: 200 });
    }
    
    // Silently handle connection refused errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend offline - using local mode');
      return Promise.reject({ ...error, silent: true });
    }
    
    // Handle timeout errors silently
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout - backend may be slow');
      return Promise.reject({ ...error, silent: true });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
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

// Test backend connectivity with silent fallback
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    if (response.status === 200) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    // Silent failure - no console errors
    return { success: false, error: 'Backend offline' };
  }
  
  return { success: false, error: 'Backend unavailable' };
};

export default api;