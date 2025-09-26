// Real-time authentication guard for professional gym tracker
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthGuard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Invalid user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const requireAuth = (redirectTo = '/login') => {
    if (!loading && !isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    return isAuthenticated;
  };

  const blockUnauthenticated = () => {
    return !isAuthenticated;
  };

  return {
    isAuthenticated,
    user,
    loading,
    requireAuth,
    blockUnauthenticated
  };
};