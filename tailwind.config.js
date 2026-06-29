/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
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
        ink: {
          950: '#0a0a14',
          900: '#0f0f1e',
          800: '#16162b',
          700: '#1e1e3a',
        },
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
        'grad-brand-soft': 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #e879f9 100%)',
        'mesh': 'radial-gradient(at 0% 0%, rgba(99,102,241,0.35) 0px, transparent 50%), radial-gradient(at 98% 2%, rgba(217,70,239,0.25) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(139,92,246,0.30) 0px, transparent 50%)',
      },
      boxShadow: {
        glow: '0 0 60px -15px rgba(99,102,241,0.5)',
        'glow-lg': '0 0 100px -20px rgba(139,92,246,0.6)',
        card: '0 1px 3px rgba(15,15,30,0.04), 0 12px 32px -12px rgba(15,15,30,0.12)',
        'card-hover': '0 1px 3px rgba(15,15,30,0.06), 0 24px 48px -16px rgba(99,102,241,0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.21,0.6,0.35,1) both',
        'fade-in': 'fade-in 0.8s ease both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.2,1) infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
}
