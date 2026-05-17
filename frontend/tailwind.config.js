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
          'primary': '#0f172a',
          'secondary': '#1e293b',
          'tertiary': '#334155',
          'border': '#475569'
        },
        'premium': {
          'bg-primary': '#0f172a',
          'bg-secondary': '#1e293b',
          'bg-tertiary': '#334155',
          'bg-quaternary': '#475569'
        },
        'glass': {
          'primary': '#1e293b',
          'secondary': '#334155',
          'tertiary': '#475569'
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
        'dark-border': '#475569',
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