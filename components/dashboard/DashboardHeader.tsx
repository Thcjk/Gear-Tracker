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
      className="relative isolate overflow-hidden rounded-card bg-[linear-gradient(135deg,var(--season-from),var(--season-via)_55%,var(--season-to))] p-5 text-white shadow-soft transition-colors duration-500"
    >
      {/* Höhenlinien im Saison-Aufhellton – Kontrast ohne Ablenkung vom Text */}
      <TopoPattern
        className="text-[color:var(--season-topo)]"
        opacity={0.13}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-lg text-sm text-white/75 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Listen
            </button>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--season-topo)]">
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
                className="min-w-0 flex-1 rounded-xl border border-white/30 bg-black/25 px-3 py-1.5 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-[color:var(--season-accent)]"
              />
              <button
                type="submit"
                className="rounded-xl bg-ember-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-ember-600"
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
              <h2 className="truncate text-2xl font-extrabold tracking-tight text-white">
                {name}
              </h2>
              <Pencil className="h-4 w-4 shrink-0 text-white/70 opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onExportPdf}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 backdrop-blur-sm transition hover:bg-white/20"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </button>
      </div>

      <div className="relative mt-5">
        <ProgressBar packed={packed} total={total} tone="onDark" />
      </div>
    </header>
  );
}
