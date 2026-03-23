/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f9f9f9',
        'on-background': '#1a1c1c',
        primary: '#b5000b',
        'primary-container': '#e30613',
        'on-primary': '#ffffff',
        secondary: '#3a5f94',
        'on-secondary': '#ffffff',
        'surface-container-low': '#f3f3f3',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e8e8e8',
        'on-surface': '#1a1c1c',
        'outline-variant': '#e9bcb6',
        'on-surface-variant': '#5e3f3b',
      },
    },
  },
  plugins: [],
};
