"use client";

import { Check, Minus, Plus } from "lucide-react";
import type { GearItem, PackingListItem } from "@/types";
import { formatComfortTemp, formatWeight } from "@/lib/categories";

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
      <p className="px-1 py-3 text-sm text-paper-700 dark:text-paper-400">
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
                    ? "bg-accent shadow-neu-in-sm"
                    : "bg-paper-200 shadow-neu-sm dark:bg-paper-900"
                }`}
              >
                <Check
                  className={`h-4 w-4 text-on-accent transition-opacity ${
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
                <p className="break-words font-semibold leading-snug text-paper-800 dark:text-paper-100">
                  {item.name}
                </p>
                <p className="text-xs text-paper-700 dark:text-paper-400">
                  {formatWeight(item.weightGrams)}
                  {item.comfortTempC != null &&
                    ` · ${formatComfortTemp(item.comfortTempC)}`}
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-200 text-paper-700 shadow-neu-sm transition-all active:shadow-neu-in-sm disabled:opacity-40 dark:bg-paper-900 dark:text-paper-300"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold tabular-nums text-paper-800 dark:text-paper-100">
                    {chosen.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onQuantity(item.id, chosen.quantity + 1)}
                    aria-label="Menge erhöhen"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper-200 text-paper-700 shadow-neu-sm transition-all active:shadow-neu-in-sm dark:bg-paper-900 dark:text-paper-300"
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
