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
 * Alle Töne stammen aus der Palette; die Jahreszeiten unterscheiden sich
 * über Temperatur und Tiefe, nicht über neue Farben. --season-from steht
 * als Schrift auf Amazon Mist und erreicht dort mindestens 6:1,
 * --season-accent auf der Garnet-Karte mindestens 4.5:1.
 */
const THEMES: Record<Season, SeasonalTheme> = {
  spring: {
    season: "spring",
    label: "Frühling",
    vars: {
      "--season-from": "#2F4749",
      "--season-via": "#55888B",
      "--season-to": "#233436",
      "--season-topo": "#DCEBEC",
      "--season-accent": "#BFDBDC",
    },
  },
  summer: {
    season: "summer",
    label: "Sommer",
    vars: {
      "--season-from": "#8F2E15",
      "--season-via": "#E24A22",
      "--season-to": "#6B2311",
      "--season-topo": "#FFDFD4",
      "--season-accent": "#FFC0AC",
    },
  },
  autumn: {
    season: "autumn",
    label: "Herbst",
    vars: {
      "--season-from": "#733635",
      "--season-via": "#B33D1F",
      "--season-to": "#351E1C",
      "--season-topo": "#FFDFD4",
      "--season-accent": "#E0A9A8",
    },
  },
  winter: {
    season: "winter",
    label: "Winter",
    vars: {
      "--season-from": "#3C5D60",
      "--season-via": "#4A7578",
      "--season-to": "#233436",
      "--season-topo": "#DCEBEC",
      "--season-accent": "#A0C9CB",
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
