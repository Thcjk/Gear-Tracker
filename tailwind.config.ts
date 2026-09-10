import type { Config } from "tailwindcss";

const config: Config = {
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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(22, 57, 43, 0.08)",
        "soft-dark": "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        card: "1.25rem",
      },
      keyframes: {
        // Karten: sanft einblenden und leicht nach oben gleiten
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Checkbox: kurzer Bounce beim Abhaken
        pop: {
          "0%, 100%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.3)" },
        },
        // Splash: Logo blendet ein und wächst leicht
        "splash-in": {
          "0%": { opacity: "0", transform: "scale(0.86)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Karte: kurzes Grün-Aufblitzen
        flash: {
          "0%": { opacity: "0.45" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        rise: "rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        flash: "flash 650ms ease-out forwards",
        "splash-in": "splash-in 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
