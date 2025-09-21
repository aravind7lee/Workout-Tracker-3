/* ===== GYMTRACKER THEME TOGGLE JS ENHANCER ===== */
/* Optional minimal JS for persistence and cross-tab sync */
/* Remove this file if client forbids JavaScript */

(function() {
  'use strict';

  // Apply saved theme immediately to prevent flash
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }

  function initThemeToggle() {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;

    // Set initial state
    updateToggleState(savedTheme);

    // Handle toggle clicks
    toggleButton.addEventListener('click', handleToggleClick);
    toggleButton.addEventListener('keydown', handleToggleKeydown);

    // Listen for changes from other tabs
    window.addEventListener('storage', handleStorageChange);
  }

  function handleToggleClick() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }

  function handleToggleKeydown(event) {
    // Toggle on Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleClick();
    }
  }

  function handleStorageChange(event) {
    // Sync theme changes from other tabs
    if (event.key === 'theme' && event.newValue) {
      document.documentElement.setAttribute('data-theme', event.newValue);
      updateToggleState(event.newValue);
    }
  }

  function setTheme(theme) {
    // Add transition class for smooth animation
    document.documentElement.classList.add('theme-transition');
    
    // Update theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateToggleState(theme);

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 230);
  }

  function updateToggleState(theme) {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;

    const isLight = theme === 'light';
    toggleButton.setAttribute('aria-checked', isLight);
    toggleButton.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
  }
})();