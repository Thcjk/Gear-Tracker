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
      className={`inline-flex items-center justify-center rounded-full p-2 ${meta.color}`}
      title={meta.label}
    >
      <SketchIcon type={CATEGORY_SKETCH[category]} className={className} />
    </span>
  );
}
