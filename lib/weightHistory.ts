"use client";

import { readJson, writeJson } from "@/lib/storage";

const HISTORY_KEY = "ultralight-gear-tracker-weight-history-v1";
const MAX_ENTRIES = 20;

export interface WeightSnapshot {
  listId: string;
  name: string;
  weightGrams: number;
  /** ISO-Zeitstempel der letzten Aufzeichnung */
  at: string;
}

export function loadWeightHistory(): WeightSnapshot[] {
  const parsed = readJson<unknown>(HISTORY_KEY, null);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (entry): entry is WeightSnapshot =>
      !!entry &&
      typeof entry === "object" &&
      typeof (entry as WeightSnapshot).listId === "string" &&
      typeof (entry as WeightSnapshot).weightGrams === "number" &&
      Number.isFinite((entry as WeightSnapshot).weightGrams),
  );
}

/** Schreibt den aktuellen Stand einer Liste in die Historie (pro Liste ein Eintrag). */
export function recordListWeight(
  listId: string,
  name: string,
  weightGrams: number,
): void {
  const all = loadWeightHistory();

  // Unveränderter Stand: nicht neu schreiben. Sonst würde jeder Aufruf des
  // Dashboards die komplette Historie neu serialisieren.
  const existing = all.find((e) => e.listId === listId);
  if (existing && existing.weightGrams === weightGrams && existing.name === name) {
    return;
  }

  const history = all.filter((e) => e.listId !== listId);
  history.push({ listId, name, weightGrams, at: new Date().toISOString() });
  history.sort((a, b) => b.at.localeCompare(a.at));
  // Badges sind optional: schlägt das Schreiben fehl, ist das kein Fehlerfall
  writeJson(HISTORY_KEY, history.slice(0, MAX_ENTRIES));
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
