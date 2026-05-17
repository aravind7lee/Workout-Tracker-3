/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        'heading': ['Bebas Neue', 'cursive'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        // OVERRIDE DEFAULT TAILWIND COLORS TO ENFORCE "DARK RED GYM" AESTHETIC
        blue: { 50: '#fff0f0', 100: '#ffe3e3', 200: '#ffc1c1', 300: '#ff9494', 400: '#ff5c5c', 500: '#ff0000', 600: '#e60000', 700: '#b30000', 800: '#8b0000', 900: '#5e0000', 950: '#330000' },
        cyan: { 50: '#fff0f0', 100: '#ffe3e3', 200: '#ffc1c1', 300: '#ff9494', 400: '#ff5c5c', 500: '#ff0000', 600: '#e60000', 700: '#b30000', 800: '#8b0000', 900: '#5e0000', 950: '#330000' },
        sky: { 50: '#fff0f0', 100: '#ffe3e3', 200: '#ffc1c1', 300: '#ff9494', 400: '#ff5c5c', 500: '#ff0000', 600: '#e60000', 700: '#b30000', 800: '#8b0000', 900: '#5e0000', 950: '#330000' },
        teal: { 50: '#fff0f0', 100: '#ffe3e3', 200: '#ffc1c1', 300: '#ff9494', 400: '#ff5c5c', 500: '#ff0000', 600: '#e60000', 700: '#b30000', 800: '#8b0000', 900: '#5e0000', 950: '#330000' },
        indigo: { 50: '#fff0f0', 100: '#ffe3e3', 200: '#ffc1c1', 300: '#ff9494', 400: '#ff5c5c', 500: '#ff0000', 600: '#e60000', 700: '#b30000', 800: '#8b0000', 900: '#5e0000', 950: '#330000' },
        slate: { 50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 800: '#1a1a1a', 900: '#0d0d0d', 950: '#000000' },
        gray: { 50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 800: '#1a1a1a', 900: '#0d0d0d', 950: '#000000' },
        zinc: { 50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 800: '#1a1a1a', 900: '#0d0d0d', 950: '#000000' },
        neutral: { 50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 800: '#1a1a1a', 900: '#0d0d0d', 950: '#000000' },
        stone: { 50: '#f6f6f6', 100: '#e7e7e7', 200: '#d1d1d1', 300: '#b0b0b0', 400: '#888888', 500: '#6d6d6d', 600: '#5d5d5d', 700: '#4f4f4f', 800: '#1a1a1a', 900: '#0d0d0d', 950: '#000000' },

        neon: '#FF0000',
        accent: '#FF0000',
        // Old Deep Slate Dark Mode Palette removed to prevent duplicate key with the global slate override above
        'premium': {
          'bg-primary': '#000000',
          'bg-secondary': '#0D0D0D',
          'bg-tertiary': '#1A1A1A',
          'bg-quaternary': '#333333'
        },
        'glass': {
          'primary': '#0D0D0D',
          'secondary': '#1A1A1A',
          'tertiary': '#333333'
        },
        'neon': {
          'red': '#FF0000',
          'dark-red': '#8B0000',
          'black': '#000000'
        },
        // Dark mode color palette
        'dark-bg': {
          primary: '#000000',
          secondary: '#0D0D0D',
          tertiary: '#1A1A1A',
          soft: '#0D0D0D'
        },
        'dark-text': {
          primary: '#f8fafc',
          secondary: '#cbd5e1', 
          muted: '#94a3b8'
        },
        'dark-accent': {
          DEFAULT: '#FF0000',
          hover: '#E60000'
        },
        'dark-border': '#333333',
        // Light mode enhanced colors
        'light-bg': {
          primary: '#ffffff',
          secondary: '#f8fafc',
          soft: 'rgba(255, 255, 255, 0.95)'
        },
        'light-text': {
          primary: '#000000',
          secondary: '#333333',
          muted: '#64748b'
        }
      },
      backdropBlur: {
        'xs': '2px',
        'premium': '12px',
        'ultra': '20px',
        'extreme': '25px',
        'maximum': '30px'
      },
      boxShadow: {
        'dark-card': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'light-card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'premium': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'floating': '0 12px 32px rgba(0, 0, 0, 0.6)',
        'slate-soft': '0 4px 12px rgba(0, 0, 0, 0.4)',
        'slate-premium': '0 8px 24px rgba(0, 0, 0, 0.5)',
        'slate-floating': '0 12px 32px rgba(0, 0, 0, 0.6)'
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer-premium': 'shimmer-premium 2s infinite'
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer-premium': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: [],
  safelist: [
    'premium-card',
    'card-premium', 
    'glass-effect',
    'glow-red',
    'text-glow-red',
    'heading-premium',
    'text-premium',
    'text-accent-glow',
    'animate-glow-pulse',
    'animate-float'
  ]
};