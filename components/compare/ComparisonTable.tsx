"use client";

import type { GearItem, PackingList } from "@/types";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import { buildComparison } from "@/lib/calculations";
import { formatPrice, formatWeight } from "@/lib/categories";

export function ComparisonTable({
  lists,
  gearItems,
}: {
  lists: PackingList[];
  gearItems: GearItem[];
}) {
  if (lists.length < 2) {
    return (
      <EmptyState>Wähle mindestens zwei Packlisten zum Vergleichen.</EmptyState>
    );
  }

  const rows = buildComparison(lists, gearItems);

  return (
    <SurfaceCard className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-clay-300 dark:border-clay-800">
          <tr className="text-xs uppercase tracking-wider text-clay-600 dark:text-clay-400">
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
              key={row.list.id}
              className="border-b border-clay-300/60 last:border-0 dark:border-clay-800"
            >
              <td className="px-4 py-3.5 font-bold text-clay-900 dark:text-clay-50">
                {row.list.name}
              </td>
              <td className="px-4 py-3.5 text-clay-700 dark:text-clay-300">
                {row.itemCount}
              </td>
              <td className="px-4 py-3.5 font-semibold text-forest-700 dark:text-forest-300">
                {formatWeight(row.weightGrams)}
              </td>
              <td className="px-4 py-3.5 text-clay-600 dark:text-clay-400">
                {row.isLightest
                  ? "leichteste"
                  : `+${formatWeight(row.weightDiff)}`}
              </td>
              <td className="px-4 py-3.5 text-forest-700 dark:text-forest-300">
                {formatPrice(row.price)}
              </td>
              <td className="px-4 py-3.5 text-clay-600 dark:text-clay-400">
                {row.isCheapest
                  ? "günstigste"
                  : `+${formatPrice(row.priceDiff)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SurfaceCard>
  );
}
