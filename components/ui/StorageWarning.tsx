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
      <SurfaceCard
        tone="postit"
        torn
        className="mb-4 flex items-start gap-3 p-4 pb-6"
        role="alert"
      >
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-accent"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-paper-700 dark:text-paper-300">
            <strong className="font-bold text-paper-800 dark:text-paper-100">
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
    <SurfaceCard
      tone="postit"
      torn
      className="mb-4 flex items-start gap-3 p-4 pb-6"
      role="status"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
        aria-hidden
      />
      <p className="text-sm text-paper-700 dark:text-paper-300">
        <strong className="font-bold text-paper-800 dark:text-paper-100">
          Daten können nicht gespeichert werden.
        </strong>{" "}
        Im privaten Modus oder bei vollem Speicher bleiben Änderungen nur bis
        zum Neuladen der Seite erhalten.
      </p>
    </SurfaceCard>
  );
}
