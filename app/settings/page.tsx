"use client";

import { useRef } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { BackupSection } from "@/components/settings/BackupSection";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { exportJson, importJson } from "@/lib/storage";
import { useAppStore } from "@/lib/store";
import { downloadText } from "@/lib/download";

export default function SettingsPage() {
  const { ready, data, replaceData, clearAll } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    downloadText("gear-tracker-backup.json", exportJson(data));
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
    return <p className="text-sm text-paper-700 dark:text-paper-400">Lade Einstellungen…</p>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Einstellungen"
        subtitle="Design und lokale Datenverwaltung"
      />

      <SurfaceCard as="section" className="p-4">
        <h3 className="mb-4 font-bold text-paper-800 dark:text-paper-100">
          Design-Modus
        </h3>
        <ThemeToggle />
      </SurfaceCard>

      <SurfaceCard as="section" className="p-4">
        <h3 className="mb-4 font-bold text-paper-800 dark:text-paper-100">
          Daten &amp; Backup
        </h3>
        <p className="mb-4 text-sm text-paper-700 dark:text-paper-400">
          Alles wird nur lokal im Browser gespeichert (LocalStorage). Kein
          Backend, kein Konto.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="cool" onClick={handleExport}>
            <Download className="h-4 w-4" />
            JSON exportieren
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" />
            JSON importieren
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  "Wirklich alle Gear-Items und Packlisten löschen? Das kann nicht rückgängig gemacht werden.",
                )
              ) {
                clearAll();
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Alles zurücksetzen
          </Button>
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

      <BackupSection />

      <SurfaceCard as="section" className="p-4 text-sm text-paper-700 dark:text-paper-400">
        <p>
          <strong className="text-paper-800 dark:text-paper-100">
            Gear-Tracker
          </strong>{" "}
          · {data.gearItems.length} Items · {data.packingLists.length} Listen
        </p>
      </SurfaceCard>
    </div>
  );
}
