// Fixed Authentication Service with Offline Support
import api from '../utils/api';

import { smartRequest, safeApiCall } from './smartRequestManager';

export const registerUser = async (userData) => {
  // Create offline user as fallback
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
  
  const offlineResult = {
    success: true,
    user: offlineUser,
    token: offlineToken,
    message: 'Account created offline'
  };
  
  try {
    // Use smart request manager
    const result = await safeApiCall(
      () => smartRequest.post('/auth/register', {
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        password: userData.password
      }),
      offlineResult
    );
    
    if (result.success) {
      return {
        success: true,
        user: result.data.user,
        token: result.data.token,
        message: result.data.message || 'Registration successful'
      };
    } else {
      // Save offline user
      const existingUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
      existingUsers[userData.email] = { ...offlineUser, password: userData.password };
      localStorage.setItem('offline_users', JSON.stringify(existingUsers));
      
      offlineResult.message = `Account created offline (${result.error})`;
      return offlineResult;
    }
    
  } catch (error) {
    // Save offline user
    const existingUsers = JSON.parse(localStorage.getItem('offline_users') || '{}');
    existingUsers[userData.email] = { ...offlineUser, password: userData.password };
    localStorage.setItem('offline_users', JSON.stringify(existingUsers));
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    return offlineResult;
  }
};

export const loginUser = async (credentials) => {
  console.log('🔐 Attempting login for:', credentials.email);
  
  // Try offline login first if we know backend is having issues
  const offlineResult = tryOfflineLogin(credentials);
  
  try {
    // Use smart request manager
    const result = await safeApiCall(
      () => smartRequest.post('/auth/login', {
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      }),
      offlineResult
    );
    
    if (result.success) {
      console.log('✅ Login successful:', result.data.user?.email);
      return {
        success: true,
        user: result.data.user,
        token: result.data.token,
        message: result.data.message || 'Login successful'
      };
    } else {
      // Use offline fallback
      if (offlineResult) {
        offlineResult.message = `Logged in offline (${result.error})`;
        return offlineResult;
      }
      throw new Error(result.error || 'Login failed');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.message);
    
    // For 401/400 errors, show the actual error message
    if (error.response?.status === 401 || error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid credentials');
    }
    
    // Use offline fallback
    if (offlineResult) {
      offlineResult.message = 'Logged in offline';
      return offlineResult;
    }
    
    throw new Error('Login failed. Please try again.');
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
    

    
    return null;
  } catch (error) {
    return null;
  }
};



export const checkBackendStatus = async () => {
  console.log('🔍 Checking backend status...');
  
  try {
    // Use direct API call instead of smart request manager for health check
    const response = await api.get('/health', { timeout: 5000 });
    
    console.log('✅ Backend is online:', response.data);
    return {
      online: true,
      message: 'Backend connected',
      data: response.data
    };
    
  } catch (error) {
    console.error('❌ Backend status check error:', error.message);
    return {
      online: false,
      message: 'Backend not accessible - using offline mode',
      error: error.message
    };
  }
};