import { RoughGenerator } from "roughjs/bin/generator";
import type { Drawable } from "roughjs/bin/core";
import type { Category } from "@/types";

/**
 * Handgezeichnete Kategorie-Icons mit Rough.js.
 *
 * Bewusst über RoughGenerator statt über rough.svg()/rough.canvas():
 * der Generator braucht kein DOM und liefert mit toPaths() reine
 * Pfaddaten. Dadurch läuft er auch im statischen Prerender, und mit
 * festem `seed` erzeugen Server und Client exakt dieselben Pfade –
 * kein Hydration-Mismatch, kein useEffect, kein <canvas>.
 * Die Pfade werden pro Icon einmal berechnet und gecacht.
 */

export type SketchType =
  | "tent"
  | "sleeping-bag"
  | "backpack"
  | "pot"
  | "shirt"
  | "chip"
  | "droplet";

const generator = new RoughGenerator();

const BASE = {
  seed: 17,
  roughness: 1.15,
  bowing: 1.6,
  strokeWidth: 1.25,
  stroke: "currentColor",
} as const;

/** Kurze Striche brauchen weniger Wackeln, sonst zerfasern sie. */
const FINE = { ...BASE, roughness: 0.85, bowing: 1.1 } as const;

const SHAPES: Record<SketchType, (g: RoughGenerator) => Drawable[]> = {
  tent: (g) => [
    g.path("M12 4 L21 20 L3 20 Z", BASE),
    g.path("M12 9.5 L16 20 L8 20 Z", FINE),
  ],
  "sleeping-bag": (g) => [
    g.path(
      "M9.5 3 C6.5 6 5 11 5.5 15 C6 19 8.5 21 11.8 21 C15.1 21 17.6 19 18.1 15 C18.6 11 17 6 14.2 3 Z",
      BASE,
    ),
    g.line(11.8, 7, 11.8, 17.5, FINE),
  ],
  backpack: (g) => [
    g.path(
      "M6 9 C6 7 7.5 6 9 6 L15 6 C16.5 6 18 7 18 9 L18 20 L6 20 Z",
      BASE,
    ),
    g.path("M9.5 6 C9.5 3.5 14.5 3.5 14.5 6", FINE),
    g.line(6.5, 13.5, 17.5, 13.5, FINE),
  ],
  pot: (g) => [
    g.rectangle(5.5, 9.5, 13, 9.5, BASE),
    g.line(2.8, 11.5, 5.5, 11.5, FINE),
    g.line(18.5, 11.5, 21.2, 11.5, FINE),
    g.line(4.5, 8, 19.5, 8, FINE),
  ],
  shirt: (g) => [
    g.path(
      "M9 4 L5 6 L3.5 10 L6.5 11.2 L6.5 20 L17.5 20 L17.5 11.2 L20.5 10 L19 6 L15 4 C14.2 6.6 9.8 6.6 9 4 Z",
      BASE,
    ),
  ],
  chip: (g) => [
    g.rectangle(7, 7, 10, 10, BASE),
    g.line(4, 11, 7, 11, FINE),
    g.line(4, 15, 7, 15, FINE),
    g.line(17, 11, 20, 11, FINE),
    g.line(17, 15, 20, 15, FINE),
    g.line(11, 4, 11, 7, FINE),
    g.line(15, 4, 15, 7, FINE),
  ],
  droplet: (g) => [
    g.path(
      "M12 3 C12 3 5 11 5 15 C5 18.9 8.1 21 12 21 C15.9 21 19 18.9 19 15 C19 11 12 3 12 3 Z",
      BASE,
    ),
  ],
};

export const CATEGORY_SKETCH: Record<Category, SketchType> = {
  shelter: "tent",
  "sleep-system": "sleeping-bag",
  backpack: "backpack",
  kitchen: "pot",
  clothing: "shirt",
  electronics: "chip",
  "hygiene-misc": "droplet",
};

export interface SketchPath {
  d: string;
  strokeWidth: number;
}

const cache = new Map<SketchType, SketchPath[]>();

export function getSketchPaths(type: SketchType): SketchPath[] {
  const cached = cache.get(type);
  if (cached) return cached;

  const paths = SHAPES[type](generator).flatMap((drawable) =>
    generator
      .toPaths(drawable)
      .map((p) => ({ d: p.d, strokeWidth: p.strokeWidth ?? 1.25 })),
  );

  cache.set(type, paths);
  return paths;
}
