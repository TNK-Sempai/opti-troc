import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1a2332',
          DEFAULT: '#4a90e2',
          light: '#6ba3e8',
        },
        accent: {
          gold: '#d4a574',
        },
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e8ebef',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#1a2332',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config