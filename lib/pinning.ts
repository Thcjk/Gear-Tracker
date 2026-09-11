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

/** −1.5° bis +1.5°, in Viertelschritten – mehr wirkt schnell schlampig. */
export function tiltFor(seed: string): number {
  const steps = hash(seed) % 13; // 0…12
  return (steps - 6) / 4;
}

export type PinColor = "rust" | "olive" | "mustard";

const PIN_COLORS: PinColor[] = ["rust", "olive", "mustard"];

/** Farbe des Reissnagels, ebenfalls stabil aus der ID. */
export function pinColorFor(seed: string): PinColor {
  // Ein zweiter Durchlauf mit verändertem Startwert, damit Farbe und
  // Winkel nicht aneinander gekoppelt sind.
  return PIN_COLORS[hash(`${seed}#pin`) % PIN_COLORS.length];
}
