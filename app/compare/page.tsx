"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Download, FileUp, X } from "lucide-react";
import type { SharedPackingList } from "@/types";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { Button, IconButton } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import { BootsSketch } from "@/components/sketch/BootsSketch";
import { entryFromPackingList, entryFromShared } from "@/lib/calculations";
import { parseSharedList } from "@/lib/shareFormat";
import { useAppStore } from "@/lib/store";

interface ImportedList {
  key: string;
  shared: SharedPackingList;
}

export default function ComparePage() {
  const { ready, data } = useAppStore();
  const [selected, setSelected] = useState<string[]>([]);
  /**
   * Importierte Listen leben nur hier im State: sie landen bewusst weder
   * im LocalStorage noch in der Listenübersicht und sind nach einem Reload
   * wieder weg.
   */
  const [imported, setImported] = useState<ImportedList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const entries = useMemo(
    () => [
      ...data.packingLists
        .filter((list) => selected.includes(list.id))
        .map((list) => entryFromPackingList(list, data.gearItems)),
      ...imported.map((entry) => entryFromShared(entry.shared, entry.key)),
    ],
    [data.packingLists, data.gearItems, selected, imported],
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleFile(file: File) {
    setError(null);
    const shared = parseSharedList(await file.text());

    if (!shared) {
      setError(
        "Diese Datei konnte nicht gelesen werden — ist es ein gültiger Gear-Tracker-Export?",
      );
      return;
    }

    setImported((prev) => [
      ...prev,
      { key: `import-${Date.now()}-${prev.length}`, shared },
    ]);
  }

  if (!ready) {
    return (
      <p className="text-sm text-clay-700 dark:text-clay-400">
        Lade Vergleich…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Vergleich"
        subtitle="Eigene Listen wählen oder eine Datei von jemand anderem laden."
      />

      {data.packingLists.length === 0 ? (
        <EmptyState illustration={<BootsSketch />}>
          Noch keine eigenen Packlisten zum Vergleichen.
        </EmptyState>
      ) : (
        <SurfaceCard className="space-y-2 p-4">
          {data.packingLists.map((list) => (
            <label
              key={list.id}
              className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 transition-shadow active:shadow-neu-in-sm"
            >
              <span className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(list.id)}
                  onChange={() => toggle(list.id)}
                  className="h-5 w-5 cursor-pointer appearance-none rounded-md bg-clay-200 shadow-neu-sm transition-all checked:bg-accent checked:shadow-neu-in-sm dark:bg-clay-800"
                />
                <Check
                  className={`pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-on-accent transition-opacity ${
                    selected.includes(list.id) ? "opacity-100" : "opacity-0"
                  }`}
                  strokeWidth={3}
                  aria-hidden
                />
              </span>
              <span className="font-semibold text-clay-900 dark:text-clay-50">
                {list.name}
              </span>
            </label>
          ))}
        </SurfaceCard>
      )}

      <SurfaceCard className="p-4">
        <h2 className="font-bold text-clay-900 dark:text-clay-50">
          Liste von jemand anderem
        </h2>
        <p className="mt-1 text-sm text-clay-700 dark:text-clay-400">
          Exportdatei laden. Sie wird nur für diesen Vergleich gehalten und
          nicht gespeichert.
        </p>

        <ul className="mt-3 space-y-2 empty:hidden">
          {imported.map(({ key, shared }) => (
            <li
              key={key}
              className="flex items-center gap-3 rounded-control px-3 py-2.5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-clay-200 text-accent shadow-neu-sm dark:bg-clay-800">
                <Download className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-clay-900 dark:text-clay-50">
                  {shared.ownerName} — {shared.listName}
                </p>
                <p className="text-xs text-clay-700 dark:text-clay-400">
                  {shared.items.length}{" "}
                  {shared.items.length === 1 ? "Eintrag" : "Einträge"}
                </p>
              </div>
              <IconButton
                variant="quiet"
                onClick={() =>
                  setImported((prev) => prev.filter((e) => e.key !== key))
                }
                aria-label={`${shared.listName} entfernen`}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
        </ul>

        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-control px-3 py-2.5 text-sm text-red-700 shadow-neu-in-sm dark:text-red-300"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <Button
          onClick={() => fileRef.current?.click()}
          className="mt-3 w-full"
        >
          <FileUp className="h-4 w-4" />
          Datei importieren
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </SurfaceCard>

      <ComparisonTable entries={entries} />
    </div>
  );
}
