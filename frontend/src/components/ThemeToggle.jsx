// frontend/src/components/ThemeToggle.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleTheme();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      className="theme-toggle theme-toggle-mobile"
      role="switch"
      aria-checked={theme === 'light'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '52px',
        height: '26px',
        background: 'var(--toggle-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '13px',
        cursor: 'pointer',
        transition: 'all 180ms ease-in-out',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Sun Icon */}
      <svg 
        className="theme-toggle-icon sun" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        style={{
          position: 'absolute',
          left: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '14px',
          height: '14px',
          color: 'var(--accent-contrast)',
          opacity: theme === 'light' ? 1 : 0,
          transition: 'opacity 180ms ease-in-out',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
      
      {/* Moon Icon */}
      <svg 
        className="theme-toggle-icon moon" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        style={{
          position: 'absolute',
          right: '5px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '14px',
          height: '14px',
          color: 'var(--accent-contrast)',
          opacity: theme === 'dark' ? 1 : 0,
          transition: 'opacity 180ms ease-in-out',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
      
      {/* Toggle Knob */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: theme === 'light' ? '26px' : '2px',
          width: '20px',
          height: '20px',
          background: 'var(--toggle-knob)',
          borderRadius: '50%',
          transition: 'left 180ms ease-in-out',
          boxShadow: 'var(--shadow-soft)',
          zIndex: 5
        }}
      />
    </motion.button>
  );
}
