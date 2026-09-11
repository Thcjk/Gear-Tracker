"use client";

import { Download } from "lucide-react";
import type { ComparisonEntry } from "@/types";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import { TurtleMascot, getTurtleVariant } from "@/components/mascot/TurtleMascot";
import { DoodleArrow } from "@/components/doodle/Doodles";

import { buildComparison, comparisonCategoryMatrix } from "@/lib/calculations";
import { formatPrice, formatWeight } from "@/lib/categories";
import { truncateToWords } from "@/lib/textUtils";

/** Kopfzelle einer Liste: bei Importen Name der Person über dem Listennamen. */
function EntryTitle({ entry }: { entry: ComparisonEntry }) {
  return (
    <div className="min-w-0">
      {entry.imported && entry.owner && (
        <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-paper-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent shadow-neu-sm dark:bg-paper-900">
          <Download className="h-3 w-3" aria-hidden />
          importiert
        </span>
      )}
      <p className="font-bold text-paper-800 dark:text-paper-100">
        {entry.imported && entry.owner ? `${entry.owner} — ` : ""}
        {entry.title}
      </p>
    </div>
  );
}

export function ComparisonTable({ entries }: { entries: ComparisonEntry[] }) {
  if (entries.length < 2) {
    return (
      <EmptyState
        seed="leer:vergleich-tabelle"
        illustration={
          <span className="relative block">
            <TurtleMascot
              totalWeightGrams={0}
              animated={false}
              className="h-28 w-28"
            />
            <DoodleArrow
              variant="hook"
              flip
              className="absolute -right-8 top-2 h-10 w-10 rotate-[18deg] text-paper-400 dark:text-paper-600"
            />
          </span>
        }
      >
        Wähle mindestens zwei Packlisten zum Vergleichen – eigene oder eine
        importierte Datei.
      </EmptyState>
    );
  }

  const rows = buildComparison(entries);
  const categoryRows = comparisonCategoryMatrix(entries);

  return (
    <div className="space-y-4">
      {/* Der Gewichtsunterschied auf einen Blick, vor der Tabelle: fünf
          Stufen nebeneinander sagen mehr als fünf Zahlen untereinander. */}
      <SurfaceCard as="section" tone="card" className="p-4">
        <ul className="flex flex-wrap justify-center gap-4">
          {rows.map((row) => (
            <li key={row.entry.key} className="w-28 text-center">
              <TurtleMascot
                totalWeightGrams={row.weightGrams}
                variant={getTurtleVariant(row.entry.key)}
                animated={false}
                className="mx-auto h-24 w-24"
              />
              <p
                className="break-words text-sm font-bold text-paper-800 dark:text-paper-100"
                title={row.entry.title}
              >
                {truncateToWords(row.entry.title, 3)}
              </p>
              <p className="text-sm tabular-nums text-paper-700 dark:text-paper-300">
                {formatWeight(row.weightGrams)}
              </p>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-paper-300 dark:border-paper-700">
            <tr className="text-xs uppercase tracking-wider text-paper-700 dark:text-paper-400">
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
                className="border-b border-paper-300/60 last:border-0 dark:border-paper-700"
              >
                <td className="px-4 py-3.5">
                  <EntryTitle entry={row.entry} />
                </td>
                <td className="px-4 py-3.5 text-paper-700 dark:text-paper-300">
                  {row.itemCount}
                </td>
                <td className="px-4 py-3.5 font-semibold text-olive-700 dark:text-olive-300">
                  {formatWeight(row.weightGrams)}
                </td>
                <td className="px-4 py-3.5 text-paper-700 dark:text-paper-400">
                  {row.isLightest
                    ? "leichteste"
                    : `+${formatWeight(row.weightDiff)}`}
                </td>
                <td className="px-4 py-3.5 text-olive-700 dark:text-olive-300">
                  {formatPrice(row.price)}
                </td>
                <td className="px-4 py-3.5 text-paper-700 dark:text-paper-400">
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
            <thead className="border-b border-paper-300 dark:border-paper-700">
              <tr className="text-xs uppercase tracking-wider text-paper-700 dark:text-paper-400">
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
                    className="border-b border-paper-300/60 last:border-0 dark:border-paper-700"
                  >
                    <td className="px-4 py-3 font-semibold text-paper-800 dark:text-paper-100">
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
                            ? "font-bold text-olive-700 dark:text-olive-300"
                            : "text-paper-700 dark:text-paper-300"
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
