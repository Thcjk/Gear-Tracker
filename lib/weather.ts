/**
 * Wetter am Zielort – von Open-Meteo, ohne Schlüssel und ohne Konto.
 *
 * Das ist die einzige Stelle, an der diese App das Gerät verlässt. Was
 * dabei hinausgeht, ist der eingetippte Ortsname (bei der Suche) und die
 * Koordinaten des gewählten Ortes (bei der Vorhersage) – keine Packliste,
 * keine Ausrüstung, keine Kennung. Wer keinen Zielort setzt, löst nie
 * einen Request aus.
 *
 * Alles hier scheitert leise: geht etwas schief – offline, Zeitüberschrei-
 * tung, kaputte Antwort –, kommt null zurück und die Oberfläche zeigt
 * gar nichts. Eine Fehlermeldung über das Wetter wäre in einer Packliste
 * Lärm; das Wetter ist Beiwerk, die Liste ist die Sache.
 */

export interface Destination {
  name: string;
  lat: number;
  lon: number;
}

export interface GeoHit extends Destination {
  /** "Bern, Schweiz" – Region und Land zur Unterscheidung gleicher Namen. */
  detail: string;
}

export type SkyKind =
  | "sun"
  | "partly"
  | "cloud"
  | "fog"
  | "rain"
  | "snow"
  | "thunder";

export interface ForecastDay {
  /** ISO-Datum, z. B. "2026-07-14". */
  date: string;
  kind: SkyKind;
  label: string;
  maxC: number;
  minC: number;
  /** Niederschlag in mm. */
  mm: number;
}

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** Nach dieser Zeit gilt eine Anfrage als gescheitert. */
const TIMEOUT_MS = 8000;

/**
 * WMO-Wettercodes auf sieben Bilder eingedampft.
 *
 * Die Norm kennt gut zwei Dutzend Abstufungen ("leichter gefrierender
 * Sprühregen"). Für die Frage, ob eine Regenjacke mitmuss, sind sieben
 * genug – und mehr Bilder als sieben könnte man auf 32 Pixel ohnehin
 * nicht unterscheiden.
 */
const SKY: Array<{ codes: number[]; kind: SkyKind; label: string }> = [
  { codes: [0], kind: "sun", label: "Klar" },
  { codes: [1, 2], kind: "partly", label: "Teils bewölkt" },
  { codes: [3], kind: "cloud", label: "Bedeckt" },
  { codes: [45, 48], kind: "fog", label: "Nebel" },
  { codes: [51, 53, 55, 56, 57], kind: "rain", label: "Nieselregen" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], kind: "rain", label: "Regen" },
  { codes: [71, 73, 75, 77, 85, 86], kind: "snow", label: "Schnee" },
  { codes: [95, 96, 99], kind: "thunder", label: "Gewitter" },
];

export function skyFor(code: number): { kind: SkyKind; label: string } {
  const hit = SKY.find((entry) => entry.codes.includes(code));
  // Unbekannter Code heisst nicht "kein Wetter": bedeckt ist die
  // harmloseste Annahme, die niemanden falsch beruhigt.
  return hit
    ? { kind: hit.kind, label: hit.label }
    : { kind: "cloud", label: "Bewölkt" };
}

/** fetch mit Zeitlimit; jeder Fehler endet als null. */
async function getJson(url: string): Promise<unknown | null> {
  if (typeof fetch === "undefined") return null;
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: abort.signal });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Plausible Koordinaten – alles andere wird verworfen. */
export function isDestination(value: unknown): value is Destination {
  if (!isRecord(value)) return false;
  const lat = num(value.lat);
  const lon = num(value.lon);
  return (
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    lat !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lon !== null &&
    lon >= -180 &&
    lon <= 180
  );
}

export async function searchPlaces(query: string): Promise<GeoHit[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const url = `${GEO_URL}?name=${encodeURIComponent(
    term,
  )}&count=5&language=de&format=json`;
  const data = await getJson(url);
  if (!isRecord(data) || !Array.isArray(data.results)) return [];

  const hits: GeoHit[] = [];
  for (const entry of data.results) {
    if (!isRecord(entry)) continue;
    const name = typeof entry.name === "string" ? entry.name : "";
    const lat = num(entry.latitude);
    const lon = num(entry.longitude);
    if (!name || lat === null || lon === null) continue;
    const parts = [entry.admin1, entry.country].filter(
      (part): part is string => typeof part === "string" && part.length > 0,
    );
    hits.push({ name, lat, lon, detail: parts.join(", ") });
  }
  return hits;
}

/* ------------------------------------------------------------------ *
 * Zwischenspeicher
 *
 * Eine Vorhersage ändert sich nicht im Minutentakt. Ohne Puffer holt
 * jeder Wechsel auf die Detailseite dieselben fünf Tage neu – auf einer
 * Tour ist das der Akku und das Datenvolumen, die dafür draufgehen.
 * Der Puffer lebt im Modul, nicht im LocalStorage: er soll einen Reload
 * nicht überleben, sonst hängt jemand mit altem Wetter fest.
 * ------------------------------------------------------------------ */
const CACHE_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; days: ForecastDay[] }>();

export async function fetchForecast(
  place: Destination,
  days = 5,
): Promise<ForecastDay[] | null> {
  // Auf vier Nachkommastellen gerundet: rund elf Meter genau. Zwei
  // Anfragen für denselben Ort sollen sich denselben Eintrag teilen.
  const key = `${place.lat.toFixed(4)},${place.lon.toFixed(4)},${days}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.days;

  const url =
    `${FORECAST_URL}?latitude=${place.lat}&longitude=${place.lon}` +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum" +
    `&timezone=auto&forecast_days=${days}`;
  const data = await getJson(url);
  if (!isRecord(data) || !isRecord(data.daily)) return null;

  const daily = data.daily;
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const codes = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const highs = Array.isArray(daily.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const lows = Array.isArray(daily.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];
  const rain = Array.isArray(daily.precipitation_sum)
    ? daily.precipitation_sum
    : [];

  const out: ForecastDay[] = [];
  for (let i = 0; i < dates.length; i += 1) {
    const date = dates[i];
    const code = num(codes[i]);
    const maxC = num(highs[i]);
    const minC = num(lows[i]);
    // Datum, Code und beide Temperaturen müssen da sein; ein Tag ohne
    // Zahlen wäre eine leere Spalte, die aussieht wie ein Fehler.
    if (typeof date !== "string" || code === null || maxC === null || minC === null) {
      continue;
    }
    const sky = skyFor(code);
    out.push({
      date,
      kind: sky.kind,
      label: sky.label,
      maxC,
      minC,
      mm: num(rain[i]) ?? 0,
    });
  }

  if (out.length === 0) return null;
  cache.set(key, { at: Date.now(), days: out });
  return out;
}
