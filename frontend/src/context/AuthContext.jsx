import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken } from '../utils/api';
import { profileStorage } from '../utils/profileStorage';
import { initializeUserData } from '../utils/cleanUserWorkouts';
import { initializeUserPlanData } from '../utils/cleanUserPlans';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      if (profileStorage?.clearCurrentUser) {
        profileStorage.clearCurrentUser();
      }
      
      // Clear user-specific cached data
      localStorage.removeItem('mongodb_workouts_cache');
      
      // Clear plan service cache
      if (window.realTimePlanService) {
        window.realTimePlanService.planCache.clear();
      }
      
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch logout event to clean up components
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      
      console.log('🔓 User logged out and data cleared');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser && savedToken !== 'null' && savedUser !== 'null') {
          try {
            // Validate token format
            const tokenParts = savedToken.split('.');
            if (tokenParts.length !== 3) {
              console.warn('Invalid token format, clearing auth data');
              logout();
              return;
            }
            
            const parsedUser = JSON.parse(savedUser);
            
            // Validate user data
            if (!parsedUser || (!parsedUser.id && !parsedUser._id)) {
              console.warn('Invalid user data, clearing auth data');
              logout();
              return;
            }
            
            setToken(savedToken);
            setUser(parsedUser);
            setAuthToken(savedToken);
            
            // Initialize user data on app startup
            console.log('🔄 Initializing user data on app startup...');
            const initResult = initializeUserData(parsedUser);
            if (initResult.success) {
              console.log('✅ User workout data initialized on startup');
            } else {
              console.warn('⚠️ User workout data initialization failed on startup:', initResult.message);
            }
            
            // Initialize user plan data on app startup
            const planInitResult = initializeUserPlanData(parsedUser);
            if (planInitResult.success) {
              console.log('✅ User plan data initialized on startup');
            } else {
              console.warn('⚠️ User plan data initialization failed on startup:', planInitResult.message);
            }
          } catch (parseError) {
            console.warn('Failed to parse saved user data, logging out');
            logout();
          }
        }
      } catch (error) {
        console.warn('Failed to initialize auth, logging out');
        logout();
      } finally {
        setLoading(false);
      }
    };

    // Listen for logout events from API interceptors
    const handleLogoutEvent = () => {
      console.log('🔓 Received logout event, clearing auth state');
      setUser(null);
      setToken(null);
      setAuthToken(null);
    };
    
    window.addEventListener('userLoggedOut', handleLogoutEvent);

    // Use setTimeout to prevent blocking and add error boundary
    try {
      setTimeout(initializeAuth, 0);
    } catch (error) {
      console.warn('Failed to initialize auth timeout');
      setLoading(false);
    }
    
    return () => {
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, [logout]);

  const login = (userData, authToken) => {
    try {
      if (!userData || !authToken) {
        throw new Error('Invalid login data');
      }

      let userWithPhoto = { ...userData };
      
      if (userData?.email && profileStorage?.getProfilePhoto) {
        const savedPhoto = profileStorage.getProfilePhoto(userData.email);
        if (savedPhoto) {
          userWithPhoto.profileImage = savedPhoto;
        }
        
        if (profileStorage?.setCurrentUser) {
          profileStorage.setCurrentUser(userData.email);
        }
      }
      
      setUser(userWithPhoto);
      setToken(authToken);
      setAuthToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userWithPhoto));
      
      // Clean up fake workouts and initialize user-specific data
      console.log('🧹 Initializing user-specific data after login...');
      const initResult = initializeUserData(userWithPhoto);
      if (initResult.success) {
        console.log('✅ User workout data initialized successfully');
      } else {
        console.warn('⚠️ User workout data initialization failed:', initResult.message);
      }
      
      // Initialize user-specific plans
      const planInitResult = initializeUserPlanData(userWithPhoto);
      if (planInitResult.success) {
        console.log('✅ User plan data initialized successfully');
      } else {
        console.warn('⚠️ User plan data initialization failed:', planInitResult.message);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      if (!updatedUserData) {
        console.error('No user data provided for update');
        return;
      }

      if (updatedUserData?.email && profileStorage) {
        if (updatedUserData.profileImage && profileStorage.saveProfilePhoto) {
          profileStorage.saveProfilePhoto(updatedUserData.email, updatedUserData.profileImage);
        } else if (profileStorage.removeProfilePhoto) {
          profileStorage.removeProfilePhoto(updatedUserData.email);
        }
        
        if (profileStorage.saveProfile) {
          profileStorage.saveProfile(updatedUserData.email, updatedUserData);
        }
      }
      
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const isAuthenticated = () => {
    if (!token || !user) return false;
    
    // Check token format
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
    } catch (e) {
      return false;
    }
    
    // Check user has valid ID
    return !!(user.id || user._id);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};