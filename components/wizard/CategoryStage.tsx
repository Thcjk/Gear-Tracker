"use client";

import type { Category } from "@/types";
import { FlatlayObject } from "@/components/flatlay/FlatlayObject";
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
        className="animate-icon-in flex h-28 w-28 items-center justify-center rounded-full bg-paper-200 shadow-neu-lg dark:bg-paper-900"
        style={{ color: meta.chartColor }}
      >
        <FlatlayObject category={category} className="h-16 w-16" />
      </span>
      <h2 className="animate-label-in mt-5 text-2xl font-extrabold tracking-tight text-paper-800 [animation-delay:90ms] dark:text-paper-100">
        {meta.label}
      </h2>
    </div>
  );
}
