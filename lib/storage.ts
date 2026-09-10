import type {
  AppData,
  Category,
  GearItem,
  PackingList,
  PackingListItem,
  ThemeMode,
  TourItemReview,
  TourReview,
  WeightFeeling,
} from "@/types";
import {
  CATEGORIES,
  COMFORT_TEMP_MAX,
  COMFORT_TEMP_MIN,
  hasComfortTemp,
} from "@/lib/categories";

/**
 * Einziger Ort, an dem der Schlüssel definiert wird (auch vom Anti-Flash-
 * Skript genutzt).
 *
 * Der Präfix "ultralight-" bleibt trotz der Umbenennung der App zu
 * "Gear-Tracker" stehen, und dasselbe gilt für die Schlüssel in
 * backups.ts, shareFormat.ts und weightHistory.ts. Er ist keine Anzeige,
 * sondern die Adresse, unter der die Daten im Gerät liegen: wird er
 * geändert, findet die App die Bestände der Nutzer nicht mehr und startet
 * für sie mit leerer Library. Eine Umbenennung bräuchte eine Migration,
 * die die alten Schlüssel ausliest und überträgt – der Gewinn wäre ein
 * hübscherer Name in den Entwicklerwerkzeugen.
 */
export const STORAGE_KEY = "ultralight-gear-tracker-v1";

/**
 * Hierhin wandert ein Datenbestand, den JSON.parse nicht lesen kann.
 *
 * Vorher startete die App in dem Fall stillschweigend mit leerer Library –
 * und die nächste beliebige Aktion schrieb diesen leeren Stand über die
 * noch vollständig vorhandenen Rohdaten. Damit waren sie endgültig weg,
 * obwohl sie bis zu diesem Moment reparierbar dagewesen wären.
 */
export const QUARANTINE_KEY = "ultralight-gear-tracker-unreadable-v1";

const defaultData: AppData = {
  gearItems: [],
  packingLists: [],
  tourReviews: [],
  theme: "light",
};

/* ------------------------------------------------------------------ *
 * Schema-Versionierung
 *
 * Der gespeicherte Stand trägt seine Version mit. Ändert sich das
 * Datenmodell, kommt hier eine Migration dazu, die fehlende Felder mit
 * sinnvollen Werten auffüllt – statt dass später jemand versucht ist,
 * bei unerwarteter Form auf Default-Daten zurückzufallen. Migrationen
 * dürfen ergänzen und umformen, niemals Einträge wegwerfen.
 * ------------------------------------------------------------------ */

/** Aktuelle Version des gespeicherten Formats. */
export const SCHEMA_VERSION = 3;

/**
 * Version 1 ist der Altbestand ohne schemaVersion-Feld: gearItems,
 * packingLists und theme, sonst nichts. Version 2 ist derselbe Aufbau mit
 * ausgewiesener Version – die Felder, die seither dazukamen
 * (comfortTempC), sind durchweg optional, es gibt also nichts umzurechnen.
 * Version 3 bringt das Tourbuch (tourReviews) mit.
 */
const MIGRATIONS: Record<
  number,
  (data: Record<string, unknown>) => Record<string, unknown>
> = {
  1: (data) => ({ ...data, schemaVersion: 2 }),
  // Wer die App vorher benutzt hat, hat keine Touren ausgewertet – eine
  // leere Liste ist die richtige Antwort, kein fehlendes Feld.
  2: (data) => ({
    ...data,
    tourReviews: Array.isArray(data.tourReviews) ? data.tourReviews : [],
    schemaVersion: 3,
  }),
};

/** Liest die Version aus dem gespeicherten Objekt; fehlt sie, ist es Version 1. */
function readSchemaVersion(raw: Record<string, unknown>): number {
  const version = toNumber(raw.schemaVersion);
  return version !== null && version >= 1 ? Math.floor(version) : 1;
}

/**
 * Hebt einen gespeicherten Stand Schritt für Schritt auf die aktuelle
 * Version. Ein Stand aus der Zukunft (neuere App auf einem anderen Gerät)
 * wird unverändert durchgereicht: die Normalisierung ist nachsichtig, und
 * fremde Felder wegzuwerfen wäre schlimmer als sie zu ignorieren.
 */
function migrate(raw: Record<string, unknown>): Record<string, unknown> {
  let current = raw;
  let version = readSchemaVersion(raw);

  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) break;
    current = step(current);
    const next = readSchemaVersion(current);
    // Setzt eine Migration die Version nicht hoch, bricht die Schleife ab
    // statt endlos zu laufen.
    if (next <= version) break;
    version = next;
  }

  return current;
}

const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
const FALLBACK_CATEGORY: Category = "hygiene-misc";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/* ------------------------------------------------------------------ *
 * Rohzugriff
 *
 * Der einzige Ort im Projekt, an dem localStorage direkt angefasst wird.
 * Lesen und Schreiben können beide werfen (gesperrter Storage, volles
 * Kontingent, kaputtes JSON) und werden hier abgefangen.
 * ------------------------------------------------------------------ */

export function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Prüft, ob überhaupt geschrieben werden kann. In privaten Modi und bei
 * vollem Kontingent existiert localStorage, setItem wirft aber. Das fällt
 * sonst erst auf, wenn die erste Änderung bereits verloren ist.
 */
export function isStorageWritable(): boolean {
  if (!canUseStorage()) return false;
  const probe = "__gear-tracker-probe__";
  try {
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (!canUseStorage()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Normalisierung
 *
 * Alles, was aus dem LocalStorage oder aus einem JSON-Import kommt, ist
 * unbekannter Herkunft: älteres Schema, abgebrochener Schreibvorgang,
 * von Hand bearbeitete Datei. Früher wurde der Inhalt blind als
 * Partial<AppData> gecastet – eine Packliste ohne items-Array hat damit
 * die ganze App mit "Cannot read properties of undefined" zerlegt.
 * Deshalb wird jeder Eintrag geprüft und repariert, Unbrauchbares
 * fliegt raus.
 * ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function toNumber(value: unknown): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toIsoDate(value: unknown): string {
  return toText(value) ?? new Date().toISOString();
}

function normalizeGearItem(raw: unknown): GearItem | null {
  if (!isRecord(raw)) return null;

  const id = toText(raw.id);
  const name = toText(raw.name);
  const weight = toNumber(raw.weightGrams);
  if (!id || !name || weight === null || weight < 0) return null;

  const rawCategory = toText(raw.category);
  const category =
    rawCategory && CATEGORY_IDS.has(rawCategory)
      ? (rawCategory as Category)
      : FALLBACK_CATEGORY;

  const price = toNumber(raw.price);
  const notes = toText(raw.notes);
  const comfortTempC = toNumber(raw.comfortTempC);

  return {
    id,
    name,
    category,
    weightGrams: weight,
    ...(price !== null && price >= 0 ? { price } : {}),
    // An eine andere Kategorie gehängt wäre der Wert nirgends sichtbar und
    // würde beim Umkategorisieren still weiterleben.
    ...(hasComfortTemp(category) &&
    comfortTempC !== null &&
    comfortTempC >= COMFORT_TEMP_MIN &&
    comfortTempC <= COMFORT_TEMP_MAX
      ? { comfortTempC }
      : {}),
    ...(notes ? { notes } : {}),
    createdAt: toIsoDate(raw.createdAt),
  };
}

function normalizePackingListItem(raw: unknown): PackingListItem | null {
  if (!isRecord(raw)) return null;

  const gearItemId = toText(raw.gearItemId);
  if (!gearItemId) return null;

  const quantity = toNumber(raw.quantity);

  return {
    gearItemId,
    quantity: quantity !== null && quantity >= 1 ? Math.floor(quantity) : 1,
    packed: raw.packed === true,
  };
}

function normalizePackingList(raw: unknown): PackingList | null {
  if (!isRecord(raw)) return null;

  const id = toText(raw.id);
  const name = toText(raw.name);
  if (!id || !name) return null;

  // Doppelte gearItemIds zusammenführen: sie würden sonst doppelte React-Keys
  // erzeugen und die Mengen wären über zwei Einträge verteilt.
  const merged = new Map<string, PackingListItem>();
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  for (const entry of rawItems) {
    const item = normalizePackingListItem(entry);
    if (!item) continue;
    const existing = merged.get(item.gearItemId);
    if (existing) {
      existing.quantity += item.quantity;
      existing.packed = existing.packed || item.packed;
    } else {
      merged.set(item.gearItemId, item);
    }
  }

  const createdAt = toIsoDate(raw.createdAt);

  return {
    id,
    name,
    items: [...merged.values()],
    createdAt,
    updatedAt: toText(raw.updatedAt) ?? createdAt,
  };
}

const WEIGHT_FEELINGS = new Set<string>([
  "zu schwer",
  "genau richtig",
  "zu leicht",
]);

function normalizeItemReview(raw: unknown): TourItemReview | null {
  if (!isRecord(raw)) return null;
  const gearItemId = toText(raw.gearItemId);
  if (!gearItemId) return null;
  const note = toText(raw.note);
  return {
    gearItemId,
    used: raw.used === true,
    ...(note ? { note } : {}),
  };
}

/**
 * Eine Auswertung ohne lesbares Gewichtsgefühl ist trotzdem wertvoll: die
 * Freitexte sind der eigentliche Inhalt. Fehlt der Wert oder ist er
 * unbekannt, gilt "genau richtig" als neutrale Annahme, statt den ganzen
 * Eintrag wegzuwerfen.
 */
function normalizeTourReview(raw: unknown): TourReview | null {
  if (!isRecord(raw)) return null;

  const id = toText(raw.id);
  const packingListId = toText(raw.packingListId);
  if (!id || !packingListId) return null;

  const answers = isRecord(raw.generalAnswers) ? raw.generalAnswers : {};
  const feeling = toText(answers.weightFeeling);
  const text = (value: unknown) => toText(value)?.trim() || null;

  const whatWorked = text(answers.whatWorked);
  const whatWasMissing = text(answers.whatWasMissing);
  const whatToLeaveOut = text(answers.whatToLeaveOut);
  const notes = text(answers.notes);

  // Doppelte gearItemIds würden doppelte React-Keys erzeugen; der spätere
  // Eintrag gewinnt, er ist die letzte Aussage des Nutzers.
  const merged = new Map<string, TourItemReview>();
  const rawReviews = Array.isArray(raw.itemReviews) ? raw.itemReviews : [];
  for (const entry of rawReviews) {
    const review = normalizeItemReview(entry);
    if (review) merged.set(review.gearItemId, review);
  }

  return {
    id,
    packingListId,
    completedAt: toIsoDate(raw.completedAt),
    generalAnswers: {
      weightFeeling:
        feeling && WEIGHT_FEELINGS.has(feeling)
          ? (feeling as WeightFeeling)
          : "genau richtig",
      ...(whatWorked ? { whatWorked } : {}),
      ...(whatWasMissing ? { whatWasMissing } : {}),
      ...(whatToLeaveOut ? { whatToLeaveOut } : {}),
      ...(notes ? { notes } : {}),
    },
    itemReviews: [...merged.values()],
  };
}

/** Macht aus beliebigem geparstem JSON einen garantiert benutzbaren AppData-Stand. */
export function normalizeAppData(raw: unknown): AppData {
  if (!isRecord(raw)) return { ...defaultData };

  const gearItems = (Array.isArray(raw.gearItems) ? raw.gearItems : [])
    .map(normalizeGearItem)
    .filter((item): item is GearItem => item !== null);

  const packingLists = (Array.isArray(raw.packingLists) ? raw.packingLists : [])
    .map(normalizePackingList)
    .filter((list): list is PackingList => list !== null);

  const tourReviews = (Array.isArray(raw.tourReviews) ? raw.tourReviews : [])
    .map(normalizeTourReview)
    .filter((review): review is TourReview => review !== null);

  return {
    gearItems,
    packingLists,
    tourReviews,
    theme: raw.theme === "dark" ? "dark" : "light",
  };
}

/**
 * Ergebnis des Ladens. "unreadable" ist ausdrücklich kein leerer Start:
 * die Rohdaten liegen dann in Quarantäne und lassen sich wiederherstellen.
 */
export type LoadStatus = "ok" | "empty" | "unreadable";

export interface LoadResult {
  status: LoadStatus;
  data: AppData;
  /** Bei "unreadable": wann die Rohdaten weggelegt wurden. */
  quarantinedAt: string | null;
}

/** Legt unlesbare Rohdaten weg, ohne eine frühere Quarantäne zu überschreiben. */
function quarantine(raw: string): string | null {
  if (!canUseStorage()) return null;
  try {
    const existing = localStorage.getItem(QUARANTINE_KEY);
    if (existing) {
      // Schon etwas in Quarantäne: der ältere Stand ist der wertvollere,
      // er stammt aus der Zeit vor dem ersten Fehlversuch.
      const parsed = JSON.parse(existing) as { at?: string };
      return typeof parsed.at === "string" ? parsed.at : null;
    }
    const at = new Date().toISOString();
    localStorage.setItem(QUARANTINE_KEY, JSON.stringify({ at, raw }));
    return at;
  } catch {
    return null;
  }
}

export function loadData(): LoadResult {
  if (!canUseStorage()) {
    return { status: "empty", data: { ...defaultData }, quarantinedAt: null };
  }

  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { status: "empty", data: { ...defaultData }, quarantinedAt: null };
  }

  if (!raw) {
    return { status: "empty", data: { ...defaultData }, quarantinedAt: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Nicht lesbar: Rohdaten sichern, bevor irgendetwas darüber schreibt.
    return {
      status: "unreadable",
      data: { ...defaultData },
      quarantinedAt: quarantine(raw),
    };
  }

  const migrated = isRecord(parsed) ? migrate(parsed) : parsed;
  return { status: "ok", data: normalizeAppData(migrated), quarantinedAt: null };
}

/** Die weggelegten Rohdaten, damit die Oberfläche sie anbieten kann. */
export function readQuarantine(): { at: string; raw: string } | null {
  const stored = readJson<unknown>(QUARANTINE_KEY, null);
  if (!isRecord(stored)) return null;
  const at = toText(stored.at);
  const raw = typeof stored.raw === "string" ? stored.raw : null;
  return at && raw ? { at, raw } : null;
}

export function clearQuarantine(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(QUARANTINE_KEY);
  } catch {
    // Nicht kritisch – der Eintrag stört nur.
  }
}

/** Gibt zurück, ob geschrieben werden konnte. */
export function saveData(data: AppData): boolean {
  return writeJson(STORAGE_KEY, { schemaVersion: SCHEMA_VERSION, ...data });
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function upsertGearItem(items: GearItem[], item: GearItem): GearItem[] {
  const index = items.findIndex((g) => g.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

export function deleteGearItem(items: GearItem[], id: string): GearItem[] {
  return items.filter((g) => g.id !== id);
}

export function upsertPackingList(
  lists: PackingList[],
  list: PackingList,
): PackingList[] {
  const index = lists.findIndex((l) => l.id === list.id);
  if (index === -1) return [...lists, list];
  const next = [...lists];
  next[index] = list;
  return next;
}

export function deletePackingList(lists: PackingList[], id: string): PackingList[] {
  return lists.filter((l) => l.id !== id);
}

export function upsertTourReview(
  reviews: TourReview[],
  review: TourReview,
): TourReview[] {
  const index = reviews.findIndex((r) => r.id === review.id);
  if (index === -1) return [review, ...reviews];
  const next = [...reviews];
  next[index] = review;
  return next;
}

export function deleteTourReview(
  reviews: TourReview[],
  id: string,
): TourReview[] {
  return reviews.filter((r) => r.id !== id);
}

/**
 * Auswertungen einer gelöschten Packliste mitnehmen.
 *
 * Sie sind nur über die Liste erreichbar; blieben sie liegen, wüchse der
 * gespeicherte Stand mit Einträgen, die niemand mehr zu Gesicht bekommt.
 * Der Löschdialog sagt vorher, wie viele es sind.
 */
export function deleteReviewsOfList(
  reviews: TourReview[],
  packingListId: string,
): TourReview[] {
  return reviews.filter((r) => r.packingListId !== packingListId);
}

export function setTheme(data: AppData, theme: ThemeMode): AppData {
  return { ...data, theme };
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importJson(raw: string): AppData {
  const parsed: unknown = JSON.parse(raw);
  return normalizeAppData(isRecord(parsed) ? migrate(parsed) : parsed);
}

export function resetData(): AppData {
  return { ...defaultData };
}
