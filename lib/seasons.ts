export type Season = "spring" | "summer" | "autumn" | "winter";

export interface SeasonalTheme {
  season: Season;
  /** Kurzlabel für das Banner, z. B. "Herbst" */
  label: string;
  /** CSS-Variablen für Verlauf, Höhenlinien und Akzent */
  vars: {
    "--season-from": string;
    "--season-via": string;
    "--season-to": string;
    "--season-topo": string;
    "--season-accent": string;
  };
}

/**
 * Vier Paletten als CSS-Variablen statt dynamisch zusammengesetzter
 * Tailwind-Klassen: Tailwind purged Klassennamen, die erst zur Laufzeit
 * entstehen, weg – CSS-Variablen überleben das zuverlässig.
 */
const THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    season: "spring",
    label: "Frühling",
    vars: {
      "--season-from": "#2f7d55",
      "--season-via": "#54a37d",
      "--season-to": "#1e563e",
      "--season-topo": "#ddeee3",
      "--season-accent": "#86c2a2",
    },
  },
  summer: {
    season: "summer",
    label: "Sommer",
    vars: {
      "--season-from": "#256b4c",
      "--season-via": "#4d8f36",
      "--season-to": "#16392b",
      "--season-topo": "#e8f3c8",
      "--season-accent": "#b6d957",
    },
  },
  autumn: {
    season: "autumn",
    label: "Herbst",
    vars: {
      "--season-from": "#8a5d3f",
      "--season-via": "#c2410c",
      "--season-to": "#51362c",
      "--season-topo": "#ffedd5",
      "--season-accent": "#fdba74",
    },
  },
  winter: {
    season: "winter",
    label: "Winter",
    vars: {
      "--season-from": "#31505a",
      "--season-via": "#4a6b6b",
      "--season-to": "#1c3330",
      "--season-topo": "#dbeaee",
      "--season-accent": "#9dc0c4",
    },
  },
};

export function seasonForMonth(month: number): Season {
  if (month >= 2 && month <= 4) return "spring"; // März–Mai
  if (month >= 5 && month <= 7) return "summer"; // Juni–August
  if (month >= 8 && month <= 10) return "autumn"; // September–November
  return "winter"; // Dezember–Februar
}

/** Client-seitig aus dem aktuellen Datum ermittelt (Nordhalbkugel). */
export function getSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  return THEMES[seasonForMonth(date.getMonth())];
}
