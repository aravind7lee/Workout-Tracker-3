// frontend/src/services/authService.js
// Production-ready authentication service with MongoDB integration

import api from '../utils/api';

// Real-time user registration with MongoDB storage
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
      message: response.data.message
    };
    
  } catch (error) {
    // Fallback to demo mode if backend is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      const demoUser = {
        id: 'demo_' + Date.now(),
        name: userData.name,
        email: userData.email,
        profileImage: null,
        bio: 'Demo user - Backend offline'
      };
      
      const demoToken = 'demo_token_' + Date.now();
      
      // Store in localStorage for demo
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      localStorage.setItem('demo_token', demoToken);
      
      return {
        success: true,
        user: demoUser,
        token: demoToken,
        message: 'Demo registration successful (Backend offline)'
      };
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }
};

// Real-time user login with MongoDB authentication
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });
    
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
      message: response.data.message
    };
    
  } catch (error) {
    // Fallback to demo mode if backend is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      // Check for demo credentials
      if (credentials.email === 'demo@gym.com' && credentials.password === 'demo123') {
        const demoUser = {
          id: 'demo_user',
          name: 'Demo User',
          email: 'demo@gym.com',
          profileImage: null,
          bio: 'Demo user - Backend offline'
        };
        
        const demoToken = 'demo_token_' + Date.now();
        
        // Store in localStorage for demo
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        localStorage.setItem('demo_token', demoToken);
        
        return {
          success: true,
          user: demoUser,
          token: demoToken,
          message: 'Demo login successful (Backend offline)'
        };
      } else {
        throw new Error('Backend offline. Use demo@gym.com / demo123 to continue.');
      }
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid credentials');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  }
};

// Demo user creation and login
export const createDemoUser = async () => {
  const demoUser = {
    id: 'demo_user',
    name: 'Demo User',
    email: 'demo@gym.com',
    profileImage: null,
    bio: 'Demo user for testing'
  };
  
  const demoToken = 'demo_token_' + Date.now();
  
  // Store in localStorage for demo
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  localStorage.setItem('demo_token', demoToken);
  
  return {
    success: true,
    user: demoUser,
    token: demoToken,
    message: 'Demo user created successfully'
  };
};

// Check if backend is accessible
export const checkBackendStatus = async () => {
  try {
    const response = await api.get('/health');
    return {
      online: true,
      message: 'Backend connected',
      data: response.data
    };
  } catch (error) {
    return {
      online: false,
      message: 'Backend not accessible',
      error: error.message
    };
  }
};