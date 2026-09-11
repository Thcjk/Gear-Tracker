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
         * "Paper & Ink" – Papier auf einer Pinnwand.
         *
         * paper und ink tragen zusätzlich Skalen: die Palette nennt vier
         * Eckwerte, für lesbaren Sekundärtext und Zwischenflächen braucht
         * es die Stufen dazwischen. bg-paper und text-ink treffen dabei
         * weiterhin genau die Palettenfarbe (DEFAULT).
         * ------------------------------------------------------------ */
        paper: {
          DEFAULT: "#F3ECDC",
          50: "#FBF7EE",
          100: "#F3ECDC",
          200: "#E8DFC8",
          300: "#D6C9AC",
          400: "#AFA48B",
          500: "#857E6E",
          600: "#625D51",
          700: "#454239",
          800: "#263241",
          900: "#1B2430",
          950: "#121923",
        },
        "paper-dark": "#E8DFC8",
        ink: {
          DEFAULT: "#263241",
          night: "#1B2430",
        },

        /** Kork- bzw. Filzbrett, auf dem alles hängt. */
        cork: {
          DEFAULT: "#B8895F",
          night: "#3A2E22",
        },

        /**
         * Die drei Akzente. Der Palettenwert sitzt jeweils in der Mitte;
         * dunklere und hellere Stufen gibt es, weil keiner der drei auf
         * beiden Papieren als Schrift trägt – Mustard erreicht auf Paper
         * 1.8:1, Rust 4.0:1.
         */
        rust: {
          50: "#FBEDE8",
          100: "#F6D8CC",
          200: "#EDB29B",
          300: "#E58F6D",
          400: "#E07A55",
          500: "#C1502E",
          600: "#A8401F",
          700: "#8A3419",
          800: "#6B2814",
          900: "#4C1C0E",
          950: "#2C1008",
        },
        olive: {
          50: "#F2F3EA",
          100: "#E3E5D2",
          200: "#C8CDA8",
          300: "#A8B472",
          400: "#8C9A5C",
          500: "#74804B",
          600: "#616B3F",
          700: "#545C34",
          800: "#3F4527",
          900: "#2B301B",
          950: "#171A0F",
        },
        mustard: {
          50: "#FEF6E7",
          100: "#FBE9C4",
          200: "#F4D289",
          300: "#EDBC5E",
          400: "#E3A73E",
          500: "#C88C28",
          600: "#A87218",
          700: "#8A6210",
          800: "#6B4B0C",
          900: "#4C3508",
          950: "#2C1E04",
        },

        /**
         * Das gedeckte Blau der Flatlay-Objekte und des Schildkröten-
         * Gepäcks. Es steht in der Palette nicht als Eckwert, gehört aber
         * zur Bildsprache – ohne einen kühlen Ton sind die Illustrationen
         * durchweg warm und dadurch flau.
         */
        denim: {
          50: "#EEF2F6",
          100: "#D9E1EA",
          200: "#B6C6D8",
          300: "#8FA8C4",
          400: "#6C89A8",
          500: "#4A6079",
          600: "#3C4F64",
          700: "#2F3E4F",
          800: "#242F3C",
          900: "#1A222B",
        },

        /**
         * Semantische Farben, die sich mit dem Theme drehen. Sie zeigen auf
         * die CSS-Variablen aus globals.css.
         */
        accent: "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "accent-tertiary": "var(--accent-tertiary)",
        "on-accent": "var(--on-accent)",
        headline: "var(--text-headline)",
        surface: "var(--bg-surface)",
        board: "var(--bg-base)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        hand: ["var(--font-caveat)", "var(--font-inter)", "cursive"],
      },
      boxShadow: {
        /**
         * Die Karte liegt als Papier auf dem Brett: ein versetzter,
         * weicher Schlagschatten, kein Doppelschatten. Die Farben stecken
         * in CSS-Variablen (globals.css) und werden im Dark Mode deutlich
         * kräftiger – auf dunklem Holz verschwindet ein zarter Schatten.
         *
         * Die Namen bleiben, damit nicht jede Datei angefasst werden muss;
         * "neu" heisst hier schlicht "die Standard-Kartenerhebung".
         */
        neu: "2px 5px 12px var(--shadow-card)",
        /**
         * Das aufgesteckte Blatt: ein enger Kontaktschatten direkt unter
         * der Kante und ein weiter, weicher darunter. Ein einzelner
         * weicher Schatten sieht aus wie ein Schein, zwei Ebenen sehen
         * aus wie Papier, das ein paar Millimeter vom Brett absteht.
         */
        sheet:
          "1px 2px 3px var(--shadow-card-soft), 3px 9px 20px var(--shadow-card)",
        "neu-sm": "1px 3px 7px var(--shadow-card-soft)",
        "neu-lg": "4px 10px 22px var(--shadow-card)",
        /* Eingelassen – Eingabefelder, Chips, aktive Tabs */
        "neu-in": "inset 0 2px 5px var(--shadow-inset)",
        "neu-in-sm": "inset 0 1px 3px var(--shadow-inset)",
        /* Farbige Flächen tragen denselben Schatten, nur etwas knapper */
        "neu-accent": "2px 4px 10px var(--shadow-card)",
        pin: "1px 2px 4px var(--pin-shadow)",
        soft: "0 8px 30px rgba(38, 50, 65, 0.14)",
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
        /**
         * Deko-Schildkröte: läuft einmal durchs Bild und lässt sich dann
         * lange nicht blicken.
         *
         * Die Pause steckt in der Kurve selbst und nicht in einer
         * Wiederholungsverzögerung: die Überquerung belegt die ersten
         * 25 % des Zyklus, die restlichen 75 % steht die Figur unsichtbar
         * am rechten Rand. Bei einem Zyklus von 32 s sind das 8 s Laufen
         * und 24 s Ruhe.
         *
         * Die Prozente von translateX beziehen sich auf die eigene Breite
         * des Elements, nicht auf die des Elternteils. Das animierte
         * Element ist deshalb so breit wie sein Elternteil und trägt die
         * Figur an seinem linken Rand – nur so entspricht ±104 % einer
         * vollen Überquerung.
         */
        wander: {
          "0%": { transform: "translateX(-104%)", opacity: "0" },
          "3%": { opacity: "1" },
          "21%": { opacity: "1" },
          "25%": { transform: "translateX(104%)", opacity: "0" },
          "100%": { transform: "translateX(104%)", opacity: "0" },
        },
        /* Leichtes Auf und Ab, damit das Laufen nicht wie Gleiten wirkt */
        plod: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-1.5px) rotate(1deg)" },
        },
        // Überladene Schildkröte: mühsames Schwanken
        sway: {
          "0%, 100%": { transform: "rotate(-1.6deg)" },
          "50%": { transform: "rotate(1.6deg)" },
        },
        // Maskottchen läuft von der Seite ins Bild
        "walk-in": {
          "0%": { opacity: "0", transform: "translate3d(-22%, 0, 0) rotate(-5deg)" },
          "55%": { opacity: "1", transform: "translate3d(3%, 0, 0) rotate(2deg)" },
          "80%": { transform: "translate3d(-1%, 0, 0) rotate(-1deg)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0) rotate(0deg)" },
        },
        // Overlay: der dunkle Grund blendet auf, statt zu springen
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
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
        "fade-in": "fade-in 180ms ease-out both",
        "splash-in": "splash-in 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-forward":
          "slide-forward 260ms cubic-bezier(0.32, 0.72, 0, 1) both",
        "slide-back": "slide-back 260ms cubic-bezier(0.32, 0.72, 0, 1) both",
        // Overshoot: das Icon schiesst leicht über und federt zurück
        "icon-in": "icon-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "label-in": "label-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        sway: "sway 2.6s ease-in-out infinite",
        wander: "wander var(--wander-cycle, 32s) linear infinite",
        plod: "plod 900ms ease-in-out infinite",
        "walk-in": "walk-in 720ms cubic-bezier(0.34, 1.3, 0.64, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
