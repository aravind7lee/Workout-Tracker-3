// Production-Optimized API Configuration
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

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle rate limiting with retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait before retrying
      const retryAfter = error.response.headers['retry-after'] || 2;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      return api(originalRequest);
    }
    
    // Silently handle browser extension conflicts
    if (error.message?.includes('contentScript') || error.message?.includes('extension')) {
      return Promise.resolve({ data: null, status: 200 });
    }
    
    // Handle network errors with fallback
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('🔄 Backend offline - switching to offline mode');
      return Promise.reject({ ...error, offline: true });
    }
    
    // Handle timeout errors with retry
    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('⏱️ Request timeout - retrying...');
      return api(originalRequest);
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

// Enhanced connection testing with retry logic
export const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get('/health', { timeout: 10000 });
      if (response.status === 200) {
        return { success: true, data: response.data, attempt: i + 1 };
      }
    } catch (error) {
      if (i === retries - 1) {
        return { success: false, error: 'Backend offline', attempts: retries };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  
  return { success: false, error: 'Backend unavailable' };
};

// Queue requests to prevent rate limiting
export const queuedRequest = (config) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, config: { ...config, baseURL: getApiBaseUrl() } });
    processQueue();
  });
};

// Export enhanced API with queue support
api.queue = queuedRequest;

export default api;