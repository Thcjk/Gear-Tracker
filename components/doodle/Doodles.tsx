/**
 * Kleine handgezeichnete Deko-Elemente.
 *
 * Würze, nicht Hauptbestandteil: sie zeichnen mit currentColor, tragen
 * aria-hidden und stehen nur dort, wo sonst eine harte Kante oder eine
 * leere Ecke wäre.
 */

/** Kompassrose – Deko im Listenkopf und auf dem Startbildschirm. */
export function Compass({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Zwei Ringe, der äussere absichtlich nicht ganz geschlossen */}
      <path
        d="M32 5 Q56 6 58 31 Q59 55 33 58 Q9 59 6 34 Q5 10 30 5"
        strokeWidth="2"
      />
      <path
        d="M32 13 Q48 14 50 30 Q51 45 33 47 Q17 48 15 32 Q14 17 30 13"
        strokeWidth="1.4"
        opacity="0.6"
      />
      {/* Nadel: die Nordspitze gefüllt, der Rest offen */}
      <path d="M32 15 L38 33 L32 30 Z" fill="currentColor" stroke="none" />
      <path d="M32 45 L26 31 L32 30 Z" strokeWidth="1.8" />
      {/* Himmelsrichtungen als kurze Striche */}
      <path
        d="M32 8 L32 11 M56 32 L53 32 M32 56 L32 53 M8 32 L11 32"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Gestrichelte, leicht wellige Wegpunkt-Linie zwischen zwei Abschnitten.
 *
 * Sie ersetzt die harte Trennlinie: auf einer Pinnwand trennt man mit
 * einem Strich vom Bleistift, nicht mit einem Lineal.
 */
export function WaypointLine({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 16"
      preserveAspectRatio="none"
      className={`h-4 w-full ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden
    >
      <path
        d="M6 9 Q44 4 82 9 Q120 14 158 8 Q196 3 234 9 Q272 14 314 8"
        strokeWidth="2"
        strokeDasharray="1 9"
        opacity="0.75"
      />
    </svg>
  );
}

/**
 * Kleiner gebogener Pfeil als Verbindungselement, etwa vom Fortschritts-
 * text zur Liste darunter.
 */
export function DoodleArrow({
  className = "h-8 w-8",
  flip = false,
}: {
  className?: string;
  /** Spiegelt den Pfeil, damit er auch nach links zeigen kann. */
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M7 8 Q26 9 29 30" strokeWidth="2.2" />
      <path d="M23 24 L29 32 L34 23" strokeWidth="2.2" />
    </svg>
  );
}
