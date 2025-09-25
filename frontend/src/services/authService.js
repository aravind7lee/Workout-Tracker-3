// Fixed Authentication Service with Offline Support
import api from '../utils/api';
import { demoService } from './demoService';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password
    });
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      message: response.data.message || 'Registration successful'
    };
    
  } catch (error) {
    // If backend is down, create offline account
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
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
      
      localStorage.setItem('offline_users', JSON.stringify({
        [userData.email]: { ...offlineUser, password: userData.password }
      }));
      
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
    const response = await api.post('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
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
    
    // If backend is down, try offline login
    if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
      console.log('🔄 Trying offline login...');
      const offlineResult = tryOfflineLogin(credentials);
      if (offlineResult) return offlineResult;
    }
    
    // For 401/400 errors, show the actual error message
    if (error.response?.status === 401 || error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid credentials');
    }
    
    // Try offline as last resort
    console.log('🔄 Trying offline login as fallback...');
    const offlineResult = tryOfflineLogin(credentials);
    if (offlineResult) return offlineResult;
    
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
    const response = await api.get('/health', { timeout: 10000 });
    console.log('Backend health check:', response.data);
    return {
      online: response.status === 200,
      message: 'Backend connected',
      data: response.data
    };
  } catch (error) {
    console.log('Backend offline:', error.message);
    return {
      online: false,
      message: 'Backend not accessible - using offline mode',
      error: error.message
    };
  }
};