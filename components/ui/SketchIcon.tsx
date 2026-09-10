import { getSketchPaths, type SketchType } from "@/lib/sketchIcons";

/**
 * Rendert ein handgezeichnetes Icon, z. B. <SketchIcon type="tent" />.
 * Nimmt die Strichfarbe über currentColor an und lässt sich per x/y auch
 * innerhalb eines fremden SVG (Recharts-Achse) positionieren.
 */
export function SketchIcon({
  type,
  size = 24,
  className,
  x,
  y,
}: {
  type: SketchType;
  size?: number;
  className?: string;
  x?: number;
  y?: number;
}) {
  return (
    <svg
      x={x}
      y={y}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {getSketchPaths(type).map((path, index) => (
        <path key={index} d={path.d} strokeWidth={path.strokeWidth} />
      ))}
    </svg>
  );
}
