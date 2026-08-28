import type { Config } from 'tailwindcss'
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#14315c', d: '#0e2240', 2: '#2e5a8f', 3: '#5b8fc7' },
        gold: { DEFAULT: '#c79a3a', l: '#e0c068', bg: '#f6efdd' },
        ink: '#1b2a44', muted: '#5b6b85', soft: '#8493a8',
        line: '#e4ebf5', bg2: '#f4f7fc',
        green: { DEFAULT: '#3f8f6a', bg: '#e5f2ec' },
        red:   { DEFAULT: '#c0504d', bg: '#f8e7e6' },
        amber: { DEFAULT: '#b8860b', bg: '#fdf3dc' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config
