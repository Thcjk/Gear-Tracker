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
        /* ------------------------------------------------------------ *
         * Die sechs Farben der Palette, unter ihren Namen.
         * ------------------------------------------------------------ */
        "morning-snow": "#F5F4ED",
        "amazon-mist": "#ECECDC",
        "aqua-mist": "#A0C9CB",
        "toxic-orange": "#FF6037",
        "black-kite": "#351E1C",
        garnet: "#733635",

        /**
         * Flächen und Text. Die Eckpunkte sind die Palettenfarben, die
         * Zwischenstufen dazwischen interpoliert – ohne sie gäbe es keinen
         * lesbaren Sekundärtext und keinen Platzhalter, der die 4.5:1
         * erreicht.
         *
         * 100/200 = Morning Snow / Amazon Mist (Grundfläche und Karte hell)
         * 800/900 = Garnet / Black Kite (Karte und Grundfläche dunkel)
         */
        clay: {
          50: "#FBFAF5",
          100: "#F5F4ED",
          200: "#ECECDC",
          300: "#DCDBC5",
          400: "#C2BEA9",
          500: "#8E8878",
          600: "#6F675A",
          700: "#574A45",
          800: "#733635",
          900: "#351E1C",
          950: "#241110",
        },

        /**
         * Der Hauptakzent. 500 ist Toxic Orange selbst; es trägt schwarze
         * Schrift (5.2:1), auf hellem Grund als Textfarbe reicht es dagegen
         * nicht – dafür sind 700 und 800 da.
         */
        ember: {
          50: "#FFF1EC",
          100: "#FFDFD4",
          200: "#FFC0AC",
          300: "#FF9B7C",
          400: "#FF7C55",
          500: "#FF6037",
          600: "#E24A22",
          700: "#B33D1F",
          800: "#8F2E15",
          900: "#6B2311",
          950: "#3F140A",
        },

        /** Der kühle Sekundärakzent. 300 ist Aqua Mist selbst. */
        aqua: {
          50: "#F0F7F7",
          100: "#DCEBEC",
          200: "#BFDBDC",
          300: "#A0C9CB",
          400: "#7BAFB2",
          500: "#5E9295",
          600: "#4A7578",
          700: "#3C5D60",
          800: "#2F4749",
          900: "#233436",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Doppelschatten: heller Schein oben links, dunkler unten rechts.
        // Die Farben stecken in CSS-Variablen (globals.css) und wechseln
        // mit dem Theme, die Geometrie bleibt gleich.
        neu: "7px 7px 16px var(--neu-dark), -7px -7px 16px var(--neu-light)",
        "neu-sm": "4px 4px 9px var(--neu-dark), -4px -4px 9px var(--neu-light)",
        "neu-lg":
          "12px 12px 26px var(--neu-dark), -12px -12px 26px var(--neu-light)",
        // Eingedrückt – für aktive Tabs, Eingabefelder und getippte Buttons
        "neu-in":
          "inset 5px 5px 11px var(--neu-dark), inset -5px -5px 11px var(--neu-light)",
        "neu-in-sm":
          "inset 3px 3px 7px var(--neu-dark), inset -3px -3px 7px var(--neu-light)",
        // Für farbige Flächen (Akzent-Buttons), die keinen hellen Schein tragen
        "neu-accent": "5px 5px 12px var(--neu-dark)",
        soft: "0 8px 30px rgba(53, 30, 28, 0.10)",
        "soft-dark": "0 8px 30px rgba(0, 0, 0, 0.45)",
      },
      borderRadius: {
        card: "1.5rem",
        control: "1rem",
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
        // Wizard: Kategorie-Icon springt von unten herein
        "icon-in": {
          "0%": { opacity: "0", transform: "translate3d(0, 40px, 0) scale(0.9)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0) scale(1)" },
        },
        "label-in": {
          "0%": { opacity: "0", transform: "translate3d(0, 12px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        // Seitenwechsel: neuer Screen schiebt sich herein
        "slide-forward": {
          "0%": { opacity: "0", transform: "translate3d(28px, 0, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "slide-back": {
          "0%": { opacity: "0", transform: "translate3d(-28px, 0, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        // Splash: Logo blendet ein und wächst leicht
        "splash-in": {
          "0%": { opacity: "0", transform: "scale(0.86)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Karte: kurzes Aufblitzen beim Abhaken
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
        "slide-forward":
          "slide-forward 260ms cubic-bezier(0.32, 0.72, 0, 1) both",
        "slide-back": "slide-back 260ms cubic-bezier(0.32, 0.72, 0, 1) both",
        // Overshoot: das Icon schiesst leicht über und federt zurück
        "icon-in": "icon-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "label-in": "label-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
