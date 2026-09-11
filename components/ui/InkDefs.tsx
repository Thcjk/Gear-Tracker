/**
 * Gemeinsame SVG-Filter für alles, was nach Stempelfarbe aussehen soll.
 *
 * Sie stehen einmal im Dokument statt einmal pro Knopf: ein feTurbulence
 * pro Stempel wäre bei zehn Knöpfen auf einem Bildschirm zehnmal dieselbe
 * Rechnung, und die Filter-IDs müssten zwischen Server-Rendering und
 * Hydration übereinstimmen.
 *
 * Drei Varianten, damit nicht jeder Stempel dieselbe ausgefranste Kante
 * hat; welche eine Fläche bekommt, entscheidet ihr Text (lib/pinning).
 *
 * Die Frequenz ist in x höher als in y: die Stempelform wird auf die
 * Knopfbreite gezogen (preserveAspectRatio="none"), dadurch würde eine
 * gleichmässige Störung waagerecht verschmieren.
 */
const EDGES = [
  { id: "stamp-edge-0", seed: 3, freq: "0.09 0.05", scale: 6 },
  { id: "stamp-edge-1", seed: 17, freq: "0.11 0.06", scale: 5 },
  { id: "stamp-edge-2", seed: 42, freq: "0.08 0.045", scale: 7 },
];

export const STAMP_EDGE_IDS = EDGES.map((edge) => edge.id);

export function InkDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {EDGES.map(({ id, seed, freq, scale }) => (
          <filter
            key={id}
            id={id}
            // Der Filter verschiebt Pixel nach aussen; ohne den grösseren
            // Bereich schneidet die Filterfläche die Franse wieder ab.
            x="-20%"
            y="-35%"
            width="140%"
            height="170%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={freq}
              numOctaves="3"
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
