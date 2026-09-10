"use client";

import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAppStore } from "@/lib/store";

/**
 * Zwei Lagen, in denen der Nutzer nicht im Unklaren bleiben darf:
 *
 * - LocalStorage lässt sich nicht beschreiben (privater Modus, voller
 *   Speicher). Ohne Hinweis wirkt alles normal, bis der nächste Reload
 *   sämtliche Änderungen verschluckt.
 * - Der gespeicherte Stand war nicht lesbar. Die App startet dann leer –
 *   das sieht aus wie Datenverlust und ist auch einer, wenn niemand sagt,
 *   dass die Rohdaten gesichert wurden und wiederhergestellt werden können.
 */
export function StorageWarning() {
  const { ready, storageBlocked, loadFailedAt, dismissLoadFailure } =
    useAppStore();

  if (!ready) return null;

  if (loadFailedAt) {
    return (
      <SurfaceCard className="mb-4 flex items-start gap-3 p-4" role="alert">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-accent"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-clay-700 dark:text-clay-300">
            <strong className="font-bold text-clay-900 dark:text-clay-50">
              Deine Daten konnten nicht gelesen werden.
            </strong>{" "}
            Der gespeicherte Stand ist beschädigt. Er wurde unverändert
            gesichert und nicht überschrieben – unter{" "}
            <Link
              href="/settings"
              className="font-semibold text-accent underline"
            >
              Einstellungen → Daten &amp; Backup
            </Link>{" "}
            kannst du ihn herunterladen oder ein automatisches Backup
            wiederherstellen.
          </p>
        </div>
        <IconButton
          variant="quiet"
          onClick={dismissLoadFailure}
          aria-label="Hinweis ausblenden"
        >
          <X className="h-5 w-5" />
        </IconButton>
      </SurfaceCard>
    );
  }

  if (!storageBlocked) return null;

  return (
    <SurfaceCard className="mb-4 flex items-start gap-3 p-4" role="status">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
        aria-hidden
      />
      <p className="text-sm text-clay-700 dark:text-clay-300">
        <strong className="font-bold text-clay-900 dark:text-clay-50">
          Daten können nicht gespeichert werden.
        </strong>{" "}
        Im privaten Modus oder bei vollem Speicher bleiben Änderungen nur bis
        zum Neuladen der Seite erhalten.
      </p>
    </SurfaceCard>
  );
}
