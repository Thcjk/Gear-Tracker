"use client";

import { Download } from "lucide-react";
import type { ComparisonEntry } from "@/types";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import { buildComparison, comparisonCategoryMatrix } from "@/lib/calculations";
import { formatPrice, formatWeight } from "@/lib/categories";

/** Kopfzelle einer Liste: bei Importen Name der Person über dem Listennamen. */
function EntryTitle({ entry }: { entry: ComparisonEntry }) {
  return (
    <div className="min-w-0">
      {entry.imported && entry.owner && (
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-clay-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent shadow-neu-sm dark:bg-clay-800">
          <Download className="h-3 w-3" aria-hidden />
          importiert
        </span>
      )}
      <p className="font-bold text-clay-900 dark:text-clay-50">
        {entry.imported && entry.owner ? `${entry.owner} — ` : ""}
        {entry.title}
      </p>
    </div>
  );
}

export function ComparisonTable({ entries }: { entries: ComparisonEntry[] }) {
  if (entries.length < 2) {
    return (
      <EmptyState>
        Wähle mindestens zwei Packlisten zum Vergleichen – eigene oder eine
        importierte Datei.
      </EmptyState>
    );
  }

  const rows = buildComparison(entries);
  const categoryRows = comparisonCategoryMatrix(entries);

  return (
    <div className="space-y-4">
      <SurfaceCard className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-clay-300 dark:border-clay-600">
            <tr className="text-xs uppercase tracking-wider text-clay-700 dark:text-clay-400">
              <th className="px-4 py-3 font-medium">Liste</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Gewicht</th>
              <th className="px-4 py-3 font-medium">Δ Gewicht</th>
              <th className="px-4 py-3 font-medium">Wert</th>
              <th className="px-4 py-3 font-medium">Δ Wert</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.entry.key}
                className="border-b border-clay-300/60 last:border-0 dark:border-clay-600"
              >
                <td className="px-4 py-3.5">
                  <EntryTitle entry={row.entry} />
                </td>
                <td className="px-4 py-3.5 text-clay-700 dark:text-clay-300">
                  {row.itemCount}
                </td>
                <td className="px-4 py-3.5 font-semibold text-ocean-800 dark:text-ocean-300">
                  {formatWeight(row.weightGrams)}
                </td>
                <td className="px-4 py-3.5 text-clay-700 dark:text-clay-400">
                  {row.isLightest
                    ? "leichteste"
                    : `+${formatWeight(row.weightDiff)}`}
                </td>
                <td className="px-4 py-3.5 text-ocean-800 dark:text-ocean-300">
                  {formatPrice(row.price)}
                </td>
                <td className="px-4 py-3.5 text-clay-700 dark:text-clay-400">
                  {row.isCheapest ? "günstigste" : `+${formatPrice(row.priceDiff)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SurfaceCard>

      {categoryRows.length > 0 && (
        <SurfaceCard className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-clay-300 dark:border-clay-600">
              <tr className="text-xs uppercase tracking-wider text-clay-700 dark:text-clay-400">
                <th className="px-4 py-3 font-medium">Kategorie</th>
                {rows.map((row) => (
                  <th
                    key={row.entry.key}
                    className="whitespace-nowrap px-4 py-3 font-medium"
                  >
                    {row.entry.imported && row.entry.owner
                      ? row.entry.owner
                      : row.entry.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryRows.map((row) => {
                const min = Math.min(...row.weights.filter((w) => w > 0));
                return (
                  <tr
                    key={row.category}
                    className="border-b border-clay-300/60 last:border-0 dark:border-clay-600"
                  >
                    <td className="px-4 py-3 font-semibold text-clay-900 dark:text-clay-50">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        {row.label}
                      </span>
                    </td>
                    {row.weights.map((weight, index) => (
                      <td
                        key={rows[index].entry.key}
                        className={`whitespace-nowrap px-4 py-3 tabular-nums ${
                          weight > 0 && weight === min
                            ? "font-bold text-ocean-800 dark:text-ocean-300"
                            : "text-clay-700 dark:text-clay-300"
                        }`}
                      >
                        {weight > 0 ? formatWeight(weight) : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </SurfaceCard>
      )}
    </div>
  );
}
