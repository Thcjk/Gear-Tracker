"use client";

import { AlertTriangle } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAppStore } from "@/lib/store";

/**
 * Hinweis, wenn LocalStorage nicht beschrieben werden kann – etwa im
 * privaten Modus von Safari oder bei vollem Kontingent. Ohne diesen
 * Hinweis wirkt es so, als würde alles funktionieren, bis der nächste
 * Reload sämtliche Änderungen verschluckt.
 */
export function StorageWarning() {
  const { ready, storageBlocked } = useAppStore();
  if (!ready || !storageBlocked) return null;

  return (
    <SurfaceCard
      className="mb-4 flex items-start gap-3 p-4"
      role="status"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-ember-800 dark:text-ember-400"
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
