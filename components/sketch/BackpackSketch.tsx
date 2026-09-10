import { SketchFrame, type SketchProps } from "./Sketch";

/** Rucksack – leere Gear-Library. */
export function BackpackSketch({ className = "h-32 w-32", title }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 140 160" className={className} title={title}>
      <g strokeWidth="1.5">
        {/* Korpus */}
        <path d="M34 62 Q34 42 52 38 Q70 34 88 38 Q106 42 106 62 Q108 106 104 134 Q102 146 90 147 Q70 149 50 147 Q38 146 36 134 Q32 106 34 62 Z" />
        {/* Deckelklappe */}
        <path d="M35 76 Q70 84 105 75" />
      </g>
      <g strokeWidth="1" opacity="0.75">
        {/* Fronttasche */}
        <path d="M50 96 Q70 100 90 95 Q92 116 89 126 Q70 130 51 126 Q48 114 50 96 Z" />
        <path d="M55 111 Q70 114 85 110" strokeWidth="0.9" opacity="0.7" />
        {/* Trageschlaufe oben */}
        <path d="M59 39 Q70 23 81 39" />
        {/* Angedeutete Schultergurte an den Seiten */}
        <path d="M37 74 Q28 96 36 122" opacity="0.55" />
        <path d="M103 74 Q112 96 104 122" opacity="0.55" />
        {/* Kompressionsriemen */}
        <path d="M34 62 Q70 68 106 61" strokeWidth="0.9" opacity="0.6" />
      </g>
    </SketchFrame>
  );
}
