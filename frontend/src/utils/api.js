// frontend/src/utils/api.js - SILENT API WITH ZERO CONSOLE ERRORS
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'https://workout-tracker-backend-wga7.onrender.com/api',
  timeout: 5000,
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

// Response interceptor - COMPLETE SILENCE
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Create completely silent error that won't show in console
    const silentError = new Error('API_UNAVAILABLE');
    silentError.silent = true;
    silentError.originalError = error;
    
    // Override all error properties to prevent console output
    Object.defineProperty(silentError, 'stack', {
      value: '',
      writable: false,
      enumerable: false
    });
    
    Object.defineProperty(silentError, 'message', {
      value: '',
      writable: false,
      enumerable: false
    });
    
    // Override toString to return empty string
    silentError.toString = () => '';
    silentError.valueOf = () => '';
    
    return Promise.reject(silentError);
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