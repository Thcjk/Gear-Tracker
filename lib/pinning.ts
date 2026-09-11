/**
 * Zufällig aussehende, aber stabile Werte pro Karte.
 *
 * Die Drehung muss über Re-Renders hinweg gleich bleiben – eine Karte, die
 * beim Abhaken einer Checkbox ihren Winkel ändert, sieht nach Fehler aus,
 * nicht nach Pinnwand. Deshalb wird sie aus der ID berechnet und nicht
 * gewürfelt; dieselbe ID ergibt immer dasselbe Ergebnis, auch zwischen
 * Server-Rendering und Hydration.
 */

/** Kleine, stabile Hash-Funktion (FNV-1a-artig, ohne Abhängigkeit). */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Ein Wert aus [0, buckets) – jede Eigenschaft bekommt ihren eigenen
 * Namensraum, sonst laufen Winkel, Farbe und Nadeltyp im Gleichschritt.
 */
function pick(seed: string, namespace: string, buckets: number): number {
  return hash(`${seed}#${namespace}`) % buckets;
}

/** −1.5° bis +1.5°, in Viertelschritten – mehr wirkt schnell schlampig. */
export function tiltFor(seed: string): number {
  const steps = hash(seed) % 13; // 0…12
  return (steps - 6) / 4;
}

export type PinColor = "rust" | "olive" | "mustard";

const PIN_COLORS: PinColor[] = ["rust", "olive", "mustard"];

/** Farbe des Reissnagels, ebenfalls stabil aus der ID. */
export function pinColorFor(seed: string): PinColor {
  return PIN_COLORS[pick(seed, "pin", PIN_COLORS.length)];
}

/* ------------------------------------------------------------------ *
 * Papierkanten
 * ------------------------------------------------------------------ */

/**
 * Ungleichmässige Eckenradien.
 *
 * Ein Blatt, das aus einem Block gerissen oder mit der Schere geschnitten
 * wurde, hat vier verschieden runde Ecken. border-radius nimmt dafür acht
 * Werte: vier für die waagerechten, vier für die senkrechten Halbachsen.
 * Sind sie ungleich, wird aus dem Viertelkreis eine Ellipse – genau der
 * leicht schiefe Eindruck, den ein geschnittenes Blatt hat.
 *
 * Die Abweichung bleibt klein (±7 px um den Kartenradius von 24 px).
 * Grössere Werte sehen nicht nach Papier aus, sondern nach Fehler im
 * Stylesheet.
 */
const RADIUS_BASE = 24;

export function cornerRadiusFor(seed: string): string {
  const at = (namespace: string) =>
    RADIUS_BASE - 7 + pick(seed, namespace, 15); // 17…31 px
  const h = [at("r1"), at("r2"), at("r3"), at("r4")];
  const v = [at("r5"), at("r6"), at("r7"), at("r8")];
  return `${h.join("px ")}px / ${v.join("px ")}px`;
}

/* ------------------------------------------------------------------ *
 * Nadeln
 * ------------------------------------------------------------------ */

export type PinType = "tack" | "pin" | "clip";

const PIN_TYPES: PinType[] = ["tack", "pin", "clip"];

export interface PinPlacement {
  type: PinType;
  color: PinColor;
  /** Waagerechte Lage in Prozent der Kartenbreite. */
  left: number;
  /** Drehung in Grad – keine Nadel steckt exakt senkrecht. */
  rotate: number;
  /** Eigener Schlüssel für die React-Liste. */
  key: string;
}

/**
 * Wie viele Nadeln eine Karte bekommt und wo sie sitzen.
 *
 * Eine Nadel ist der Normalfall; jede dritte Karte bekommt zwei, damit
 * das Brett nicht wie ein Raster aus identisch befestigten Zetteln
 * aussieht. Zwei Nadeln sitzen an den oberen Ecken, eine sitzt aussermittig
 * – mittig wirkt sie wie ein Aufzählungspunkt über der Überschrift.
 *
 * Alle Werte stammen aus der Element-ID: dieselbe Karte hat nach einem
 * Reload dieselben Nadeln an derselben Stelle.
 */
export function pinsFor(seed: string, count?: 1 | 2): PinPlacement[] {
  const two = count === undefined ? pick(seed, "count", 3) === 0 : count === 2;

  if (two) {
    // Zwei gleiche Nadeln an einer Karte sehen aus wie ein Raster, nicht
    // wie eine Schublade: die rechte wird aus den beiden übrigen Typen
    // gewählt.
    const left = pick(seed, "typeL", PIN_TYPES.length);
    const rest = PIN_TYPES.filter((_, i) => i !== left);
    return [
      {
        type: PIN_TYPES[left],
        color: PIN_COLORS[pick(seed, "colorL", PIN_COLORS.length)],
        // Nicht weiter aussen: dort ist wegen des Eckenradius kein
        // Papier mehr, und die Klammer hinge in der Luft.
        left: 12 + pick(seed, "posL", 5), // 12…16 %
        rotate: pick(seed, "rotL", 9) - 4,
        key: "l",
      },
      {
        type: rest[pick(seed, "typeR", rest.length)],
        color: PIN_COLORS[pick(seed, "colorR", PIN_COLORS.length)],
        left: 80 + pick(seed, "posR", 5), // 80…84 %
        rotate: pick(seed, "rotR", 9) - 4,
        key: "r",
      },
    ];
  }

  return [
    {
      type: PIN_TYPES[pick(seed, "typeS", PIN_TYPES.length)],
      color: pinColorFor(seed),
      // Nie zwischen 44 % und 56 %: mittig sieht die Nadel wie ein
      // Aufzählungszeichen aus, nicht wie eine Befestigung.
      left: pick(seed, "sideS", 2) === 0
        ? 12 + pick(seed, "posS", 20) // 12…31 %
        : 66 + pick(seed, "posS", 20), // 66…85 %
      rotate: pick(seed, "rotS", 11) - 5,
      key: "s",
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Stempel
 * ------------------------------------------------------------------ */

export interface StampLook {
  /** −3° bis +3°: schief aufgedrückt, aber nicht umgefallen. */
  tilt: number;
  /** Welche der drei ausgefransten Kanten (components/ui/InkDefs). */
  edge: number;
}

export function stampLookFor(seed: string): StampLook {
  return {
    tilt: (pick(seed, "stampTilt", 13) - 6) / 2,
    edge: pick(seed, "stampEdge", 3),
  };
}
