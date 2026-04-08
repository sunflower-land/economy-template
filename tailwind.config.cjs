/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brown: {
          100: "#EAD4AA",
          200: "#e7a873",
          300: "#c28669",
          400: "#966953",
          600: "#b96f50",
          700: "#945542",
        },
      },
    },
  },
  plugins: [],
};
