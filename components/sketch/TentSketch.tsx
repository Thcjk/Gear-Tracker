import { SketchFrame, type SketchProps } from "./Sketch";

/** Aufgebautes Zelt – leere Packliste. */
export function TentSketch({ className = "h-32 w-40", title }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 180 140" className={className} title={title}>
      <g strokeWidth="1.5">
        <path d="M28 116 Q58 78 89 40 Q121 78 152 116" />
        <path d="M28 116 Q90 121 152 116" />
      </g>
      <g strokeWidth="1" opacity="0.75">
        {/* Eingangsklappe */}
        <path d="M62 116 Q76 86 89 58 Q103 87 117 116" />
        <path d="M89 41 Q90 78 90 115" />
      </g>
      <g strokeWidth="0.9" opacity="0.55">
        {/* Abspannungen mit Heringen */}
        <path d="M89 42 Q68 64 16 110" />
        <path d="M89 42 Q111 64 164 110" />
        <path d="M14 108 Q13 114 16 118" />
        <path d="M166 108 Q167 114 164 118" />
      </g>
    </SketchFrame>
  );
}
