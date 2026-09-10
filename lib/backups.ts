"use client";

import type { AppData } from "@/types";
import {
  SCHEMA_VERSION,
  normalizeAppData,
  readJson,
  writeJson,
} from "@/lib/storage";

const BACKUP_KEY = "ultralight-gear-tracker-backups-v1";

/** Mehr Stände bringen wenig und kosten Speicher, den die App selbst braucht. */
export const MAX_BACKUPS = 3;

/**
 * Abstand, ab dem ein Schreibvorgang einen neuen Stand aufmacht statt den
 * jüngsten fortzuschreiben.
 *
 * Ohne das wären nach drei Tastendrücken beim Umbenennen alle drei Plätze
 * mit Ständen aus derselben Minute belegt – als Sicherheitsnetz wertlos.
 * So gibt es nach jedem Schreibvorgang eine aktuelle Sicherung, und die
 * drei Plätze decken trotzdem einen Zeitraum ab.
 */
const NEW_SLOT_AFTER_MS = 5 * 60 * 1000;

export interface BackupEntry {
  at: string;
  schemaVersion: number;
  gearItemCount: number;
  packingListCount: number;
  data: AppData;
}

function isEntry(value: unknown): value is BackupEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<BackupEntry>;
  return typeof entry.at === "string" && typeof entry.data === "object";
}

/** Jüngster Stand zuerst. */
export function loadBackups(): BackupEntry[] {
  const raw = readJson<unknown>(BACKUP_KEY, null);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isEntry)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, MAX_BACKUPS);
}

/**
 * Legt eine Sicherung des gerade geschriebenen Stands ab.
 *
 * Läuft absichtlich nach dem eigentlichen Schreibvorgang und schluckt
 * eigene Fehler: eine fehlgeschlagene Sicherung darf die Änderung selbst
 * nicht gefährden. Voller Speicher ist der wahrscheinlichste Fall – dann
 * fliegt der älteste Stand raus und es wird erneut versucht.
 */
export function recordBackup(data: AppData): void {
  const entry: BackupEntry = {
    at: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    gearItemCount: data.gearItems.length,
    packingListCount: data.packingLists.length,
    data,
  };

  const existing = loadBackups();
  const newest = existing[0];
  const startNewSlot =
    !newest || Date.now() - Date.parse(newest.at) > NEW_SLOT_AFTER_MS;

  const next = startNewSlot
    ? [entry, ...existing].slice(0, MAX_BACKUPS)
    : [entry, ...existing.slice(1)];

  if (writeJson(BACKUP_KEY, next)) return;

  // Zweiter Versuch mit weniger Ständen, falls der Speicher knapp ist.
  for (let keep = next.length - 1; keep >= 1; keep--) {
    if (writeJson(BACKUP_KEY, next.slice(0, keep))) return;
  }
}

/** Stellt einen gesicherten Stand als normale App-Daten bereit. */
export function backupToAppData(entry: BackupEntry): AppData {
  return normalizeAppData({ schemaVersion: entry.schemaVersion, ...entry.data });
}

export function clearBackups(): void {
  writeJson(BACKUP_KEY, []);
}
