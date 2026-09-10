import { SketchFrame, type SketchProps } from "./Sketch";

/** Bergkette mit Wolke – Deko hinter dem Listen-Kopf. */
export function MountainSketch({ className = "h-32 w-full", title }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 320 120" className={className} title={title}>
      {/* Hintere Kette, blasser */}
      <g strokeWidth="1" opacity="0.5">
        <path d="M10 92 Q44 58 72 34 Q98 58 124 84 Q140 98 152 92" />
        <path d="M196 90 Q222 62 246 40 Q272 64 300 92" />
      </g>
      {/* Vordere Kette mit Firnlinien */}
      <g strokeWidth="1.4">
        <path d="M28 100 Q76 52 116 20 Q158 56 196 100" />
        <path d="M100 34 Q108 44 114 41 Q122 48 130 46" strokeWidth="1" opacity="0.7" />
        <path d="M148 100 Q182 68 210 44 Q244 72 278 100" opacity="0.85" />
        <path d="M196 56 Q203 64 209 61 Q216 67 222 65" strokeWidth="1" opacity="0.6" />
      </g>
      {/* Grundlinie und eine Wolke */}
      <path d="M6 101 Q84 105 160 101 Q238 97 314 102" strokeWidth="1.3" />
      <g strokeWidth="0.9" opacity="0.45">
        <path d="M238 22 Q244 12 254 16 Q262 8 270 18 Q280 18 278 26 Q262 30 246 28 Q236 28 238 22 Z" />
      </g>
    </SketchFrame>
  );
}
