/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          navy: '#0A192F',
          black: '#121212',
          gray: '#8892B0',
          white: '#E6F1FF',
        },
        accent: {
          red: '#FF5252',
          blue: '#64FFDA',
        }
      },
      keyframes: {
        'music-bar': {
          '0%, 100%': { height: '20px' },
          '50%': { height: '50px' }
        }
      },
      animation: {
        'music-bar': 'music-bar 1s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};