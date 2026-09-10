"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, FileDown, Pencil } from "lucide-react";
import { TopoPattern } from "@/components/ui/TopoPattern";
import { ProgressBar } from "@/components/lists/ProgressBar";

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

  function submitRename(e: FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onRename(trimmed);
    setRenaming(false);
  }

  return (
    <header className="relative isolate overflow-hidden rounded-card bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 p-5 text-forest-50 shadow-soft dark:from-forest-900 dark:via-forest-800 dark:to-forest-950">
      {/* Höhenlinien: helles Waldgrün auf dunklem Grün – Kontrast ohne Textablenkung */}
      <TopoPattern className="text-forest-200" opacity={0.13} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg text-sm text-forest-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Listen
          </button>

          {renaming ? (
            <form onSubmit={submitRename} className="mt-2 flex flex-wrap gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="min-w-0 flex-1 rounded-xl border border-forest-500/60 bg-forest-950/50 px-3 py-1.5 text-lg font-bold text-white placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-ember-400"
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
              <Pencil className="h-4 w-4 shrink-0 text-forest-300 opacity-0 transition group-hover:opacity-100" />
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
