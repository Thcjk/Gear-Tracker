export type Category =
  | "shelter"
  | "sleep-system"
  | "backpack"
  | "kitchen"
  | "clothing"
  | "electronics"
  | "hygiene-misc";

export interface GearItem {
  id: string;
  name: string;
  category: Category;
  weightGrams: number;
  price?: number;
  notes?: string;
  createdAt: string;
}

export interface PackingListItem {
  gearItemId: string;
  quantity: number;
  packed: boolean;
}

export interface PackingList {
  id: string;
  name: string;
  items: PackingListItem[];
  createdAt: string;
  updatedAt: string;
}

/** Gear-Item ohne die vom Store vergebenen Felder – Basis für Formulare. */
export type GearDraft = Omit<GearItem, "id" | "createdAt">;

/** Eine Zeile der Kategorie-Auswertung, gemeinsam genutzt von Berechnung und Chart. */
export interface CategoryWeightRow {
  category: Category;
  label: string;
  weightGrams: number;
  color: string;
}

/** Eine Zeile des Packlisten-Vergleichs. */
export interface ComparisonRow {
  list: PackingList;
  weightGrams: number;
  price: number;
  itemCount: number;
  weightDiff: number;
  priceDiff: number;
  isLightest: boolean;
  isCheapest: boolean;
}

export type SortKey = "name" | "weightGrams" | "price";
export type ThemeMode = "light" | "dark";

export interface AppData {
  gearItems: GearItem[];
  packingLists: PackingList[];
  theme: ThemeMode;
}
