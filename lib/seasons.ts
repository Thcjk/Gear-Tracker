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
 *
 * Alle Töne stammen aus den Akzentrampen der Palette: Olive, Mustard,
 * Rust und das gedeckte Blau – je Jahreszeit einer. --season-from steht
 * als Schrift auf Amazon Mist und erreicht dort mindestens 6:1,
 * --season-accent auf der Garnet-Karte mindestens 4.5:1.
 */
const THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    season: "spring",
    label: "Frühling",
    vars: {
      "--season-from": "#545C34",
      "--season-via": "#8C9A5C",
      "--season-to": "#2B301B",
      "--season-topo": "#E3E5D2",
      "--season-accent": "#C8CDA8",
    },
  },
  summer: {
    season: "summer",
    label: "Sommer",
    vars: {
      "--season-from": "#8A6210",
      "--season-via": "#E3A73E",
      "--season-to": "#4C3508",
      "--season-topo": "#FBE9C4",
      "--season-accent": "#F4D289",
    },
  },
  autumn: {
    season: "autumn",
    label: "Herbst",
    vars: {
      "--season-from": "#8A3419",
      "--season-via": "#C1502E",
      "--season-to": "#4C1C0E",
      "--season-topo": "#F6D8CC",
      "--season-accent": "#EDB29B",
    },
  },
  winter: {
    season: "winter",
    label: "Winter",
    vars: {
      "--season-from": "#2F3E4F",
      "--season-via": "#4A6079",
      "--season-to": "#1A222B",
      "--season-topo": "#D9E1EA",
      "--season-accent": "#B6C6D8",
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
