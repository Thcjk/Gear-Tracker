"use client";

import { useRef } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { exportJson, importJson } from "@/lib/storage";
import { useAppStore } from "@/lib/store";

export default function SettingsPage() {
  const { ready, data, replaceData, clearAll } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([exportJson(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ultralight-gear-tracker-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const text = await file.text();
      const next = importJson(text);
      replaceData(next);
      alert("Daten importiert.");
    } catch {
      alert("Import fehlgeschlagen. Ungültige JSON-Datei.");
    }
  }

  if (!ready) {
    return <p className="text-sm text-earth-500">Lade Einstellungen…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-forest-900 dark:text-forest-50">
          Einstellungen
        </h2>
        <p className="text-sm text-earth-600 dark:text-earth-300">
          Design und lokale Datenverwaltung
        </p>
      </div>

      <SurfaceCard as="section" className="p-4">
        <h3 className="mb-3 font-semibold text-forest-900 dark:text-forest-50">
          Design-Modus
        </h3>
        <ThemeToggle />
      </SurfaceCard>

      <SurfaceCard as="section" className="p-4">
        <h3 className="mb-3 font-semibold text-forest-900 dark:text-forest-50">
          Daten
        </h3>
        <p className="mb-4 text-sm text-earth-600 dark:text-earth-300">
          Alles wird nur lokal im Browser gespeichert (LocalStorage). Kein
          Backend, kein Konto.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            JSON exportieren
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest-100 px-4 py-2 text-sm font-medium text-forest-800 dark:bg-forest-800 dark:text-forest-100"
          >
            <Upload className="h-4 w-4" />
            JSON importieren
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Wirklich alle Gear-Items und Packlisten löschen? Das kann nicht rückgängig gemacht werden.",
                )
              ) {
                clearAll();
              }
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Alles zurücksetzen
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
            e.target.value = "";
          }}
        />
      </SurfaceCard>

      <SurfaceCard as="section" className="p-4 text-sm text-earth-600 dark:text-earth-300">
        <p>
          <strong className="text-forest-900 dark:text-forest-50">
            Ultralight Gear-Tracker
          </strong>{" "}
          · {data.gearItems.length} Items · {data.packingLists.length} Listen
        </p>
      </SurfaceCard>
    </div>
  );
}
