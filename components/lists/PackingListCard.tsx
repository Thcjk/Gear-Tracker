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
import { IconButton } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  TurtleMascot,
  getTurtleVariant,
} from "@/components/mascot/TurtleMascot";
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
      pinned={list.id}
      className="animate-rise p-4"
      style={{ animationDelay: staggerDelay(index) }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Die kleine Schildkröte ordnet das Gewicht ein, bevor man die
            Zahl daneben gelesen hat. Ohne Einlauf-Animation: in einer
            Liste mit zehn Karten liefe sonst zehnmal dasselbe. */}
        <TurtleMascot
          totalWeightGrams={weight}
          variant={getTurtleVariant(list.id)}
          animated={false}
          className="-my-1 h-14 w-14 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <Link
            href={`/lists/detail?id=${list.id}`}
            className="-my-2 inline-flex min-h-[2.75rem] items-center text-lg font-bold text-paper-800 transition-colors hover:text-accent dark:text-paper-100 dark:hover:text-accent"
          >
            {list.name}
          </Link>
          <p className="mt-1 text-sm text-paper-700 dark:text-paper-400">
            {count} Items · {formatWeight(weight)}
          </p>
        </div>
        <IconButton
          variant="danger"
          onClick={() => onDelete(list.id)}
          aria-label="Liste löschen"
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="mt-4">
        <ProgressBar packed={progress.packed} total={progress.total} />
      </div>
    </SurfaceCard>
  );
}
