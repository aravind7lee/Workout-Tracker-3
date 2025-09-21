/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: '#00e6a1',
        accent: '#7c5cff'
      }
    }
  },
  plugins: []
};