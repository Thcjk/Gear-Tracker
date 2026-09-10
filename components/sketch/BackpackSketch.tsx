import { Ground, SketchFrame, type SketchProps } from "./Sketch";

const ID = "sk-pack";

/**
 * Rucksack – leere Gear-Library.
 *
 * Der Umriss ist der alte, er hat funktioniert. Neu ist die Plastik:
 * Schraffur auf der rechten Seite, gefüllter Deckelriemen und Boden, und
 * ein Schatten, der nach links wegfällt.
 */
export function BackpackSketch({ className = "h-32 w-32", title }: SketchProps) {
  return (
    <SketchFrame
      viewBox="0 0 140 170"
      filterId={ID}
      className={className}
      title={title}
    >
      <Ground filterId={ID} y={152} x1={14} x2={126} opacity={0.5} />

      {/* Schattenseite: Schraffur unter dem Umriss */}
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.3">
        <path d="M96 66 Q101 100 98 132" />
        <path d="M102 72 Q106 100 103 126" />
      </g>

      <g stroke="currentColor" strokeWidth="2.4" fill="none">
        {/* Korpus */}
        <path d="M34 66 Q34 46 52 42 Q70 38 88 42 Q106 46 106 66 Q108 110 104 138 Q102 150 90 151 Q70 153 50 151 Q38 150 36 138 Q32 110 34 66 Z" />
        {/* Trageschlaufe */}
        <path d="M59 43 Q70 27 81 43" strokeWidth="2" />
      </g>

      {/* Deckelriemen als dunkles Band */}
      <path
        d="M34 78 Q70 86 106 77 L106 84 Q70 93 34 85 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.85"
      />

      <g stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.8">
        {/* Fronttasche */}
        <path d="M50 100 Q70 104 90 99 Q92 120 89 130 Q70 134 51 130 Q48 118 50 100 Z" />
        <path d="M55 115 Q70 118 85 114" strokeWidth="1.3" opacity="0.7" />
        {/* Schultergurte, die an den Seiten hervorschauen */}
        <path d="M37 78 Q28 100 36 126" opacity="0.5" />
        <path d="M103 78 Q112 100 104 126" opacity="0.5" />
      </g>

      {/* Boden: die dunkelste Stelle */}
      <path
        d="M37 138 Q70 146 103 137 Q102 149 90 151 Q70 153 50 151 Q38 150 37 138 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.28"
      />
    </SketchFrame>
  );
}
