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
        <thead className="border-b border-forest-100 dark:border-forest-800">
          <tr className="text-earth-500 dark:text-earth-400">
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
              className="border-b border-forest-50 last:border-0 dark:border-forest-800"
            >
              <td className="px-4 py-3 font-semibold text-forest-900 dark:text-forest-50">
                {row.list.name}
              </td>
              <td className="px-4 py-3 text-earth-700 dark:text-earth-300">
                {row.itemCount}
              </td>
              <td className="px-4 py-3 font-medium text-forest-800 dark:text-forest-200">
                {formatWeight(row.weightGrams)}
              </td>
              <td className="px-4 py-3 text-earth-600 dark:text-earth-300">
                {row.isLightest
                  ? "leichteste"
                  : `+${formatWeight(row.weightDiff)}`}
              </td>
              <td className="px-4 py-3 text-forest-800 dark:text-forest-200">
                {formatPrice(row.price)}
              </td>
              <td className="px-4 py-3 text-earth-600 dark:text-earth-300">
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
