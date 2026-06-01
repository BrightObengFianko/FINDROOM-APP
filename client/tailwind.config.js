/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1f2937',
        line: '#e5e7eb',
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 40px -24px rgba(15, 23, 42, 0.16)',
        card: '0 10px 25px -16px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}
