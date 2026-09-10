import { SketchFrame, type SketchProps } from "./Sketch";

/** Zwei Wanderschuhe nebeneinander – Vergleich ohne zweite Liste. */
export function BootsSketch({ className = "h-28 w-36", title }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 180 130" className={className} title={title}>
      {/* Linker Schuh */}
      <g strokeWidth="1.4">
        <path d="M22 96 Q20 66 26 44 Q40 40 50 46 Q52 66 60 76 Q74 86 80 96 Q82 104 72 105 Q44 107 26 105 Q20 104 22 96 Z" />
        <path d="M22 100 Q50 105 80 99" strokeWidth="1.2" />
      </g>
      <g strokeWidth="0.9" opacity="0.7">
        <path d="M28 54 Q38 58 47 54" />
        <path d="M28 65 Q39 69 49 65" />
        <path d="M29 76 Q40 80 52 77" />
      </g>
      {/* Rechter Schuh, leicht versetzt */}
      <g strokeWidth="1.4" opacity="0.85">
        <path d="M100 100 Q98 72 104 50 Q118 46 128 52 Q130 71 138 81 Q152 90 158 100 Q160 108 150 109 Q122 111 104 109 Q98 108 100 100 Z" />
        <path d="M100 104 Q128 109 158 103" strokeWidth="1.2" />
      </g>
      <g strokeWidth="0.9" opacity="0.55">
        <path d="M106 60 Q116 64 125 60" />
        <path d="M106 71 Q117 75 127 71" />
        <path d="M107 82 Q118 86 130 83" />
      </g>
    </SketchFrame>
  );
}
