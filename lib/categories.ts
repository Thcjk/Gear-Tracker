import type { Category } from "@/types";

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;
  chartColor: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "shelter",
    label: "Shelter",
    color: "bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200",
    chartColor: "#256b4c",
  },
  {
    id: "sleep-system",
    label: "Sleep System",
    color: "bg-earth-100 text-earth-800 dark:bg-earth-900 dark:text-earth-200",
    chartColor: "#8a5d3f",
  },
  {
    id: "backpack",
    label: "Backpack",
    color: "bg-ember-100 text-ember-800 dark:bg-ember-950 dark:text-ember-200",
    chartColor: "#ea580c",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    color: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    chartColor: "#d97706",
  },
  {
    id: "clothing",
    label: "Clothing",
    color: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
    chartColor: "#0284c7",
  },
  {
    id: "electronics",
    label: "Electronics",
    color: "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-200",
    chartColor: "#7c3aed",
  },
  {
    id: "hygiene-misc",
    label: "Hygiene & Misc",
    color: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200",
    chartColor: "#78716c",
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
