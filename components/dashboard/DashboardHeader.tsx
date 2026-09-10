"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { ArrowLeft, FileDown, Pencil } from "lucide-react";
import { TopoPattern } from "@/components/ui/TopoPattern";
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
      className="relative isolate overflow-hidden rounded-card bg-clay-200 p-5 shadow-neu dark:bg-clay-800"
    >
      {/* Die Jahreszeit tönt die Fläche nur noch, statt sie auszufüllen:
          grosse Akzentflächen widersprechen der neuen Bildsprache. Season
          und Höhenlinien bleiben erkennbar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,var(--season-from),var(--season-via)_55%,var(--season-to))] opacity-[0.14] transition-opacity duration-500"
      />
      <TopoPattern
        className="text-[color:var(--season-via)]"
        opacity={0.16}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-lg text-sm font-medium text-clay-700 transition-colors hover:text-clay-900 dark:text-clay-400 dark:hover:text-clay-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Listen
            </button>
            <span className="rounded-full bg-clay-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--season-from)] shadow-neu-sm dark:bg-clay-800 dark:text-[color:var(--season-accent)]">
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
              className="group mt-1 flex items-center gap-2 text-left"
              title="Name bearbeiten"
            >
              <h2 className="truncate text-2xl font-extrabold tracking-tight text-clay-900 dark:text-clay-50">
                {name}
              </h2>
              <Pencil className="h-4 w-4 shrink-0 text-clay-700 opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          className="relative inline-flex shrink-0 items-center gap-2 rounded-control bg-clay-200 px-4 py-2.5 text-sm font-semibold text-clay-800 shadow-neu-sm transition-all duration-150 active:translate-y-px active:shadow-neu-in-sm dark:bg-clay-800 dark:text-clay-100"
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
