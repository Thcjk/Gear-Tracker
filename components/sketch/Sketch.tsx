/**
 * Gemeinsames Gerüst der Sketch-Illustrationen – Kohlestift auf Papier.
 *
 * Drei Dinge machen den Stil aus, und alle drei stecken hier:
 *
 * 1. Rauer Rand. Ein feTurbulence-Rauschen verschiebt über
 *    feDisplacementMap jede Kante um Bruchteile einer Einheit. Ohne das
 *    sehen SVG-Pfade nach Piktogramm aus, nicht nach Kohle. Die Stärke ist
 *    bewusst klein: bei mehr zerfallen dünne Linien.
 * 2. Gefüllte Massen statt reiner Umrisse. Ein Nadelbaum ist eine dunkle
 *    Fläche mit zerfranstem Rand, kein Strichbild.
 * 3. Bodenschatten. Ein weicher, breiter Wischer unter dem Motiv – er
 *    stellt die Zeichnung auf den Boden, statt sie schweben zu lassen.
 *
 * Farbe kommt durchweg über currentColor. Eine Textfarbe am Elternelement
 * genügt, und weil das text-accent ist, dreht sich alles mit dem Theme.
 */
import type { ReactNode } from "react";

export interface SketchProps {
  className?: string;
  /** Nur setzen, wenn die Zeichnung Information trägt statt zu schmücken. */
  title?: string;
}

/**
 * Die Filter-Kennung ist pro Zeichnung fest und nicht zufällig: zwei
 * Exemplare derselben Illustration auf einer Seite sollen sich denselben
 * Filter teilen, und ein stabiler Wert überlebt das Server-Rendering ohne
 * Hydration-Differenz.
 */
export function SketchFrame({
  viewBox,
  filterId,
  className = "",
  title,
  children,
}: SketchProps & { viewBox: string; filterId: string; children: ReactNode }) {
  const rough = `${filterId}-rough`;
  // Der Wischer des Bodenschattens wird von Ground benutzt, nicht hier.
  const smudge = `${filterId}-smudge`;

  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        {/* Reichlich Rand, sonst schneidet der Filter die verschobenen
            Kanten an den Rändern ab. */}
        <filter id={rough} x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.62"
            numOctaves="3"
            seed="11"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={smudge} x="-25%" y="-120%" width="150%" height="340%">
          <feGaussianBlur stdDeviation="1.9" />
        </filter>
      </defs>
      <g filter={`url(#${rough})`}>{children}</g>
    </svg>
  );
}

/**
 * Der Bodenschatten – ein Kohlewischer unter dem Motiv.
 *
 * Zwei Lagen übereinander: ein breiter weicher Hof und darin ein
 * dunklerer, schmalerer Kern. Beide sind Linsenformen, laufen also zu
 * beiden Seiten spitz aus, statt an einer Kante abzubrechen. Genau das
 * macht den Unterschied zwischen "Schatten" und "grauer Balken".
 *
 * Ohne diese Fläche schwebt jede Zeichnung; mit ihr steht sie.
 */
export function Ground({
  filterId,
  y,
  x1,
  x2,
  opacity = 0.42,
}: {
  filterId: string;
  /** Höhe der Standlinie. */
  y: number;
  x1: number;
  x2: number;
  opacity?: number;
}) {
  const mid = (x1 + x2) / 2;
  const w = x2 - x1;
  // Der Hof reicht weiter nach unten als nach oben: Licht kommt von oben.
  const halo = `M${x1} ${y} Q${mid} ${y - 5.5} ${x2} ${y} Q${mid} ${y + 10} ${x1} ${y} Z`;
  const inset = w * 0.14;
  const core = `M${x1 + inset} ${y} Q${mid} ${y - 3.2} ${x2 - inset} ${y} Q${mid} ${y + 4.6} ${x1 + inset} ${y} Z`;

  return (
    <g fill="currentColor" stroke="none">
      <path
        d={halo}
        opacity={opacity * 0.55}
        filter={`url(#${filterId}-smudge)`}
      />
      <path d={core} opacity={opacity} />
    </g>
  );
}
