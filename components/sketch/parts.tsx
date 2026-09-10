/**
 * Bausteine, die in mehreren Zeichnungen vorkommen.
 *
 * Sie stehen hier und nicht in jeder Datei einzeln, damit Nadelbaum und
 * Zelt im Splash und in den Leerzuständen wirklich dieselbe Hand haben –
 * derselbe Zackenrhythmus, dieselben Strichstärken.
 */

/**
 * Nadelbaum als gefüllte Silhouette.
 *
 * Der Umriss läuft aussen an den Astspitzen entlang und springt dazwischen
 * zum Stamm zurück; genau diese Zacken machen den Baum aus. Rechts ist er
 * bewusst nicht die exakte Spiegelung der linken Seite – ein symmetrischer
 * Baum sieht gestempelt aus.
 */
export function Fir({
  x,
  y,
  scale = 1,
  opacity = 1,
}: {
  x: number;
  /** Höhe der Grundlinie – der Stamm endet genau hier. */
  y: number;
  scale?: number;
  opacity?: number;
}) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      fill="currentColor"
      stroke="none"
      opacity={opacity}
    >
      <path
        d="M0 -142
           L-5 -116 L-1 -118
           L-11 -96 L-3 -98
           L-19 -74 L-5 -77
           L-27 -51 L-7 -55
           L-35 -27 L-8 -32
           L-44 -2 L-9 -8
           L9 -8 L45 -3
           L9 -33 L36 -28
           L8 -56 L28 -52
           L6 -78 L20 -75
           L4 -99 L12 -97
           L2 -119 L6 -117 Z"
      />
      {/* Stamm, unten leicht breiter – er endet auf der Grundlinie */}
      <path d="M-3.4 -14 L3.4 -14 L4.6 1 L-4.6 1 Z" />
    </g>
  );
}

/**
 * Firstzelt im Umriss, mit Schraffur auf der Schattenseite und
 * abgespannten Heringen. Gefüllt wird nur die Türöffnung – sie ist das
 * einzige wirklich dunkle Stück am Zelt.
 */
export function Tent({
  x,
  y,
  scale = 1,
}: {
  x: number;
  y: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Schraffur auf der Giebelseite, unter dem Umriss */}
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.32">
        <path d="M-40 1 L-24 -34" />
        <path d="M-34 1 L-21 -42" />
        <path d="M-28 1 L-25 -18" />
      </g>

      <g stroke="currentColor" strokeWidth="2.3" fill="none">
        {/* Giebel vorne */}
        <path d="M-45 2 L-28 -50 L-11 2" />
        {/* Firstlinie in die Tiefe und die hintere Kante */}
        <path d="M-28 -50 L26 -44 L43 1" />
        {/* Traufe */}
        <path d="M-45 2 L-11 2 L43 1" />
      </g>

      {/* Eingang: das einzige wirklich dunkle Stück am Zelt */}
      <path
        d="M-28 -44 L-19 2 L-31 2 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.8"
      />

      {/* Gekreuzte Stangen über beiden Firstenden */}
      <g stroke="currentColor" strokeWidth="1.7" opacity="0.9">
        <path d="M-35 -58 L-21 -44" />
        <path d="M-21 -58 L-35 -44" />
        <path d="M20 -52 L32 -38" />
        <path d="M32 -52 L20 -38" />
      </g>

      {/* Abspannungen mit Heringen */}
      <g stroke="currentColor" strokeWidth="1.4" opacity="0.8">
        <path d="M-28 -55 L-59 4" />
        <path d="M26 -49 L54 3" />
        <path d="M-59 0 L-59 8" />
        <path d="M54 -1 L54 7" />
      </g>
    </g>
  );
}

/** Lagerfeuer: gefüllte Scheite, Flamme darüber, aufsteigender Rauch. */
export function Campfire({
  x,
  y,
  scale = 1,
  smoke = true,
}: {
  x: number;
  y: number;
  scale?: number;
  smoke?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {smoke && (
        <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.45">
          <path d="M-3 -32 Q-10 -43 -3 -53 Q4 -63 -2 -73" />
          <path d="M8 -29 Q2 -39 9 -48 Q15 -57 10 -65" />
        </g>
      )}
      {/* Flamme: kräftiger Kern, darüber eine feinere Zunge */}
      {/* Flamme mit zwei Zungen – ein glatter Tropfen sieht aus wie
          eine Kerze, nicht wie Feuer */}
      <path
        d="M-8 -3 Q-13 -14 -6 -23 Q-7 -15 -2 -18 Q-5 -28 2 -36
           Q1 -25 6 -22 Q12 -18 9 -9 Q8 -5 11 -3 Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M-1 -22 Q-5 -29 1 -35 Q0 -28 4 -27 Q7 -25 5 -22 Z"
        fill="currentColor"
        stroke="none"
        opacity="0.45"
      />
      {/* Zwei kleine Zungen neben dem Kern – erst sie machen aus der
          Fläche ein Feuer */}
      <g stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.75">
        <path d="M-11 -4 Q-15 -11 -12 -17" />
        <path d="M13 -5 Q17 -12 14 -19" />
      </g>
      {/* Scheite: zwei schmale Stöcke, gekreuzt */}
      <g fill="currentColor" stroke="none">
        <path d="M-20 1 L15 -5 L16 -1 L-19 5 Z" />
        <path d="M-15 -5 L20 0 L19 4 L-16 -1 Z" opacity="0.85" />
      </g>
    </g>
  );
}
