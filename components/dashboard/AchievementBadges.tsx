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
        "bg-ember-100 text-ember-800 ring-ember-200 dark:bg-ember-950 dark:text-ember-200 dark:ring-ember-900",
    });
  }

  if (reference && totalWeight > 0 && totalWeight < reference.weightGrams) {
    badges.push({
      id: "lighter",
      label: `${formatWeight(
        reference.weightGrams - totalWeight,
      )} leichter als „${reference.name}"`,
      Icon: TrendingDown,
      className:
        "bg-forest-100 text-forest-800 ring-forest-200 dark:bg-forest-800 dark:text-forest-100 dark:ring-forest-700",
    });
  }

  if (total > 0 && packed === total) {
    badges.push({
      id: "all-packed",
      label: "Alles gepackt – los geht's!",
      Icon: CheckCheck,
      className:
        "bg-earth-100 text-earth-800 ring-earth-200 dark:bg-earth-900 dark:text-earth-100 dark:ring-earth-800",
    });
  }

  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {badges.map(({ id, label, Icon, className }) => (
        <li key={id}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${className}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
