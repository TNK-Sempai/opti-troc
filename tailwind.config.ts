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
        // Forest Premium palette
        'pine-teal': '#344e41',
        'hunter-green': '#3a5a40',
        'fern': '#588157',
        'dry-sage': '#a3b18a',
        'dust-grey': '#dad7cd',

        // Gold accent (CTA)
        'gold': {
          DEFAULT: '#c8a96e',
          hover: '#b8964f',
          light: 'rgba(200, 169, 110, 0.1)',
        },

        // Neutrals
        'charcoal': '#1a1a1a',
        'dark-grey': '#4a4a4a',
        'medium-grey': '#7a7a7a',
        'light-grey': '#e8e4de',
        'off-white': '#f5f2ed',

        // Status
        'success': '#4a7c59',
        'warning': '#c8a33d',
        'error': '#c45c4a',
        'info': '#5a7a8a',
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'xs': ['13px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.78' }],
      },
      borderRadius: {
        'sm': '3px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(26, 26, 26, 0.06)',
        'card-hover': '0 4px 12px rgba(26, 26, 26, 0.08)',
        'forest': '0 4px 20px rgba(52, 78, 65, 0.15)',
        'forest-lg': '0 8px 30px rgba(52, 78, 65, 0.2)',
        'gold': '0 4px 15px rgba(200, 169, 110, 0.3)',
        'gold-glow': '0 0 20px rgba(200, 169, 110, 0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 6s ease infinite',
        'float': 'float 3s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
