// Enhanced API Configuration with Better Error Handling
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://workout-tracker-backend-wga7.onrender.com/api',
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
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

// Test backend connectivity
export const testConnection = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default api;