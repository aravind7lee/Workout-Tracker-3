// Fixed AuthContext - No More Errors
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken } from '../utils/api';
import { profileStorage } from '../utils/profileStorage';

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
      
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            
            if (parsedUser?.email && profileStorage?.getProfilePhoto) {
              const savedPhoto = profileStorage.getProfilePhoto(parsedUser.email);
              if (savedPhoto && parsedUser.profileImage !== savedPhoto) {
                parsedUser.profileImage = savedPhoto;
              }
              
              if (profileStorage?.setCurrentUser) {
                profileStorage.setCurrentUser(parsedUser.email);
              }
            }
            
            setToken(savedToken);
            setUser(parsedUser);
            setAuthToken(savedToken);
          } catch (parseError) {
            console.error('Error parsing saved user data:', parseError);
            logout();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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
    return !!(token && user && user.id);
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