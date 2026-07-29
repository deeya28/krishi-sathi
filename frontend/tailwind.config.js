/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "paddy-green": "rgb(var(--color-paddy-green) / <alpha-value>)",
        "gold-grain": "rgb(var(--color-gold-grain) / <alpha-value>)",
        "mist-blue": "#6E8F96",
        soil: "rgb(var(--color-soil) / <alpha-value>)",
        "soil-dark": "rgb(var(--color-soil-dark) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-text) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Work Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
