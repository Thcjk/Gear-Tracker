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

export type SortKey = "name" | "weightGrams" | "price";
export type ThemeMode = "light" | "dark";

export interface AppData {
  gearItems: GearItem[];
  packingLists: PackingList[];
  theme: ThemeMode;
}
