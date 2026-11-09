/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.js', './components/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        fuboru: { red: '#E31E24', redHover: '#C4161B', yellow: '#FFDE00', dark: '#111827', gray: '#F8FAFC' },
      },
    },
  },
  plugins: [],
};
