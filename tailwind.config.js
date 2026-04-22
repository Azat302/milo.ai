/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'milo-blue': '#2563eb',
        'milo-red': '#ff6b6b',
        'milo-yellow': '#ffd43b',
        'milo-green': '#51cf66',
      },
      boxShadow: {
        'milo': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
