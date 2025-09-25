/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: '#00e6a1',
        accent: '#7c5cff',
        // Dark mode color palette
        'dark-bg': {
          primary: '#0f172a',
          secondary: '#1e293b',
          tertiary: '#334155',
          soft: 'rgba(30, 41, 59, 0.8)'
        },
        'dark-text': {
          primary: '#f8fafc',
          secondary: '#e2e8f0', 
          muted: '#94a3b8'
        },
        'dark-accent': {
          DEFAULT: '#00d4ff',
          glow: 'rgba(0, 212, 255, 0.3)',
          hover: '#00b8e6'
        },
        'dark-border': 'rgba(71, 85, 105, 0.4)',
        // Light mode enhanced colors
        'light-bg': {
          primary: '#ffffff',
          secondary: '#f8fafc',
          soft: 'rgba(255, 255, 255, 0.95)'
        },
        'light-text': {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#64748b'
        }
      },
      backdropBlur: {
        'xs': '2px',
        'premium': '12px',
        'ultra': '20px'
      },
      boxShadow: {
        'dark-glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'dark-glow-lg': '0 0 30px rgba(0, 212, 255, 0.5)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'light-card': '0 4px 20px rgba(0, 0, 0, 0.08)'
      }
    }
  },
  plugins: []
};