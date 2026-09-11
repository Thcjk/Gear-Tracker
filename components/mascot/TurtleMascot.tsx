"use client";

/**
 * Die Schildkröte trägt, was in der Packliste steht.
 *
 * Fünf Stufen mit festen Grenzen; der Stapel wächst mit dem Gewicht und
 * die Haltung wird schwerer. Ab Stufe 4 beugt sie sich vor und schwankt
 * leicht – das ist keine Dekoration, sondern die schnellste Art, ein
 * Gewicht einzuordnen, ohne eine Zahl zu lesen.
 *
 * Die Figur ist flächig koloriert und nicht skizziert: sie ist das eine
 * Element, das aus der Papierfläche heraussticht.
 */

export type PackStage = 1 | 2 | 3 | 4 | 5;

/** Feste Grenzen, absichtlich ohne Hysterese – sie stehen auch im Text. */
export function getPackStage(totalWeightGrams: number): PackStage {
  if (totalWeightGrams < 3000) return 1;
  if (totalWeightGrams < 6000) return 2;
  if (totalWeightGrams < 9000) return 3;
  if (totalWeightGrams < 12000) return 4;
  return 5;
}

export const STAGE_LABEL: Record<PackStage, string> = {
  1: "leicht unterwegs",
  2: "gut gepackt",
  3: "ordentlich beladen",
  4: "schwer beladen",
  5: "hoffnungslos überladen",
};

const INK = "#263241";
const RUST = "#C1502E";
const MUSTARD = "#E3A73E";
const DENIM = "#4A6079";
const PAPER = "#F3ECDC";
/** Der Panzer der Stufe-4-Kiste greift den Grundton auf. */
const CRATE = "#74804B";

/* ------------------------------------------------------------------ *
 * Panzer-Varianten
 *
 * Nur die Optik der Schildkröte unterscheidet sich – Form, Haltung und
 * die Gepäck-Mechanik sind in allen Varianten identisch. Der Grundton
 * bleibt olivgrün; was wechselt, ist die Tiefe des Grüns und das Muster
 * auf dem Panzer.
 * ------------------------------------------------------------------ */

type Motif = "lines" | "spots" | "rings";

interface TurtleVariant {
  shell: string;
  skin: string;
  /** Farbe des Panzermusters. */
  pattern: string;
  motif: Motif;
}

export const TURTLE_VARIANTS: TurtleVariant[] = [
  // 0 – die klassische: Felder in dunklerem Oliv
  { shell: "#74804B", skin: "#8C9A5C", pattern: "#616B3F", motif: "lines" },
  // 1 – Flecken in Rust
  { shell: "#7E8A52", skin: "#8C9A5C", pattern: "#C1502E", motif: "spots" },
  // 2 – Ringe in Mustard, etwas tieferes Grün
  { shell: "#6B7745", skin: "#869359", pattern: "#E3A73E", motif: "rings" },
  // 3 – Streifen in gedecktem Blau
  { shell: "#77834F", skin: "#8C9A5C", pattern: "#4A6079", motif: "lines" },
];

/**
 * Wählt die Variante aus der Kennung der Packliste.
 *
 * Deterministisch und nicht gewürfelt: dieselbe Liste soll immer dieselbe
 * Schildkröte zeigen, sonst wechselt sie bei jedem Rendern das Aussehen –
 * und zwischen Server-Rendering und Hydration gäbe es eine Differenz.
 */
export function getTurtleVariant(
  packingListId: string,
  variantCount: number = TURTLE_VARIANTS.length,
): number {
  let hash = 0;
  for (let i = 0; i < packingListId.length; i += 1) {
    hash = (hash << 5) - hash + packingListId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % variantCount;
}

/** Ein Gepäckstück. Alle Stücke teilen sich Kontur und Eckenradius. */
function Item({
  x,
  y,
  w,
  h,
  fill,
  rx = 8,
  strap,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  rx?: number;
  /** Senkrechter Gurt über das Stück – macht aus einem Kasten Gepäck. */
  strap?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={fill}
        stroke={INK}
        strokeWidth="4"
      />
      {strap && (
        <rect
          x={x + w * 0.34}
          y={y - 2}
          width={w * 0.16}
          height={h + 4}
          fill={PAPER}
          stroke={INK}
          strokeWidth="3"
          rx="2"
        />
      )}
    </g>
  );
}

/** Zusammengerollter Schlafsack: Zylinder von der Seite. */
function Roll({
  x,
  y,
  w,
  h,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={h / 2}
        fill={fill}
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d={`M${x + 11} ${y + 4} Q${x + 6} ${y + h / 2} ${x + 11} ${y + h - 4}`}
        fill="none"
        stroke={INK}
        strokeWidth="3"
        opacity="0.7"
      />
    </g>
  );
}

/** Kochtopf mit Bügel – das Stück, das bei Stufe 5 oben aufsitzt. */
function Pot({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path
        d={`M${x + 6} ${y + 4} Q${x + 22} ${y - 12} ${x + 38} ${y + 4}`}
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
      />
      <path
        d={`M${x} ${y + 4} L${x + 44} ${y + 4} L${x + 39} ${y + 28} Q${x + 22} ${y + 33} ${x + 5} ${y + 28} Z`}
        fill={DENIM}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Luggage({ stage }: { stage: PackStage }) {
  return (
    <g>
      {/* Stufe 1: ein kompaktes Bündel direkt auf dem Panzer */}
      <Item x={100} y={112} w={56} h={26} fill={RUST} strap />
      {stage >= 2 && <Roll x={94} y={84} w={68} h={26} fill={DENIM} />}
      {stage >= 3 && (
        /* Zelt-Bündel: lang und quer, ragt über den Panzer hinaus */
        <Roll x={84} y={58} w={88} h={24} fill={MUSTARD} />
      )}
      {stage >= 4 && <Item x={96} y={30} w={62} h={26} fill={CRATE} strap />}
      {stage >= 5 && (
        <>
          {/* Der Stapel kippt jetzt sichtbar nach vorne */}
          <g transform="rotate(-5 128 18)">
            <Item x={88} y={2} w={82} h={26} fill={RUST} rx={10} strap />
            <Pot x={106} y={-26} />
          </g>
          {/* Ein Becher baumelt seitlich am Stapel */}
          <path
            d="M92 44 Q84 54 86 66"
            fill="none"
            stroke={INK}
            strokeWidth="3"
          />
          <path
            d="M76 66 L98 66 L95 82 Q86 86 79 82 Z"
            fill={MUSTARD}
            stroke={INK}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </>
      )}
    </g>
  );
}

/** Das Muster auf dem Panzer – je Variante eine andere Handschrift. */
function ShellPattern({ variant }: { variant: TurtleVariant }) {
  if (variant.motif === "spots") {
    return (
      <g fill={variant.pattern} stroke="none" opacity="0.9">
        <ellipse cx="96" cy="168" rx="11" ry="9" />
        <ellipse cx="134" cy="156" rx="13" ry="10" />
        <ellipse cx="172" cy="172" rx="10" ry="8" />
        <ellipse cx="114" cy="190" rx="8" ry="6" />
        <ellipse cx="156" cy="188" rx="9" ry="7" />
      </g>
    );
  }
  if (variant.motif === "rings") {
    return (
      <g fill="none" stroke={variant.pattern} strokeWidth="4">
        <ellipse cx="98" cy="170" rx="12" ry="10" />
        <ellipse cx="136" cy="158" rx="14" ry="11" />
        <ellipse cx="174" cy="174" rx="11" ry="9" />
      </g>
    );
  }
  return (
    <g stroke={variant.pattern} strokeWidth="4" fill="none">
      <path d="M96 140 Q92 172 94 198" />
      <path d="M132 136 Q132 168 133 198" />
      <path d="M168 140 Q172 170 172 198" />
    </g>
  );
}

function Turtle({ variant }: { variant: TurtleVariant }) {
  const { shell, skin } = variant;
  return (
    <g>
      {/* Hinterbein und Schwanz liegen hinter dem Panzer */}
      <path
        d="M78 196 Q68 214 82 220 Q98 224 100 204 Z"
        fill={skin}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M60 190 Q44 190 34 180 Q46 188 58 182 Z"
        fill={skin}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Panzer */}
      <path
        d="M58 200 Q62 142 128 136 Q196 132 202 198 Z"
        fill={shell}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Panzermuster – der einzige Unterschied zwischen den Varianten.
          Es wird vom Panzerrand beschnitten, damit Flecken und Ringe nicht
          über die Kontur hinauslaufen. */}
      <g clipPath="url(#turtle-shell-clip)">
        <ShellPattern variant={variant} />
      </g>
      {/* Kontur zuletzt, damit das Muster sauber anliegt */}
      <path
        d="M58 200 Q62 142 128 136 Q196 132 202 198 Z"
        fill="none"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Bauchrand */}
      <path
        d="M52 198 Q128 218 208 196 Q202 210 128 224 Q58 212 52 198 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Hals und Kopf */}
      <path
        d="M198 190 Q224 186 234 164 Q244 140 224 132 Q202 128 200 156 Q198 174 192 184 Z"
        fill={skin}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="225" cy="150" r="4.5" fill={INK} />
      <path
        d="M233 165 Q240 166 243 162"
        fill="none"
        stroke={INK}
        strokeWidth="3"
      />

      {/* Vorderbein */}
      <path
        d="M176 200 Q176 220 192 222 Q208 222 206 202 Z"
        fill={skin}
        stroke={INK}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function TurtleMascot({
  totalWeightGrams,
  variant = 0,
  animated = true,
  className = "",
  title,
}: {
  totalWeightGrams: number;
  /** Panzer-Variante 0–3, üblicherweise aus getTurtleVariant(list.id). */
  variant?: number;
  animated?: boolean;
  className?: string;
  /** Gesetzt macht die Figur für Screenreader lesbar statt dekorativ. */
  title?: string;
}) {
  const stage = getPackStage(totalWeightGrams);
  const look = TURTLE_VARIANTS[variant % TURTLE_VARIANTS.length];
  // Ab Stufe 3 geht sie in die Knie; der Winkel ist klein, sonst kippt die
  // Figur optisch um, statt schwer zu wirken.
  const lean = stage >= 4 ? 5 : stage === 3 ? 2.5 : 0;
  const heavy = stage >= 4;

  return (
    <span
      className={`inline-block ${animated ? "animate-walk-in" : ""} ${className}`}
    >
      {/* Der Rahmen reicht nach oben über die Figur hinaus: bei Stufe 5
          türmt sich der Stapel höher als die Schildkröte, und ein
          quadratischer Ausschnitt würde ihm den Kopf abschneiden. */}
      <svg
        viewBox="0 -46 260 306"
        className="h-full w-full"
        role={title ? "img" : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        <defs>
          {/* Der Panzerrand beschneidet das Muster. Die Kennung ist fest
              und nicht zufällig: mehrere Schildkröten auf einer Seite
              sollen sich denselben Pfad teilen. */}
          <clipPath id="turtle-shell-clip">
            <path d="M58 200 Q62 142 128 136 Q196 132 202 198 Z" />
          </clipPath>
        </defs>
        {/* Bodenschatten – ohne ihn schwebt die Figur */}
        <ellipse cx="132" cy="234" rx="86" ry="11" fill={INK} opacity="0.18" />
        <g
          className={heavy && animated ? "animate-sway" : undefined}
          style={{ transformOrigin: "132px 226px", transformBox: "view-box" }}
        >
          <g transform={`rotate(${lean} 132 220)`}>
            <Turtle variant={look} />
            <Luggage stage={stage} />
          </g>
        </g>
      </svg>
    </span>
  );
}
