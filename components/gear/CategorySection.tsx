"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SURFACE_CLASSES } from "@/components/ui/SurfaceCard";
import { getCategoryMeta } from "@/lib/categories";

/**
 * Aufklappbare Kategorie-Sektion der Gear-Library.
 *
 * Die Höhe animiert über grid-template-rows 0fr -> 1fr. Das ist der
 * einzige Weg, eine unbekannte Inhaltshöhe in CSS weich zu animieren,
 * ohne sie vorher zu messen. Während der Animation muss der Inhalt
 * beschnitten werden; danach wird overflow wieder freigegeben, sonst
 * würden die weichen Schatten der Item-Karten an den Rändern abschneiden.
 *
 * Im geschlossenen Zustand steht der Inhalt zusätzlich auf
 * visibility:hidden. Eine Zeile mit 0fr ist zwar optisch weg, ihr Inhalt
 * behält aber Ausdehnung und bliebe damit per Tab erreichbar und für
 * Screenreader lesbar.
 */
export function CategorySection({
  category,
  count,
  open,
  onToggle,
  children,
}: {
  category: Category;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const meta = getCategoryMeta(category);
  const [animating, setAnimating] = useState(false);

  return (
    <section>
      <button
        type="button"
        onClick={() => {
          setAnimating(true);
          onToggle();
        }}
        aria-expanded={open}
        className={`${SURFACE_CLASSES} flex w-full items-center gap-3 p-3 text-left transition-all duration-150 active:translate-y-px`}
      >
        <CategoryIcon category={category} className="h-5 w-5" />
        <span className="min-w-0 flex-1 truncate font-bold text-clay-900 dark:text-clay-50">
          {meta.label}
        </span>
        <span
          className={`min-w-7 rounded-full px-2 py-1 text-center text-xs font-bold tabular-nums ${
            count === 0
              ? "text-clay-700 dark:text-clay-400"
              : "bg-clay-200 text-clay-700 shadow-neu-in-sm dark:bg-clay-950 dark:text-clay-300"
          }`}
        >
          {count}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-clay-600 transition-transform duration-300 dark:text-clay-400 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        onTransitionEnd={() => setAnimating(false)}
      >
        <div
          className={`${animating || !open ? "overflow-hidden" : ""} ${
            open || animating ? "" : "invisible"
          }`}
        >
          <div className="space-y-3 px-1 pt-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
