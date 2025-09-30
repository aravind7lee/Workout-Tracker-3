/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Bebas Neue', 'cursive'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        neon: '#00e6a1',
        accent: '#7c5cff',
        // Premium Dark Mode Palette
        'premium': {
          'bg-primary': '#0a0e1a',
          'bg-secondary': '#0f172a',
          'bg-tertiary': '#1e293b',
          'bg-quaternary': '#334155'
        },
        'glass': {
          'primary': 'rgba(15, 23, 42, 0.8)',
          'secondary': 'rgba(30, 41, 59, 0.7)',
          'tertiary': 'rgba(51, 65, 85, 0.6)'
        },
        'neon': {
          'cyan': '#00d4ff',
          'blue': '#0ea5e9',
          'purple': '#8b5cf6',
          'green': '#00ff88',
          'pink': '#ff0080',
          'orange': '#ff6b35'
        },
        'glow': {
          'cyan': 'rgba(0, 212, 255, 0.4)',
          'cyan-strong': 'rgba(0, 212, 255, 0.6)',
          'cyan-subtle': 'rgba(0, 212, 255, 0.2)',
          'purple': 'rgba(139, 92, 246, 0.4)',
          'green': 'rgba(0, 255, 136, 0.4)'
        },
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
        'ultra': '20px',
        'extreme': '25px',
        'maximum': '30px'
      },
      boxShadow: {
        'dark-glow': '0 0 20px rgba(0, 212, 255, 0.3)',
        'dark-glow-lg': '0 0 30px rgba(0, 212, 255, 0.5)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'light-card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glow': '0 0 30px rgba(0, 212, 255, 0.4)',
        'glow-strong': '0 0 50px rgba(0, 212, 255, 0.6)',
        'floating': '0 25px 80px rgba(0, 0, 0, 0.9)',
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.4)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.4)'
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer-premium': 'shimmer-premium 2s infinite'
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' }
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
    'glow-cyan',
    'glow-purple',
    'glow-green',
    'heading-premium',
    'text-premium',
    'text-accent-glow',
    'animate-glow-pulse',
    'animate-float'
  ]
};