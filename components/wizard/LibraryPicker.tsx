"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { GearItem, PackingListItem } from "@/types";
import { formatWeight } from "@/lib/categories";

/**
 * Mehrfachauswahl aus der Gear-Library für genau eine Kategorie,
 * mit Mengenangabe je gewähltem Item.
 */
export function LibraryPicker({
  items,
  selection,
  onToggle,
  onQuantity,
}: {
  items: GearItem[];
  selection: Map<string, PackingListItem>;
  onToggle: (gearItemId: string) => void;
  onQuantity: (gearItemId: string, quantity: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="px-1 py-3 text-sm text-clay-600 dark:text-clay-400">
        In dieser Kategorie liegt noch nichts in der Library. Leg unter „Neu
        anlegen“ direkt etwas an.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const chosen = selection.get(item.id);
        return (
          <li key={item.id}>
            <div className="flex items-center gap-3 rounded-control px-1 py-1.5">
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-pressed={Boolean(chosen)}
                className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
                  chosen
                    ? "bg-ember-500 shadow-neu-in-sm"
                    : "bg-clay-200 shadow-neu-sm dark:bg-clay-950"
                }`}
              >
                <Check
                  className={`h-4 w-4 text-white transition-opacity ${
                    chosen ? "opacity-100" : "opacity-0"
                  }`}
                  strokeWidth={3}
                  aria-hidden
                />
              </button>

              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate font-semibold text-clay-900 dark:text-clay-50">
                  {item.name}
                </p>
                <p className="text-xs text-clay-600 dark:text-clay-400">
                  {formatWeight(item.weightGrams)}
                </p>
              </button>

              {chosen && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onQuantity(item.id, Math.max(1, chosen.quantity - 1))
                    }
                    disabled={chosen.quantity <= 1}
                    aria-label="Menge verringern"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay-200 text-clay-700 shadow-neu-sm transition-all active:shadow-neu-in-sm disabled:opacity-40 dark:bg-clay-950 dark:text-clay-300"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums text-clay-900 dark:text-clay-50">
                    {chosen.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuantity(item.id, chosen.quantity + 1)}
                    aria-label="Menge erhöhen"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-clay-200 text-clay-700 shadow-neu-sm transition-all active:shadow-neu-in-sm dark:bg-clay-950 dark:text-clay-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
