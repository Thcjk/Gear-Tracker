"use client";

import { useEffect, useRef, useState } from "react";
import type { GearItem, PackingListItem } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatWeight } from "@/lib/categories";
import { staggerDelay } from "@/lib/stagger";

export function PackingListItemCard({
  item,
  gear,
  index = 0,
  onTogglePacked,
  onQuantityChange,
  onRemove,
}: {
  item: PackingListItem;
  gear: GearItem | undefined;
  index?: number;
  onTogglePacked: () => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  const [celebrating, setCelebrating] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  function handleToggle() {
    // Nur beim Abhaken feiern, nicht beim Wieder-Auspacken
    if (!item.packed) {
      setCelebrating(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCelebrating(false), 660);
    }
    onTogglePacked();
  }

  if (!gear) {
    return (
      <article className="rounded-card bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        Item fehlt in der Library.
        <button type="button" onClick={onRemove} className="ml-2 underline">
          Entfernen
        </button>
      </article>
    );
  }

  return (
    <article
      className="relative animate-rise overflow-hidden rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark"
      style={{ animationDelay: staggerDelay(index) }}
    >
      {celebrating && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-flash rounded-card bg-forest-400"
        />
      )}
      <div className="relative flex items-start gap-3">
        <label className="mt-1 flex items-center">
          <input
            type="checkbox"
            checked={item.packed}
            onChange={handleToggle}
            className={`h-5 w-5 rounded border-forest-300 text-ember-500 transition focus:ring-ember-400 ${
              celebrating ? "animate-pop" : ""
            }`}
          />
        </label>
        <CategoryIcon category={gear.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`truncate font-semibold ${
                item.packed
                  ? "text-earth-400 line-through"
                  : "text-forest-950 dark:text-forest-50"
              }`}
            >
              {gear.name}
            </h3>
            <p className="whitespace-nowrap font-bold text-forest-700 dark:text-forest-200">
              {formatWeight(gear.weightGrams * item.quantity)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-earth-600 dark:text-earth-300">
              Menge
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-16 rounded-lg border border-forest-200 bg-forest-50 px-2 py-1 dark:border-forest-700 dark:bg-forest-950"
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="text-sm font-medium text-red-600 dark:text-red-400"
            >
              Entfernen
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
