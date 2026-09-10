"use client";

import { CheckCheck, Feather, TrendingDown } from "lucide-react";
import { formatWeight } from "@/lib/categories";
import type { WeightSnapshot } from "@/lib/weightHistory";

type Badge = {
  id: string;
  label: string;
  Icon: typeof Feather;
  className: string;
};

export function AchievementBadges({
  totalWeight,
  packed,
  total,
  reference,
}: {
  totalWeight: number;
  packed: number;
  total: number;
  reference: WeightSnapshot | null;
}) {
  const badges: Badge[] = [];

  if (totalWeight > 0 && totalWeight < 5000) {
    badges.push({
      id: "sub-5kg",
      label: "Unter 5 kg Base Weight!",
      Icon: Feather,
      className:
        "text-ember-700 dark:text-ember-300",
    });
  }

  if (reference && totalWeight > 0 && totalWeight < reference.weightGrams) {
    badges.push({
      id: "lighter",
      label: `${formatWeight(
        reference.weightGrams - totalWeight,
      )} leichter als „${reference.name}“`,
      Icon: TrendingDown,
      className:
        "text-forest-700 dark:text-forest-300",
    });
  }

  if (total > 0 && packed === total) {
    badges.push({
      id: "all-packed",
      label: "Alles gepackt – los geht's!",
      Icon: CheckCheck,
      className:
        "text-clay-700 dark:text-clay-200",
    });
  }

  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {badges.map(({ id, label, Icon, className }) => (
        <li key={id}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-clay-200 px-3.5 py-2 text-xs font-semibold shadow-neu-sm dark:bg-clay-950 ${className}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
