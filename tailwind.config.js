/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        ink: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-border) / <alpha-value>)',
        primary: {
          50: '#f4f7ff',
          100: '#e9efff',
          200: '#d6e0ff',
          300: '#b7c8ff',
          400: '#93adff',
          500: '#6f8cff',
          600: '#5b77f2',
          700: '#4761d6',
          800: '#3a4fb0',
          900: '#2f418f',
          950: '#1f2a5f',
        },
        accent: {
          50: '#f1fbf7',
          100: '#dcf6ee',
          200: '#b6eadb',
          300: '#88d9c4',
          400: '#56c7ab',
          500: '#2fb397',
          600: '#249d83',
          700: '#1e7d6a',
          800: '#1b6356',
          900: '#174f45',
          950: '#0b2b27',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
