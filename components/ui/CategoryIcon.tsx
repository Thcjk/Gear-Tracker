import type { Category } from "@/types";
import { getCategoryMeta } from "@/lib/categories";
import { FlatlayObject } from "@/components/flatlay/FlatlayObject";

/**
 * Nacktes Objekt ohne Papier-Scheibe. Rendert ein <svg>, das sich auch
 * innerhalb eines anderen SVG (z. B. als Recharts-Achsenbeschriftung)
 * über x/y positionieren lässt.
 */
export function CategoryGlyph({
  category,
  size = 16,
  x,
  y,
}: {
  category: Category;
  size?: number;
  x?: number;
  y?: number;
}) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <FlatlayObject category={category} className="" />
    </svg>
  );
}

export function CategoryIcon({
  category,
  className = "h-7 w-7",
}: {
  category: Category;
  className?: string;
}) {
  const meta = getCategoryMeta(category);
  return (
    <span
      // Das Objekt liegt auf einer hellen Papier-Scheibe, damit die
      // Ink-Konturen auch auf der dunklen Karte stehen bleiben.
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-200 shadow-neu-in-sm dark:bg-paper-200"
      title={meta.label}
    >
      <FlatlayObject category={category} className={className} />
    </span>
  );
}
