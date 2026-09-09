/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f4",
          100: "#ddeee3",
          200: "#b8dcc6",
          300: "#86c2a2",
          400: "#54a37d",
          500: "#358660",
          600: "#256b4c",
          700: "#1e563e",
          800: "#1a4533",
          900: "#16392b",
          950: "#0c2118",
        },
        earth: {
          50: "#f7f4ef",
          100: "#ebe3d6",
          200: "#d8c7ae",
          300: "#c2a680",
          400: "#b0895c",
          500: "#a1744b",
          600: "#8a5d3f",
          700: "#6f4936",
          800: "#5d3e31",
          900: "#51362c",
          950: "#2d1b16",
        },
        ember: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(22, 57, 43, 0.08)",
        "soft-dark": "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        card: "1.25rem",
      },
    },
  },
  plugins: [],
};
