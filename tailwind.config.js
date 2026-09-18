/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Design-system primaries (slate neutral + blue/indigo accent)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        'brand-sm': '0 1px 3px 0 rgb(99 102 241 / 0.15)',
        'brand':    '0 4px 6px -1px rgb(99 102 241 / 0.15), 0 2px 4px -2px rgb(99 102 241 / 0.1)',
        'brand-lg': '0 10px 15px -3px rgb(99 102 241 / 0.15), 0 4px 6px -4px rgb(99 102 241 / 0.1)',
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                        to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' },                   '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}
