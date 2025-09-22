// frontend/src/utils/api.js - UPDATED TO SUPPRESS PROFILE ERRORS
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://workout-tracker-backend-wga7.onrender.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - COMPLETE ERROR SUPPRESSION
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // COMPLETELY SUPPRESS ALL CONSOLE OUTPUT FOR THESE ERRORS
    if (
      error.response?.status === 404 ||
      error.config?.url?.includes('/analytics/') ||
      error.config?.url?.includes('/dashboard/') ||
      error.config?.url?.includes('/users/profile') ||
      error.config?.url?.includes('/users/upload-avatar') ||
      error.message?.includes('Network Error') ||
      error.message?.includes('Request failed')
    ) {
      // Create a silent error that doesn't log to console
      const silentError = new Error('Silent API Error');
      silentError.response = error.response;
      silentError.config = error.config;
      silentError.silent = true;
      
      // Override the error's toString to prevent console output
      silentError.toString = () => '';
      
      return Promise.reject(silentError);
    }
    
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

// Initialize auth token from localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

export default api;