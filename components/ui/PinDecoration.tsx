import type { PinColor, PinPlacement } from "@/lib/pinning";

/**
 * Die drei Befestigungen, mit denen Papier am Brett hängt.
 *
 * Reissnagel, Stecknadel, Büroklammer – drei Dinge, die man aus einer
 * Schublade kennt, nicht drei Varianten desselben Punkts. Der Unterschied
 * muss auf 24 Pixel lesbar sein: der Reissnagel ist eine Kuppe von vorn,
 * die Stecknadel steht schräg und hat einen sichtbaren Schaft, die
 * Büroklammer ist Draht ohne Fläche.
 *
 * Alle drei sitzen so, dass sie über die Papierkante ragen: der obere Teil
 * liegt auf dem Brett, der untere auf dem Blatt. Ein Nagel, der ganz auf
 * dem Papier sitzt, hält nichts.
 *
 * Rein dekorativ: aria-hidden, damit Screenreader nicht bei jeder Karte
 * eine Grafik ankündigen, und pointer-events:none, damit nichts abgefangen
 * wird, was darunter liegt.
 */

const FILL: Record<PinColor, { body: string; light: string; dark: string }> = {
  rust: { body: "#C1502E", light: "#EDB29B", dark: "#8A3419" },
  olive: { body: "#74804B", light: "#C8CDA8", dark: "#3F4527" },
  mustard: { body: "#E3A73E", light: "#FBE9C4", dark: "#8A6210" },
};

/** Metall der Büroklammer – Draht, kein lackiertes Plastik. */
const STEEL = { body: "#8A9298", light: "#DDE4E8", dark: "#4E565B" };

const SHADOW = "drop-shadow-[1px_2px_1.5px_var(--pin-shadow)]";

function Tack({ color }: { color: PinColor }) {
  const tone = FILL[color];
  return (
    <svg viewBox="0 0 28 28" aria-hidden className={`h-6 w-6 ${SHADOW}`}>
      {/* Der Schatten auf dem Papier sitzt versetzt unter der Kuppe. */}
      <ellipse
        cx="15.2"
        cy="19"
        rx="8"
        ry="3.1"
        fill="var(--pin-shadow)"
        opacity="0.45"
      />
      {/* Keine exakte Kreisform: leicht oval, sonst wirkt sie wie ein
          Aufzählungspunkt. */}
      <path
        d="M14 3.6 Q21.4 4.2 22 11 Q22.4 17.4 14.4 18 Q6.2 18.2 5.8 11.4 Q5.4 4.2 14 3.6 Z"
        fill={tone.body}
      />
      {/* Die Kuppe fällt nach unten ab und wird dort dunkler. */}
      <path
        d="M6.6 12.6 Q14 19.4 21.6 13.2 Q20.8 17.6 14.3 18 Q7.6 17.9 6.6 12.6 Z"
        fill={tone.dark}
        opacity="0.55"
      />
      <path
        d="M9.8 7 Q12.4 5.2 15.6 6.2 Q12.4 6.8 11 9.4 Z"
        fill={tone.light}
        opacity="0.95"
      />
    </svg>
  );
}

function Needle({ color }: { color: PinColor }) {
  const tone = FILL[color];
  return (
    <svg viewBox="0 0 28 36" aria-hidden className={`h-8 w-6 ${SHADOW}`}>
      {/* Der Schaft verschwindet im Papier – deshalb liegt der Schatten
          neben ihm und endet dort, wo er einsticht. */}
      <path
        d="M14.6 15.5 L22.6 32.4"
        stroke="var(--pin-shadow)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M13.6 14.5 L21.6 31.4"
        stroke={STEEL.dark}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M13.4 15.4 L20.4 30.2"
        stroke={STEEL.light}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Der Kopf ist eine Perle, keine Kuppe: sie steht frei über dem
          Blatt und bekommt deshalb rundum Licht. */}
      <circle cx="11.4" cy="10.2" r="7.2" fill={tone.body} />
      <path
        d="M11.4 3 A7.2 7.2 0 0 1 18.6 10.2 A7.2 7.2 0 0 1 11.4 17.4 Z"
        fill={tone.dark}
        opacity="0.35"
      />
      <ellipse
        cx="8.6"
        cy="7.2"
        rx="2.6"
        ry="1.9"
        fill={tone.light}
        opacity="0.9"
        transform="rotate(-28 8.6 7.2)"
      />
    </svg>
  );
}

function Clip() {
  /**
   * Eine Büroklammer ist ein einziger gebogener Draht: innen hoch, oben
   * herum, aussen ganz nach unten, unten herum und wieder ein Stück hoch.
   * Genau das zeichnet der Pfad – zwei ineinandergelegte Bögen wären
   * eine Brosche, keine Klammer.
   */
  const wire = "M14.6 27 L14.6 10 A5.3 5.3 0 0 0 4 10 L4 32 A5.8 5.8 0 0 0 15.6 32 L15.6 15";
  return (
    <svg viewBox="0 0 22 40" aria-hidden className={`h-9 w-5 ${SHADOW}`}>
      <path
        d={wire}
        fill="none"
        stroke={STEEL.dark}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={wire}
        fill="none"
        stroke={STEEL.body}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ein Draht glänzt auf einer Seite – ohne diese Linie sieht die
          Klammer aus wie mit dem Filzstift gemalt. */}
      <path
        d={wire}
        fill="none"
        stroke={STEEL.light}
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
        transform="translate(-0.45 -0.45)"
      />
    </svg>
  );
}

/**
 * Wie weit die Befestigung über die obere Papierkante ragt. Jede Form hat
 * ihren eigenen Wert: der Reissnagel liegt fast auf dem Blatt, die
 * Stecknadel steht darüber, die Klammer wird über die Kante geschoben.
 */
const TOP_OFFSET: Record<PinPlacement["type"], string> = {
  tack: "-10px",
  pin: "-15px",
  clip: "-13px",
};

export function PinDecoration({ placement }: { placement: PinPlacement }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-10 block"
      style={{
        top: TOP_OFFSET[placement.type],
        left: `${placement.left}%`,
        transform: `translateX(-50%) rotate(${placement.rotate}deg)`,
      }}
    >
      {placement.type === "tack" && <Tack color={placement.color} />}
      {placement.type === "pin" && <Needle color={placement.color} />}
      {placement.type === "clip" && <Clip />}
    </span>
  );
}
