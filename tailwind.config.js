/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          dark: '#A07830',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          card: '#141414',
          border: '#2A2A2A',
          hover: '#1E1E1E',
        },
      },
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
