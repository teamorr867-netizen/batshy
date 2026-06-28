/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#EAE4DC',
          light: '#F2EDE8',
          dark: '#DDD6CC',
        },
        bronze: {
          DEFAULT: '#B8956A',
          light: '#D4B896',
          dark: '#8C6E48',
        },
        ink: {
          DEFAULT: '#1C1916',
          muted: '#7A7470',
          faint: '#ABA5A0',
        },
        card: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Heebo', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 20px rgba(0,0,0,0.06)',
        card: '0 4px 32px rgba(0,0,0,0.08)',
        gold: '0 4px 24px rgba(184,149,106,0.25)',
      },
    },
  },
  plugins: [],
}
