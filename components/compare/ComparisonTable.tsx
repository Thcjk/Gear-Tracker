"use client";

import type { GearItem, PackingList } from "@/types";
import {
  listItemCount,
  listTotalPrice,
  listTotalWeight,
} from "@/lib/calculations";
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
      <div className="rounded-card bg-white p-6 text-sm text-earth-600 shadow-soft dark:bg-forest-900 dark:text-earth-300 dark:shadow-soft-dark">
        Wähle mindestens zwei Packlisten zum Vergleichen.
      </div>
    );
  }

  const rows = lists.map((list) => {
    const weight = listTotalWeight(list, gearItems);
    const price = listTotalPrice(list, gearItems);
    const count = listItemCount(list);
    return { list, weight, price, count };
  });

  const minWeight = Math.min(...rows.map((r) => r.weight));
  const minPrice = Math.min(...rows.map((r) => r.price));

  return (
    <div className="overflow-x-auto rounded-card bg-white shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
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
          {rows.map(({ list, weight, price, count }) => (
            <tr
              key={list.id}
              className="border-b border-forest-50 last:border-0 dark:border-forest-800"
            >
              <td className="px-4 py-3 font-semibold text-forest-900 dark:text-forest-50">
                {list.name}
              </td>
              <td className="px-4 py-3 text-earth-700 dark:text-earth-300">
                {count}
              </td>
              <td className="px-4 py-3 font-medium text-forest-800 dark:text-forest-200">
                {formatWeight(weight)}
              </td>
              <td className="px-4 py-3 text-earth-600 dark:text-earth-300">
                {weight === minWeight
                  ? "leichteste"
                  : `+${formatWeight(weight - minWeight)}`}
              </td>
              <td className="px-4 py-3 text-forest-800 dark:text-forest-200">
                {formatPrice(price)}
              </td>
              <td className="px-4 py-3 text-earth-600 dark:text-earth-300">
                {price === minPrice
                  ? "günstigste"
                  : `+${formatPrice(price - minPrice)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
