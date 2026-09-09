"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { GearItem } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatPrice, formatWeight, getCategoryMeta } from "@/lib/categories";

export function GearItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: GearItem;
  onEdit: (item: GearItem) => void;
  onDelete: (id: string) => void;
}) {
  const meta = getCategoryMeta(item.category);

  return (
    <article className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
      <div className="flex items-start gap-3">
        <CategoryIcon category={item.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate text-base font-semibold text-forest-950 dark:text-forest-50">
                {item.name}
              </h3>
              <p className="mt-0.5 text-sm text-earth-600 dark:text-earth-300">
                {meta.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-forest-700 dark:text-forest-200">
                {formatWeight(item.weightGrams)}
              </p>
              {item.price != null && (
                <p className="text-sm text-earth-500 dark:text-earth-400">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>
          </div>
          {item.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-earth-500 dark:text-earth-400">
              {item.notes}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="inline-flex items-center gap-1 rounded-xl bg-forest-100 px-3 py-1.5 text-sm font-medium text-forest-800 dark:bg-forest-800 dark:text-forest-100"
            >
              <Pencil className="h-3.5 w-3.5" />
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Löschen
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
