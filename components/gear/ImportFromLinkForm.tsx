"use client";

import { useState, type FormEvent } from "react";
import { Link2, Loader2 } from "lucide-react";
import type { ProductImportSuggestion } from "@/types";

export function ImportFromLinkForm({
  onImported,
}: {
  onImported: (suggestion: ProductImportSuggestion) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/import-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json()) as ProductImportSuggestion;
      onImported({ ...data, sourceUrl: trimmed });
      setMessage(
        data.found
          ? "Vorschlag geladen – bitte prüfen und speichern."
          : "Keine Produktdaten gefunden. Formular manuell ausfüllen.",
      );
      setUrl("");
    } catch {
      onImported({ found: false, sourceUrl: trimmed });
      setMessage("Import fehlgeschlagen. Formular manuell ausfüllen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-dashed border-forest-300 bg-forest-50/70 p-4 dark:border-forest-700 dark:bg-forest-900/50"
    >
      <label className="grid gap-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-forest-800 dark:text-forest-100">
          <Link2 className="h-4 w-4" />
          Produkt per Link importieren
        </span>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-forest-200 bg-white px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-forest-600"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Import
          </button>
        </div>
      </label>
      {message && (
        <p className="mt-2 text-sm text-earth-600 dark:text-earth-300">
          {message}
        </p>
      )}
    </form>
  );
}
