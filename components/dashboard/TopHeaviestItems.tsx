"use client";

import { formatWeight } from "@/lib/categories";

export function TopHeaviestItems({
  items,
}: {
  items: {
    name: string;
    weightGrams: number;
    quantity: number;
    totalGrams: number;
  }[];
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
      <h3 className="mb-3 text-base font-semibold text-forest-900 dark:text-forest-50">
        Top 5 schwerste Items
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-earth-500 dark:text-earth-400">
          Noch keine Items in dieser Liste.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ember-100 text-xs font-bold text-ember-700 dark:bg-ember-950 dark:text-ember-300">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-forest-900 dark:text-forest-50">
                    {item.name}
                  </p>
                  <p className="text-xs text-earth-500 dark:text-earth-400">
                    {formatWeight(item.weightGrams)} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-semibold text-forest-700 dark:text-forest-200">
                {formatWeight(item.totalGrams)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
