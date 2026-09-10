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
         * Die vier Farben der Palette, unter ihren Namen.
         * ------------------------------------------------------------ */
        onyx: "#0A171D",
        wheat: "#FFF6E9",
        oceanic: "#003F47",
        nectarine: "#FFBD76",

        /**
         * Semantische Farben, die sich mit dem Theme drehen. Sie zeigen auf
         * die CSS-Variablen aus globals.css.
         *
         * Der Grund steht in der Palette selbst: Oceanic hat auf Onyx nur
         * 1.6:1 und Nectarine auf Wheat nur 1.5:1 – keine der beiden
         * Akzentfarben funktioniert in beiden Themes. "accent" ist deshalb
         * hell Oceanic und dunkel Nectarine, und jede Stelle, die einfach
         * "den Akzent" meint, bekommt automatisch den richtigen.
         */
        accent: "var(--accent)",
        "accent-warm": "var(--accent-warm)",
        "on-accent": "var(--on-accent)",
        headline: "var(--text-headline)",
        surface: "var(--bg-surface)",

        /**
         * Flächen und Text, von Wheat bis Onyx. Die Zwischenstufen sind
         * interpoliert – ohne sie gäbe es keinen lesbaren Sekundärtext.
         *
         * 50/100 = Weiss / Wheat (Karte und Grundfläche hell)
         * 800/900 = #142229 / Onyx (Karte und Grundfläche dunkel)
         */
        clay: {
          50: "#FFFFFF",
          100: "#FFF6E9",
          200: "#F6EAD8",
          300: "#E4D6C1",
          400: "#C0B2A0",
          500: "#8C8377",
          600: "#6B655D",
          700: "#4A4741",
          800: "#142229",
          900: "#0A171D",
          950: "#050D11",
        },

        /** Die Oceanic-Rampe. 800 ist Oceanic selbst. */
        ocean: {
          50: "#EBF4F5",
          100: "#D2E7E9",
          200: "#A6CFD3",
          300: "#6FB4BC",
          400: "#4E9AA2",
          500: "#2C7F89",
          600: "#10707D",
          700: "#0A5A64",
          800: "#003F47",
          900: "#002B31",
          950: "#001A1E",
        },

        /** Die Nectarine-Rampe. 300 ist Nectarine selbst. */
        nectar: {
          50: "#FFF6EA",
          100: "#FFE9CF",
          200: "#FFD5A4",
          300: "#FFBD76",
          400: "#F0A24F",
          500: "#DA8B36",
          600: "#B5711A",
          700: "#94590F",
          800: "#78470C",
          900: "#5A3509",
          950: "#3A2206",
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
        soft: "0 8px 30px rgba(10, 23, 29, 0.10)",
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
