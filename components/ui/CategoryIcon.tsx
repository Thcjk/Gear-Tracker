import type { Category } from "@/types";
import { getCategoryMeta } from "@/lib/categories";
import { CATEGORY_SKETCH } from "@/lib/sketchIcons";
import { SketchIcon } from "@/components/ui/SketchIcon";

/**
 * Nacktes Icon ohne Pillen-Hintergrund. Rendert ein <svg>, das sich auch
 * innerhalb eines anderen SVG (z. B. als Recharts-Achsenbeschriftung)
 * über x/y positionieren lässt.
 */
export function CategoryGlyph({
  category,
  size = 16,
  x,
  y,
  className,
}: {
  category: Category;
  size?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  return (
    <SketchIcon
      type={CATEGORY_SKETCH[category]}
      size={size}
      x={x}
      y={y}
      className={className}
    />
  );
}

export function CategoryIcon({
  category,
  className = "h-5 w-5",
}: {
  category: Category;
  className?: string;
}) {
  const meta = getCategoryMeta(category);
  return (
    <span
      // Weiche erhabene Scheibe in der Grundfläche; die Kategoriefarbe
      // steckt nur noch im Strich des Icons, nicht mehr in der Fläche.
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clay-200 shadow-neu-sm dark:bg-clay-950"
      title={meta.label}
      style={{ color: meta.chartColor }}
    >
      <SketchIcon type={CATEGORY_SKETCH[category]} className={className} />
    </span>
  );
}
