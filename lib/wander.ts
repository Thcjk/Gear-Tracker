/**
 * Wann welche Deko-Schildkröte läuft.
 *
 * Auf einem Bildschirm soll höchstens eine gleichzeitig unterwegs sein.
 * Die Überquerung belegt ein Viertel des Zyklus, bei 32 s also 8 s. Zwei
 * Figuren überschneiden sich folglich nicht, solange ihre Startversätze
 * mehr als 8 s auseinanderliegen – und solange es nicht mehr Figuren gibt
 * als der Zyklus Fenster hat.
 */

/** Vollständiger Zyklus inklusive Pause, in Sekunden. */
export const WANDER_CYCLE = 32;

/** Abstand zweier Startversätze – bequem über den 8 s Laufzeit. */
const SLOT_SECONDS = 11;

/** So viele Figuren passen nebeneinander in den Zyklus. */
const MAX_SLOTS = 3;

/**
 * Versatz für die Karte an dieser Position – oder null, wenn auf ihr
 * keine Figur laufen soll.
 *
 * Jede dritte Karte bekommt eine, und nur die ersten drei davon: bei
 * zwanzig Listen liefen sonst sieben gleichzeitig, und aus dem Detail
 * würde Unruhe.
 */
export function wanderSlot(index: number): number | null {
  if (index % 3 !== 0) return null;
  const slot = index / 3;
  if (slot >= MAX_SLOTS) return null;
  return slot * SLOT_SECONDS;
}
