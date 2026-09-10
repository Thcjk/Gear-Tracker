import type {
  AppData,
  Category,
  GearItem,
  PackingList,
  PackingListItem,
  ThemeMode,
} from "@/types";
import {
  CATEGORIES,
  COMFORT_TEMP_MAX,
  COMFORT_TEMP_MIN,
  hasComfortTemp,
} from "@/lib/categories";

/** Einziger Ort, an dem der Schlüssel definiert wird (auch vom Anti-Flash-Skript genutzt). */
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
  theme: "light",
};

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

/** Macht aus beliebigem geparstem JSON einen garantiert benutzbaren AppData-Stand. */
export function normalizeAppData(raw: unknown): AppData {
  if (!isRecord(raw)) return { ...defaultData };

  const gearItems = (Array.isArray(raw.gearItems) ? raw.gearItems : [])
    .map(normalizeGearItem)
    .filter((item): item is GearItem => item !== null);

  const packingLists = (Array.isArray(raw.packingLists) ? raw.packingLists : [])
    .map(normalizePackingList)
    .filter((list): list is PackingList => list !== null);

  return {
    gearItems,
    packingLists,
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

  return { status: "ok", data: normalizeAppData(parsed), quarantinedAt: null };
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
  return writeJson(STORAGE_KEY, data);
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

export function setTheme(data: AppData, theme: ThemeMode): AppData {
  return { ...data, theme };
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importJson(raw: string): AppData {
  return normalizeAppData(JSON.parse(raw));
}

export function resetData(): AppData {
  return { ...defaultData };
}
