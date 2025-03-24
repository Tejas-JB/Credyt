/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121827",
        card: "#1a2236",
        primary: "#3b82f6",
        secondary: "#8b5cf6",
        accent: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        darkText: "#94a3b8",
        lightText: "#f8fafc",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} 