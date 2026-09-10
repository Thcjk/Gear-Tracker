"use client";

const HISTORY_KEY = "ultralight-gear-tracker-weight-history-v1";
const MAX_ENTRIES = 20;

export interface WeightSnapshot {
  listId: string;
  name: string;
  weightGrams: number;
  /** ISO-Zeitstempel der letzten Aufzeichnung */
  at: string;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadWeightHistory(): WeightSnapshot[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is WeightSnapshot =>
        !!entry &&
        typeof entry === "object" &&
        typeof (entry as WeightSnapshot).listId === "string" &&
        typeof (entry as WeightSnapshot).weightGrams === "number",
    );
  } catch {
    return [];
  }
}

/** Schreibt den aktuellen Stand einer Liste in die Historie (pro Liste ein Eintrag). */
export function recordListWeight(
  listId: string,
  name: string,
  weightGrams: number,
): void {
  if (!canUseStorage()) return;
  const history = loadWeightHistory().filter((e) => e.listId !== listId);
  history.push({ listId, name, weightGrams, at: new Date().toISOString() });
  history.sort((a, b) => b.at.localeCompare(a.at));
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history.slice(0, MAX_ENTRIES)),
    );
  } catch {
    // Speicher voll oder gesperrt – Badges sind optional, kein harter Fehler
  }
}

/** Zuletzt aufgezeichnete *andere* Packliste als Vergleichsbasis. */
export function getPreviousReference(
  currentListId: string,
): WeightSnapshot | null {
  const others = loadWeightHistory().filter(
    (e) => e.listId !== currentListId && e.weightGrams > 0,
  );
  if (others.length === 0) return null;
  return others.reduce((newest, entry) =>
    entry.at.localeCompare(newest.at) > 0 ? entry : newest,
  );
}
