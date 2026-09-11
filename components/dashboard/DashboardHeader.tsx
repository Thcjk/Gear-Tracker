"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { ArrowLeft, FileDown, Pencil } from "lucide-react";
import { Compass } from "@/components/doodle/Doodles";
import { WanderingTurtle } from "@/components/mascot/WanderingTurtle";
import { WANDER_CYCLE } from "@/lib/wander";
import { ProgressBar } from "@/components/lists/ProgressBar";
import { getSeasonalTheme } from "@/lib/seasons";

export function DashboardHeader({
  name,
  packed,
  total,
  onBack,
  onRename,
  onExportPdf,
}: {
  name: string;
  packed: number;
  total: number;
  onBack: () => void;
  onRename: (name: string) => void;
  onExportPdf: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(name);
  // Das Banner rendert erst nach dem Laden aus dem LocalStorage, also rein
  // client-seitig – das Datum kann hier keine Hydration-Differenz auslösen.
  const [theme] = useState(() => getSeasonalTheme());

  function submitRename(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onRename(trimmed);
    setRenaming(false);
  }

  return (
    <header
      data-season={theme.season}
      style={theme.vars as CSSProperties}
      className="relative isolate overflow-hidden rounded-card bg-paper-200 p-5 shadow-neu dark:bg-paper-900"
    >
      {/* Die Jahreszeit tönt die Fläche nur noch, statt sie auszufüllen:
          grosse Akzentflächen widersprechen der neuen Bildsprache. Season
          und Höhenlinien bleiben erkennbar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--season-from),var(--season-via)_55%,var(--season-to))] opacity-[0.14] transition-opacity duration-500"
      />
      {/* Kompass als Deko in der Ecke – zurückhaltend genug, dass er dem
          Titel und dem Fortschritt nicht in den Weg kommt. */}
      <Compass className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 text-[color:var(--season-via)] opacity-25" />

      {/* Läuft am unteren Rand des Kopfs entlang, wie auf einer Kante */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 block">
        <WanderingTurtle cycle={WANDER_CYCLE} delay={5} size={20} />
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="-ml-2 inline-flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-paper-700 transition-colors hover:text-accent dark:text-paper-300 dark:hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Listen
            </button>
            <span className="handwritten rounded-full bg-paper-200 px-3 py-0.5 text-base font-bold text-[color:var(--season-from)] shadow-neu-sm dark:bg-paper-950 dark:text-[color:var(--season-accent)]">
              {theme.label}
            </span>
          </div>

          {renaming ? (
            <form onSubmit={submitRename} className="mt-2 flex flex-wrap gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="neu-field min-w-0 flex-1 text-lg font-bold"
              />
              <button
                type="submit"
                className="rounded-control bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-neu-accent transition-all duration-150 active:translate-y-px active:opacity-90"
              >
                OK
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(name);
                setRenaming(true);
              }}
              className="group -mx-1 mt-0.5 flex min-h-[2.75rem] items-center gap-2 rounded-lg px-1 text-left"
              title="Name bearbeiten"
            >
              <h2 className="truncate text-2xl font-extrabold tracking-tight text-paper-800 dark:text-paper-100">
                {name}
              </h2>
              <Pencil className="h-4 w-4 shrink-0 text-paper-700 opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          className="relative inline-flex shrink-0 items-center gap-2 rounded-control bg-paper-200 px-4 py-2.5 text-sm font-semibold text-paper-800 shadow-neu-sm transition-all duration-150 active:translate-y-px active:shadow-neu-in-sm dark:bg-paper-900 dark:text-paper-100"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </button>
      </div>

      <div className="relative mt-5">
        <ProgressBar packed={packed} total={total} />
      </div>
    </header>
  );
}
