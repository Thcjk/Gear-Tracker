import type { Category } from "@/types";

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;
  chartColor: string;
}

/**
 * Kategoriefarben aus der Palette.
 *
 * chartColor zeigt auf eine CSS-Variable statt auf einen festen Wert: der
 * Ton muss sich mit dem Theme drehen, weil dieselbe Farbe nicht auf beiden
 * Kartenfarben funktioniert – Aqua Mist hat auf Amazon Mist 1.5:1, Garnet
 * auf der Garnet-Karte gar nichts. Die Werte stehen in globals.css.
 *
 * Die Badge-Klassen sind Paare aus Fläche und Schrift: jede Kombination
 * erreicht auf ihrer Karte mindestens 6:1.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: "shelter",
    label: "Shelter",
    color: "bg-ember-100 text-ember-800 dark:bg-ember-900 dark:text-ember-200",
    chartColor: "var(--cat-shelter)",
  },
  {
    id: "sleep-system",
    label: "Sleep System",
    color: "bg-clay-300 text-clay-800 dark:bg-clay-900 dark:text-clay-300",
    chartColor: "var(--cat-sleep-system)",
  },
  {
    id: "backpack",
    label: "Backpack",
    color: "bg-aqua-100 text-aqua-800 dark:bg-aqua-900 dark:text-aqua-200",
    chartColor: "var(--cat-backpack)",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    color: "bg-ember-200 text-ember-900 dark:bg-ember-950 dark:text-ember-100",
    chartColor: "var(--cat-kitchen)",
  },
  {
    id: "clothing",
    label: "Clothing",
    color: "bg-aqua-200 text-aqua-900 dark:bg-aqua-800 dark:text-aqua-100",
    chartColor: "var(--cat-clothing)",
  },
  {
    id: "electronics",
    label: "Electronics",
    color: "bg-clay-400 text-clay-900 dark:bg-clay-950 dark:text-clay-200",
    chartColor: "var(--cat-electronics)",
  },
  {
    id: "hygiene-misc",
    label: "Hygiene & Misc",
    color: "bg-clay-200 text-clay-800 dark:bg-clay-700 dark:text-clay-100",
    chartColor: "var(--cat-hygiene-misc)",
  },
];

export function getCategoryMeta(category: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 2)} kg`;
  }
  return `${Math.round(grams)} g`;
}

/**
 * Nur beim Schlafsystem ergibt eine Komforttemperatur einen Sinn – ein
 * Kocher hat keine. Die Abfrage steckt hier, damit Formular, Anzeige und
 * Normalisierung dieselbe Regel benutzen.
 */
export function hasComfortTemp(category: Category): boolean {
  return category === "sleep-system";
}

/** Grenzen der Eingabe: alles ausserhalb ist ein Tippfehler, kein Schlafsack. */
export const COMFORT_TEMP_MIN = -50;
export const COMFORT_TEMP_MAX = 40;

export function formatComfortTemp(celsius: number): string {
  return `${Math.round(celsius * 10) / 10} °C`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(price);
}
