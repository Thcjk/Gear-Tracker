import { Campfire } from "@/components/sketch/parts";
import { Ground, SketchFrame, type SketchProps } from "./Sketch";

const ID = "sk-fire";

/** Lagerfeuer mit Rauch und zwei Steinen – Abschluss einer Tour. */
export function CampfireSketch({ className = "h-28 w-28", title }: SketchProps) {
  return (
    <SketchFrame
      viewBox="0 0 140 140"
      filterId={ID}
      className={className}
      title={title}
    >
      <Ground filterId={ID} y={118} x1={16} x2={124} opacity={0.5} />
      {/* Zwei Steine als Feuerstelle, der linke im Schatten */}
      <g fill="currentColor" stroke="none" opacity="0.55">
        <path d="M26 114 Q24 104 33 103 Q43 102 44 111 Q44 117 34 118 Q27 118 26 114 Z" />
        <path d="M106 113 Q104 105 112 104 Q120 104 121 111 Q121 116 113 117 Q107 117 106 113 Z" />
      </g>
      <Campfire x={72} y={116} scale={1.55} />
    </SketchFrame>
  );
}
