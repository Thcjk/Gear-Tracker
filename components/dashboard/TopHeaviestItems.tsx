"use client";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
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
    <SurfaceCard className="p-4">
      <h3 className="mb-4 text-base font-bold text-clay-900 dark:text-clay-50">
        Top 5 schwerste Items
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-clay-700 dark:text-clay-400">
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
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clay-200 text-xs font-bold text-ember-800 shadow-neu-sm dark:bg-clay-950 dark:text-ember-400">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="break-words font-semibold leading-snug text-clay-900 dark:text-clay-50">
                    {item.name}
                  </p>
                  <p className="text-xs text-clay-700 dark:text-clay-400">
                    {formatWeight(item.weightGrams)} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-bold text-forest-700 dark:text-forest-300">
                {formatWeight(item.totalGrams)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </SurfaceCard>
  );
}
