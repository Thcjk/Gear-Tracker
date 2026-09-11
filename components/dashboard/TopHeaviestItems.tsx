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
      <h3 className="mb-4 text-base font-bold text-paper-800 dark:text-paper-100">
        Top 5 schwerste Items
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-paper-700 dark:text-paper-400">
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
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-200 text-xs font-bold text-accent shadow-neu-sm dark:bg-paper-900">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="break-words font-semibold leading-snug text-paper-800 dark:text-paper-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-paper-700 dark:text-paper-400">
                    {formatWeight(item.weightGrams)} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="shrink-0 font-bold text-olive-700 dark:text-olive-300">
                {formatWeight(item.totalGrams)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </SurfaceCard>
  );
}
