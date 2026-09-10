"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { GearItem, PackingList } from "@/types";
import {
  listItemCount,
  listPackedProgress,
  listTotalWeight,
} from "@/lib/calculations";
import { formatWeight } from "@/lib/categories";
import { staggerDelay } from "@/lib/stagger";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ProgressBar } from "./ProgressBar";

export function PackingListCard({
  list,
  gearItems,
  index = 0,
  onDelete,
}: {
  list: PackingList;
  gearItems: GearItem[];
  index?: number;
  onDelete: (id: string) => void;
}) {
  const progress = listPackedProgress(list);
  const weight = listTotalWeight(list, gearItems);
  const count = listItemCount(list);

  return (
    <SurfaceCard
      as="article"
      className="animate-rise p-4 transition-shadow hover:shadow-lg"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/lists/detail?id=${list.id}`}
            className="text-lg font-semibold text-forest-900 hover:text-ember-600 dark:text-forest-50 dark:hover:text-ember-400"
          >
            {list.name}
          </Link>
          <p className="mt-1 text-sm text-earth-600 dark:text-earth-300">
            {count} Items · {formatWeight(weight)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(list.id)}
          className="rounded-xl bg-red-50 p-2 text-red-700 dark:bg-red-950 dark:text-red-300"
          aria-label="Liste löschen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4">
        <ProgressBar packed={progress.packed} total={progress.total} />
      </div>
    </SurfaceCard>
  );
}
