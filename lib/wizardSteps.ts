import type { Category } from "@/types";

/**
 * Reihenfolge der Kategorien im Packlisten-Wizard: von den grossen,
 * schweren Systemen zu den Kleinteilen.
 */
export const WIZARD_CATEGORIES: Category[] = [
  "backpack",
  "sleep-system",
  "shelter",
  "kitchen",
  "clothing",
  "electronics",
  "hygiene-misc",
];
