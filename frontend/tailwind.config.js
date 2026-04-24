/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple': '#9f54ff',
        'brand-purple-light': '#f5f0ff',
      }
    },
  },
  plugins: [],
}