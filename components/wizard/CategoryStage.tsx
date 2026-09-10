"use client";

import type { Category } from "@/types";
import { SketchIcon } from "@/components/ui/SketchIcon";
import { CATEGORY_SKETCH } from "@/lib/sketchIcons";
import { getCategoryMeta } from "@/lib/categories";

/**
 * Grosses Kategorie-Icon als einziger Orientierungspunkt des Wizards.
 *
 * Der key auf der Kategorie erzwingt bei jedem Schritt einen Remount,
 * dadurch läuft die Keyframe erneut: das Icon kommt von unten herein,
 * schiesst leicht über und federt zurück.
 */
export function CategoryStage({ category }: { category: Category }) {
  const meta = getCategoryMeta(category);

  return (
    <div key={category} className="flex flex-col items-center py-2 text-center">
      <span
        className="animate-icon-in flex h-28 w-28 items-center justify-center rounded-full bg-clay-200 shadow-neu-lg dark:bg-clay-950"
        style={{ color: meta.chartColor }}
      >
        <SketchIcon type={CATEGORY_SKETCH[category]} className="h-14 w-14" />
      </span>
      <h2 className="animate-label-in mt-5 text-2xl font-extrabold tracking-tight text-clay-900 [animation-delay:90ms] dark:text-clay-50">
        {meta.label}
      </h2>
    </div>
  );
}
