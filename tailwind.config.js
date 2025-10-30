/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       colors: {
      primary: "#4F46E5", // Indigo
      secondary: "#9333EA", // Purple
      accent: "#22C55E", // Green
      dark: "#0F172A", // Dark navy
      light: "#F1F5F9", // Soft gray
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: ["Playfair Display", "serif"],
    },
    },
  },
  plugins: [],
}
