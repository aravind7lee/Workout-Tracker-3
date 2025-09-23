// Production Authentication Service
import api from '../utils/api';

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
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.response?.status === 404) {
      throw new Error('Backend API not found. Please check deployment.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  }
};

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
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message || 'Invalid credentials');
    } else if (error.response?.status === 404) {
      throw new Error('Backend API not found. Please check deployment.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please check your connection.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  }
};

export const createDemoUser = async () => {
  try {
    await registerUser({
      name: 'Demo User',
      email: 'demo@gymtracker.com',
      password: 'demo123456'
    });
  } catch (error) {
    // Demo user might already exist
  }
  
  return await loginUser({
    email: 'demo@gymtracker.com',
    password: 'demo123456'
  });
};

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