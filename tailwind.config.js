/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        civic: {
          50: "#f1f8f4",
          100: "#dcefe3",
          200: "#bbdfc9",
          300: "#8cc7a7",
          400: "#58a77e",
          500: "#358a63",
          600: "#266e4e",
          700: "#20583f",
          800: "#1b4734",
          900: "#0d3b2e",
          950: "#08221b"
        },
        clay: "#d77b48",
        parchment: "#f7f4ed"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Georgia", "Cambria", "serif"]
      },
      boxShadow: {
        card: "0 14px 40px rgba(13, 59, 46, 0.08)"
      }
    }
  },
  plugins: []
};
