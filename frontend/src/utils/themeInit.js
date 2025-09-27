// Theme initialization - Dark mode only
// This file initializes the theme before React components load

(function() {
  'use strict';
  
  try {
    // Apply dark theme immediately to prevent flash
    const root = document.documentElement;
    
    // Remove any existing theme classes
    root.classList.remove('light');
    root.classList.add('dark');
    
    // Set data attributes for theme
    root.setAttribute('data-theme', 'dark');
    
    // Apply to body as well
    if (document.body) {
      document.body.className = 'dark-theme';
    } else {
      // If body doesn't exist yet, wait for it
      document.addEventListener('DOMContentLoaded', () => {
        document.body.className = 'dark-theme';
      });
    }
    
    // Remove any saved theme preference to enforce dark mode
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('theme');
      localStorage.setItem('theme', 'dark');
    }
    
  } catch (error) {
    // Silently handle any initialization errors
    console.warn('Theme initialization warning:', error.message);
  }
})();