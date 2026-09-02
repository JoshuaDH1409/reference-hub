/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#EAEBE7',
        'navy': '#00022C',
        'charcoal': '#1F2025',
        'accent-orange': '#F66B40',
        'blue-gray': '#7AA6B3',
        'blue-gray-20': 'rgba(122, 166, 179, 0.2)',
        'blue-gray-40': 'rgba(122, 166, 179, 0.4)',
      },
      fontFamily: {
        sans: ['Futura', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
