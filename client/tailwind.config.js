/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',      // Emerald-500 - xanh lá chủ đạo
        'primary-dark': '#047857', // Emerald-700 - hover
        secondary: '#0ea5e9',     // Sky-500 - cho kiến thức
        accent: '#f59e0b',       // Amber-500 - cho diễn đàn nổi bật
        danger: '#ef4444',       // Red-500
        success: '#22c55e',      // Green-500
        warning: '#f97316',      // Orange-500
        muted: '#6b7280',
        light: '#f8fafc',
        'gray-bg': '#f1f5f9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 15px -3px rgba(0, 0, 0, 0.1)',
        'card': '0 8px 25px -5px rgba(0, 0, 0, 0.08)',
        'hover': '0 12px 30px -8px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        '300': '300ms',
      },
    },
  },
  plugins: [],
}