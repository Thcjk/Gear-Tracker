"use client";

import { useEffect, useState } from "react";
import { Clock, Download, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { backupToAppData, loadBackups, type BackupEntry } from "@/lib/backups";
import { clearQuarantine, readQuarantine } from "@/lib/storage";
import { useAppStore } from "@/lib/store";

function formatMoment(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  // Kurzes Datum: "10.09.2026, 14:09" bricht auf schmalen Geräten um.
  return new Intl.DateTimeFormat("de-CH", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function download(name: string, content: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Automatische Sicherungen und der beschädigte Stand aus der Quarantäne.
 *
 * Beides wird erst nach dem Mounten gelesen: auf dem Server gibt es keinen
 * LocalStorage, und ein Unterschied zwischen vorgerendertem und
 * hydratisiertem Markup wäre die Folge.
 */
export function BackupSection() {
  const { ready, replaceData } = useAppStore();
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [quarantined, setQuarantined] = useState<{
    at: string;
    raw: string;
  } | null>(null);
  const [restored, setRestored] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    setBackups(loadBackups());
    setQuarantined(readQuarantine());
  }, [ready]);

  function restore(entry: BackupEntry) {
    const stamp = formatMoment(entry.at);
    const confirmed = window.confirm(
      `Aktuelle Daten werden durch das Backup vom ${stamp} ersetzt — fortfahren?`,
    );
    if (!confirmed) return;
    replaceData(backupToAppData(entry));
    setRestored(stamp);
    setBackups(loadBackups());
  }

  if (!ready) return null;

  return (
    <SurfaceCard as="section" className="p-4">
      <h3 className="mb-1 font-bold text-clay-900 dark:text-clay-50">
        Automatische Backups
      </h3>
      <p className="mb-4 text-sm text-clay-700 dark:text-clay-400">
        Bei jeder Änderung wird eine Sicherung abgelegt. Die letzten drei
        Stände bleiben erhalten.
      </p>

      {quarantined && (
        <div className="mb-4 flex items-start gap-3 rounded-control px-3 py-3 shadow-neu-in-sm">
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-ember-700 dark:text-ember-400"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-clay-700 dark:text-clay-300">
              <strong className="font-bold text-clay-900 dark:text-clay-50">
                Beschädigter Stand gesichert
              </strong>{" "}
              vom {formatMoment(quarantined.at)}. Er wurde nicht überschrieben
              und lässt sich herunterladen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  download(
                    `gear-tracker-beschaedigt-${quarantined.at.slice(0, 10)}.json`,
                    quarantined.raw,
                  )
                }
                className="px-3 py-2 text-[0.8125rem]"
              >
                <Download className="h-4 w-4" />
                Herunterladen
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Gesicherten beschädigten Stand endgültig verwerfen?",
                    )
                  ) {
                    return;
                  }
                  clearQuarantine();
                  setQuarantined(null);
                }}
                className="px-3 py-2 text-[0.8125rem]"
              >
                Verwerfen
              </Button>
            </div>
          </div>
        </div>
      )}

      {restored && (
        <p
          role="status"
          className="mb-4 rounded-control px-3 py-2.5 text-sm text-clay-700 shadow-neu-in-sm dark:text-clay-300"
        >
          Backup vom {restored} wurde eingespielt.
        </p>
      )}

      {backups.length === 0 ? (
        <p className="text-sm text-clay-700 dark:text-clay-400">
          Noch keine Sicherung vorhanden. Sobald du etwas änderst, entsteht die
          erste.
        </p>
      ) : (
        <ul className="space-y-2">
          {backups.map((entry) => (
            <li
              key={entry.at}
              className="flex flex-wrap items-center gap-3 rounded-control px-3 py-2.5 shadow-neu-in-sm"
            >
              <Clock
                className="h-4 w-4 shrink-0 text-clay-700 dark:text-clay-400"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-clay-900 dark:text-clay-50">
                  {formatMoment(entry.at)}
                </p>
                <p className="text-xs text-clay-700 dark:text-clay-400">
                  {entry.gearItemCount}{" "}
                  {entry.gearItemCount === 1 ? "Item" : "Items"} ·{" "}
                  {entry.packingListCount}{" "}
                  {entry.packingListCount === 1 ? "Liste" : "Listen"}
                </p>
              </div>
              <Button
                onClick={() => restore(entry)}
                className="px-3 py-2 text-[0.8125rem]"
              >
                <RotateCcw className="h-4 w-4" />
                Wiederherstellen
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SurfaceCard>
  );
}
