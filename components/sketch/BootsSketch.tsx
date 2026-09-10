import { Ground, SketchFrame, type SketchProps } from "./Sketch";

const ID = "sk-boots";

/**
 * Zwei Wanderschuhe – Vergleich ohne zweite Liste.
 *
 * Der hintere steht im Halbschatten, der vordere trägt die volle
 * Strichstärke. Beide Sohlen sind gefüllt: sie sind an einem Schuh das
 * Dunkelste und geben ihm Gewicht.
 */
export function BootsSketch({ className = "h-28 w-36", title }: SketchProps) {
  return (
    <SketchFrame
      viewBox="0 0 190 140"
      filterId={ID}
      className={className}
      title={title}
    >
      <Ground filterId={ID} y={122} x1={14} x2={176} opacity={0.5} />

      {/* Hinterer Schuh, blasser und leicht versetzt */}
      <g opacity="0.5">
        <path
          d="M104 104 Q101 74 108 50 Q124 45 135 52 Q137 72 146 83 Q161 93 167 104 Q169 112 158 113 Q128 116 109 113 Q102 112 104 104 Z"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d="M102 104 Q135 114 169 104 Q170 114 158 116 Q128 119 109 116 Q101 114 102 104 Z"
          fill="currentColor"
          stroke="none"
        />
        <g stroke="currentColor" strokeWidth="1.7" opacity="0.8" fill="none">
          <path d="M105 55 Q120 61 134 54" />
          <path d="M144 85 Q155 92 165 101" />
        </g>
        <g stroke="currentColor" strokeWidth="1.4" opacity="0.7">
          <path d="M110 67 Q122 71 132 67" />
          <path d="M111 79 Q123 83 135 80" />
          <path d="M113 91 Q125 95 138 93" />
        </g>
      </g>

      {/* Vorderer Schuh */}
      <g stroke="currentColor" strokeWidth="1.6" opacity="0.35">
        <path d="M60 62 Q66 84 63 100" />
      </g>
      <path
        d="M22 100 Q19 68 26 44 Q42 39 53 46 Q55 66 64 77 Q79 87 85 98 Q87 106 76 107 Q46 110 27 107 Q20 106 22 100 Z"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
      />
      <path
        d="M20 99 Q53 109 87 99 Q88 110 76 112 Q46 115 27 112 Q19 110 20 99 Z"
        fill="currentColor"
        stroke="none"
      />
      {/* Schaftkante und Zehenkappe geben dem Umriss erst einen Schuh */}
      <g stroke="currentColor" strokeWidth="2" opacity="0.9" fill="none">
        <path d="M23 50 Q39 56 53 49" />
        <path d="M62 80 Q74 87 84 97" />
      </g>
      {/* Schnürung */}
      <g stroke="currentColor" strokeWidth="1.7" opacity="0.8">
        <path d="M28 62 Q40 66 51 62" />
        <path d="M29 74 Q41 78 54 75" />
        <path d="M31 86 Q43 90 57 88" />
      </g>
      {/* Schnürsenkel-Ösen als kleine Punkte */}
      <g fill="currentColor" stroke="none" opacity="0.65">
        <circle cx="30" cy="62" r="1.7" />
        <circle cx="31" cy="74" r="1.7" />
        <circle cx="33" cy="86" r="1.7" />
      </g>
    </SketchFrame>
  );
}
