import type {
  Category,
  CategoryWeightRow,
  ComparisonRow,
  GearItem,
  PackingList,
  SortKey,
} from "@/types";
import { CATEGORIES } from "./categories";

/**
 * Nachschlagetabelle für Gear-Items.
 *
 * Vorher lief in jeder Auswertung ein gearItems.find() pro Listeneintrag,
 * also O(Items x Library). Über die Map wird daraus O(Items + Library) –
 * spürbar, sobald Dashboard und Vergleich mehrere Auswertungen
 * hintereinander über dieselben Daten laufen lassen.
 */
export function indexGearItems(gearItems: GearItem[]): Map<string, GearItem> {
  return new Map(gearItems.map((item) => [item.id, item]));
}

export function listTotalWeight(
  list: PackingList,
  gearItems: GearItem[],
): number {
  const index = indexGearItems(gearItems);
  return list.items.reduce((sum, item) => {
    const gear = index.get(item.gearItemId);
    if (!gear) return sum;
    return sum + gear.weightGrams * item.quantity;
  }, 0);
}

export function listTotalPrice(
  list: PackingList,
  gearItems: GearItem[],
): number {
  const index = indexGearItems(gearItems);
  return list.items.reduce((sum, item) => {
    const gear = index.get(item.gearItemId);
    if (!gear?.price) return sum;
    return sum + gear.price * item.quantity;
  }, 0);
}

export function listItemCount(list: PackingList): number {
  return list.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function listPackedProgress(list: PackingList): {
  packed: number;
  total: number;
} {
  const total = list.items.length;
  const packed = list.items.filter((i) => i.packed).length;
  return { packed, total };
}

export function weightByCategory(
  list: PackingList,
  gearItems: GearItem[],
): CategoryWeightRow[] {
  const index = indexGearItems(gearItems);
  const map = new Map<Category, number>();

  for (const item of list.items) {
    const gear = index.get(item.gearItemId);
    if (!gear) continue;
    map.set(
      gear.category,
      (map.get(gear.category) ?? 0) + gear.weightGrams * item.quantity,
    );
  }

  return CATEGORIES.map((meta) => ({
    category: meta.id,
    label: meta.label,
    weightGrams: map.get(meta.id) ?? 0,
    color: meta.chartColor,
  })).filter((row) => row.weightGrams > 0);
}

export function topHeaviestItems(
  list: PackingList,
  gearItems: GearItem[],
  limit = 5,
): { name: string; weightGrams: number; quantity: number; totalGrams: number }[] {
  const index = indexGearItems(gearItems);
  return list.items
    .map((item) => {
      const gear = index.get(item.gearItemId);
      if (!gear) return null;
      return {
        name: gear.name,
        weightGrams: gear.weightGrams,
        quantity: item.quantity,
        totalGrams: gear.weightGrams * item.quantity,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => b.totalGrams - a.totalGrams)
    .slice(0, limit);
}

/** Kategorie-Zeilen absteigend nach Gewicht, plus Gesamtsumme für Prozentwerte. */
export function sortedCategoryWeights(rows: CategoryWeightRow[]): {
  rows: CategoryWeightRow[];
  totalGrams: number;
} {
  const sorted = [...rows].sort((a, b) => b.weightGrams - a.weightGrams);
  return {
    rows: sorted,
    totalGrams: sorted.reduce((sum, row) => sum + row.weightGrams, 0),
  };
}

/** Anteil einer Zeile am Gesamtgewicht in Prozent. */
export function categoryShare(weightGrams: number, totalGrams: number): number {
  return totalGrams === 0 ? 0 : (weightGrams / totalGrams) * 100;
}

export function filterGearItems(
  items: GearItem[],
  category: Category | "all",
): GearItem[] {
  return category === "all"
    ? items
    : items.filter((item) => item.category === category);
}

export function sortGearItems(items: GearItem[], sortKey: SortKey): GearItem[] {
  return [...items].sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name, "de");
    if (sortKey === "weightGrams") return a.weightGrams - b.weightGrams;
    return (a.price ?? 0) - (b.price ?? 0);
  });
}

/** Vergleichszeilen inklusive Differenz zur leichtesten bzw. günstigsten Liste. */
export function buildComparison(
  lists: PackingList[],
  gearItems: GearItem[],
): ComparisonRow[] {
  const base = lists.map((list) => ({
    list,
    weightGrams: listTotalWeight(list, gearItems),
    price: listTotalPrice(list, gearItems),
    itemCount: listItemCount(list),
  }));


  if (base.length === 0) return [];

  const minWeight = Math.min(...base.map((row) => row.weightGrams));
  const minPrice = Math.min(...base.map((row) => row.price));

  return base.map((row) => ({
    ...row,
    weightDiff: row.weightGrams - minWeight,
    priceDiff: row.price - minPrice,
    isLightest: row.weightGrams === minWeight,
    isCheapest: row.price === minPrice,
  }));
}
