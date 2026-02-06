/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neumorphic-bg': '#2D2D2D',
        'neumorphic-surface': '#3A3A3A',
        'neumorphic-accent': '#FF3B30',
        'neumorphic-text': '#8E8E93',
        'neumorphic-text-primary': '#FFFFFF',
      },
      boxShadow: {
        'neumorphic-outer': '3px 3px 6px rgba(0, 0, 0, 0.3), -3px -3px 6px rgba(255, 255, 255, 0.1)',
        'neumorphic-outer-small': '2px 2px 4px rgba(0, 0, 0, 0.3), -2px -2px 4px rgba(255, 255, 255, 0.1)',
        'neumorphic-inner': 'inset 2px 2px 4px rgba(0, 0, 0, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.1)',
        'neumorphic-inner-large': 'inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'typing': 'typing 1.4s infinite ease-in-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
      },
      keyframes: {
        typing: {
          '0%, 80%, 100%': {
            transform: 'scale(0.8)',
            opacity: '0.5',
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
