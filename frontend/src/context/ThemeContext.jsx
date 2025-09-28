// Dark Mode Only Theme Context
import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Apply dark theme to document on mount
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.remove('light');
      root.classList.add('dark');
      
      // Ensure body has dark theme
      document.body.classList.add('dark');
      
      // Set data attribute
      root.setAttribute('data-theme', 'dark');
    } catch (error) {
      // Silently handle any DOM errors
    }
  }, []);

  const value = {
    theme: 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme instead of throwing error
    return { theme: 'dark' };
  }
  return context;
};

export default ThemeContext;