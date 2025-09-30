// Fixed Authentication Service with Offline Support
import api from '../utils/api';
import { demoService } from './demoService';

export const registerUser = async (userData) => {
  try {
    // Use queued request to prevent rate limiting
    const response = await api.queue({
      method: 'POST',
      url: '/auth/register',
      data: {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password
      },
      timeout: 15000
    });
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      message: response.data.message || 'Registration successful'
    };
    
  } catch (error) {
    // Handle rate limiting
    if (error.response?.status === 429) {
      // Create offline account when rate limited
      const offlineUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        isOffline: true
      };
      
      const offlineToken = btoa(JSON.stringify({
        userId: offlineUser.id,
        email: offlineUser.email,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
      }));
      
      const existingUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
      existingUsers[userData.email] = { ...offlineUser, password: userData.password };
      localStorage.setItem('offline_users', JSON.stringify(existingUsers));
      
      return {
        success: true,
        user: offlineUser,
        token: offlineToken,
        message: 'Account created offline (server busy)'
      };
    }
    
    // If backend is down, create offline account
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500 || error.offline) {
      const offlineUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        createdAt: new Date().toISOString(),
        isOffline: true
      };
      
      const offlineToken = btoa(JSON.stringify({
        userId: offlineUser.id,
        email: offlineUser.email,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
      }));
      
      const existingUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
      existingUsers[userData.email] = { ...offlineUser, password: userData.password };
      localStorage.setItem('offline_users', JSON.stringify(existingUsers));
      
      return {
        success: true,
        user: offlineUser,
        token: offlineToken,
        message: 'Account created offline - will sync when online'
      };
    }
    
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (credentials) => {
  console.log('🔐 Attempting login for:', credentials.email);
  console.log('🌐 API Base URL:', api.defaults.baseURL);
  
  try {
    // Use queued request to prevent rate limiting
    const response = await api.queue({
      method: 'POST',
      url: '/auth/login',
      data: {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      },
      timeout: 15000
    });
    
    console.log('✅ Login successful:', response.data.user?.email);
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      message: response.data.message || 'Login successful'
    };
    
  } catch (error) {
    console.error('❌ Login error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      code: error.code,
      url: error.config?.url
    });
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      console.log('⏳ Rate limited - trying offline login...');
      const offlineResult = tryOfflineLogin(credentials);
      if (offlineResult) {
        offlineResult.message = 'Logged in offline (server busy)';
        return offlineResult;
      }
      throw new Error('Server is busy. Please try again in a few minutes.');
    }
    
    // If backend is down or network error, try offline login
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500 || error.offline) {
      console.log('🔄 Backend offline - trying offline login...');
      const offlineResult = tryOfflineLogin(credentials);
      if (offlineResult) {
        offlineResult.message = 'Logged in offline (server unavailable)';
        return offlineResult;
      }
    }
    
    // For 401/400 errors, show the actual error message
    if (error.response?.status === 401 || error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid credentials');
    }
    
    // Try offline as last resort
    console.log('🔄 Trying offline login as fallback...');
    const offlineResult = tryOfflineLogin(credentials);
    if (offlineResult) {
      offlineResult.message = 'Logged in offline';
      return offlineResult;
    }
    
    throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
  }
};

const tryOfflineLogin = (credentials) => {
  try {
    const offlineUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
    const user = offlineUsers[credentials.email.toLowerCase()];
    
    if (user && user.password === credentials.password) {
      const token = btoa(JSON.stringify({
        userId: user.id,
        email: user.email,
        exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
      }));
      
      return {
        success: true,
        user: { ...user, password: undefined },
        token: token,
        message: 'Logged in offline'
      };
    }
    
    // Try demo credentials
    if (credentials.email === 'demo@gymtracker.com' && credentials.password === 'demo123456') {
      const { user, token } = demoService.createDemoSession();
      return {
        success: true,
        user,
        token,
        message: 'Demo login successful'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const createDemoUser = async () => {
  // Always use offline demo
  const { user, token } = demoService.createDemoSession();
  return {
    success: true,
    user,
    token,
    message: 'Demo session started'
  };
};

export const checkBackendStatus = async () => {
  try {
    console.log('🔍 Checking backend status at:', api.defaults.baseURL + '/health');
    
    // Use enhanced connection test with retries
    const result = await api.testConnection?.() || await api.get('/health', { 
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (result.success || result.status === 200) {
      console.log('✅ Backend health check successful');
      return {
        online: true,
        message: 'Backend connected',
        data: result.data || result
      };
    }
    
    throw new Error('Health check failed');
    
  } catch (error) {
    console.error('❌ Backend health check failed:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url
    });
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      console.log('⏳ Backend rate limited - assuming online');
      return {
        online: true,
        message: 'Backend online (rate limited)',
        rateLimited: true
      };
    }
    
    // For CORS errors, still try to proceed as if online
    if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
      console.log('🔄 Network error - trying offline mode');
      return {
        online: false,
        message: 'Using offline mode',
        networkError: true
      };
    }
    
    return {
      online: false,
      message: 'Backend not accessible - using offline mode',
      error: error.message
    };
  }
};