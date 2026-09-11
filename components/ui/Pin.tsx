import { pinColorFor, type PinColor } from "@/lib/pinning";

/**
 * Ein Reissnagel.
 *
 * Der Kopf ist keine perfekte Kreisform, sondern leicht oval und mit einem
 * hellen Lichtpunkt oben links – ein exakter Kreis sieht nach Aufzählungs-
 * punkt aus. Darunter liegt ein kleiner Schatten auf dem Papier.
 *
 * Rein dekorativ: aria-hidden, damit Screenreader nicht bei jeder Karte
 * eine Grafik ankündigen, und pointer-events:none, damit der Nagel nichts
 * abfängt, was darunter liegt.
 */
const FILL: Record<PinColor, { body: string; light: string }> = {
  rust: { body: "#C1502E", light: "#EDB29B" },
  olive: { body: "#74804B", light: "#C8CDA8" },
  mustard: { body: "#E3A73E", light: "#FBE9C4" },
};

export function Pin({
  seed,
  className = "",
}: {
  /** Bestimmt die Farbe – dieselbe Karte bekommt immer denselben Nagel. */
  seed: string;
  className?: string;
}) {
  const tone = FILL[pinColorFor(seed)];
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`pointer-events-none absolute h-6 w-6 drop-shadow-[0_1px_1px_var(--pin-shadow)] ${className}`}
    >
      <ellipse cx="12.6" cy="15" rx="6.4" ry="2.6" fill="var(--pin-shadow)" opacity="0.5" />
      <path
        d="M12 3.4 Q17.6 3.8 18 9.2 Q18.3 14 12.4 14.4 Q6.4 14.6 6 9.4 Q5.8 4 12 3.4 Z"
        fill={tone.body}
      />
      <path
        d="M9.4 6.4 Q11.2 5.2 13.2 5.8 Q11 6.2 10.2 8 Z"
        fill={tone.light}
        opacity="0.9"
      />
    </svg>
  );
}
