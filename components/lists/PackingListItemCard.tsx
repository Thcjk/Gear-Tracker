"use client";

import { useEffect, useRef, useState } from "react";
import type { GearItem, PackingListItem } from "@/types";
import { ComfortTempBadge } from "@/components/gear/ComfortTempBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { StampCheckbox } from "@/components/ui/StampCheckbox";
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
      <SurfaceCard
        as="article"
        tone="postit"
        torn
        className="p-4 text-sm text-red-700 dark:text-red-300"
      >
        Item fehlt in der Library.
        <button type="button" onClick={onRemove} className="ml-2 underline">
          Entfernen
        </button>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard
      as="article"
      pinned={item.gearItemId}
      className="animate-rise overflow-hidden p-4"
      style={{ animationDelay: staggerDelay(index) }}
    >
      {celebrating && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-flash rounded-card bg-accent-tertiary"
        />
      )}
      <div className="relative flex items-start gap-3">
        <StampCheckbox
          seed={item.gearItemId}
          checked={item.packed}
          onChange={handleToggle}
          aria-label={`${gear.name} abhaken`}
        />
        <CategoryIcon category={gear.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {/* Umbrechen statt abschneiden, und das Gewicht darf nicht
                schrumpfen – sonst verdrängen sich die beiden gegenseitig. */}
            <h3
              className={`min-w-0 flex-1 break-words font-bold leading-snug transition-colors ${
                item.packed
                  ? "text-paper-700 line-through dark:text-paper-400"
                  : "text-paper-800 dark:text-paper-100"
              }`}
            >
              {gear.name}
            </h3>
            <p className="shrink-0 whitespace-nowrap font-extrabold text-olive-700 dark:text-olive-300">
              {formatWeight(gear.weightGrams * item.quantity)}
            </p>
          </div>
          {gear.comfortTempC != null && (
            <ComfortTempBadge celsius={gear.comfortTempC} className="mt-2" />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-sm text-paper-700 dark:text-paper-400">
              Menge
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(Math.max(1, Number(e.target.value) || 1))
                }
                className="neu-field h-11 w-16 px-2 py-1 text-center"
              />
            </label>
            <button
              type="button"
              onClick={onRemove}
              className="-mx-2 inline-flex h-11 items-center px-2 text-sm font-semibold text-red-700 transition-opacity active:opacity-60 dark:text-red-300"
            >
              Entfernen
            </button>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
