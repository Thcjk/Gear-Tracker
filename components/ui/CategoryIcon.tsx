"use client";

import {
  Backpack,
  CircuitBoard,
  Droplets,
  MoonStar,
  Shirt,
  Tent,
  UtensilsCrossed,
} from "lucide-react";
import type { Category } from "@/types";
import { getCategoryMeta } from "@/lib/categories";

const iconMap = {
  shelter: Tent,
  "sleep-system": MoonStar,
  backpack: Backpack,
  kitchen: UtensilsCrossed,
  clothing: Shirt,
  electronics: CircuitBoard,
  "hygiene-misc": Droplets,
} as const;

export function CategoryIcon({
  category,
  className = "h-4 w-4",
}: {
  category: Category;
  className?: string;
}) {
  const Icon = iconMap[category];
  const meta = getCategoryMeta(category);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full p-2 ${meta.color}`}
      title={meta.label}
    >
      <Icon className={className} aria-hidden />
    </span>
  );
}
