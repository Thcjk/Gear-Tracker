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
 * Pfeil als Verbindungselement, in drei Handschriften.
 *
 * "curved" biegt nach unten ab, "hook" holt weit aus, "straight" ist der
 * knappe Strich. Drei Formen, damit nicht an jeder Stelle derselbe Pfeil
 * klebt – gleich ausgerichtete Wiederholung sieht nach Symbolsatz aus,
 * nicht nach Hand.
 */
export function DoodleArrow({
  className = "h-8 w-8",
  variant = "curved",
  flip = false,
}: {
  className?: string;
  variant?: "curved" | "straight" | "hook";
  /** Spiegelt den Pfeil, damit er auch nach links zeigen kann. */
  flip?: boolean;
}) {
  const shapes = {
    curved: ["M7 8 Q26 9 29 30", "M23 24 L29 32 L34 23"],
    straight: ["M6 14 Q20 17 33 21", "M26 15 L34 21 L26 27"],
    hook: ["M9 32 Q6 12 22 9 Q34 7 33 20", "M27 15 L33 22 L38 14"],
  } as const;
  const [body, head] = shapes[variant];
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
      <path d={body} strokeWidth="2.2" />
      <path d={head} strokeWidth="2.2" />
    </svg>
  );
}

/**
 * Fussspuren-Pfad: eine Reihe kleiner Abdrücke, links und rechts versetzt
 * wie ein echter Gang. Die Abdrücke stehen bewusst nicht auf einer Linie
 * und sind unterschiedlich gedreht.
 */
export function Footprints({ className = "h-6 w-40" }: { className?: string }) {
  const steps = [
    { x: 6, y: 15, r: -18 },
    { x: 26, y: 8, r: -10 },
    { x: 46, y: 17, r: -22 },
    { x: 68, y: 9, r: -6 },
    { x: 90, y: 16, r: -16 },
    { x: 112, y: 8, r: -12 },
    { x: 134, y: 15, r: -20 },
  ];
  return (
    <svg
      viewBox="0 0 150 28"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      {steps.map((s) => (
        <g key={`${s.x}-${s.y}`} transform={`translate(${s.x} ${s.y}) rotate(${s.r})`}>
          {/* Ballen und drei Zehen – auf dieser Grösse reicht das */}
          <ellipse cx="0" cy="3" rx="3.1" ry="4.2" />
          <circle cx="-2.6" cy="-2.2" r="1.05" />
          <circle cx="0.2" cy="-3.2" r="1.05" />
          <circle cx="2.9" cy="-2" r="1.05" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Lagerplatz-Markierung: ein Kreuz im offenen Kreis, wie auf einer
 * Wanderkarte. Der Kreis ist gestrichelt und hat eine Lücke – ein
 * geschlossener Ring sähe nach Symbol aus, nicht nach Notiz.
 */
export function CampMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden
    >
      <path
        d="M20 4 Q35 5 36 20 Q37 35 21 36 Q6 37 4 22 Q3 8 17 4"
        strokeWidth="1.8"
        strokeDasharray="4 3.5"
      />
      <path d="M13 13 L27 27 M27 13 L13 27" strokeWidth="2.6" />
    </svg>
  );
}
