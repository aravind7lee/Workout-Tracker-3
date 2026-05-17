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
        neon: '#FF0000',
        accent: '#FF0000',
        // Deep Slate Dark Mode Palette
        'slate': {
          'primary': '#000000',
          'secondary': '#0D0D0D',
          'tertiary': '#1A1A1A',
          'border': '#333333'
        },
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