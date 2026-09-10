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
 * Alle Töne stammen aus den Rampen zwischen Oceanic und Nectarine; die
 * Jahreszeiten unterscheiden sich über Temperatur und Tiefe, nicht über
 * neue Farben. --season-from steht
 * als Schrift auf Amazon Mist und erreicht dort mindestens 6:1,
 * --season-accent auf der Garnet-Karte mindestens 4.5:1.
 */
const THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    season: "spring",
    label: "Frühling",
    vars: {
      "--season-from": "#0A5A64",
      "--season-via": "#2C7F89",
      "--season-to": "#002B31",
      "--season-topo": "#D2E7E9",
      "--season-accent": "#A6CFD3",
    },
  },
  summer: {
    season: "summer",
    label: "Sommer",
    vars: {
      "--season-from": "#94590F",
      "--season-via": "#DA8B36",
      "--season-to": "#5A3509",
      "--season-topo": "#FFE9CF",
      "--season-accent": "#FFD5A4",
    },
  },
  autumn: {
    season: "autumn",
    label: "Herbst",
    vars: {
      "--season-from": "#8A3B12",
      "--season-via": "#B5711A",
      "--season-to": "#3A2206",
      "--season-topo": "#FFE9CF",
      "--season-accent": "#FFBD76",
    },
  },
  winter: {
    season: "winter",
    label: "Winter",
    vars: {
      "--season-from": "#003F47",
      "--season-via": "#10707D",
      "--season-to": "#001A1E",
      "--season-topo": "#D2E7E9",
      "--season-accent": "#6FB4BC",
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
