import type { Category, GearItem, PackingList } from "@/types";
import { CATEGORIES } from "./categories";

export function listTotalWeight(
  list: PackingList,
  gearItems: GearItem[],
): number {
  return list.items.reduce((sum, item) => {
    const gear = gearItems.find((g) => g.id === item.gearItemId);
    if (!gear) return sum;
    return sum + gear.weightGrams * item.quantity;
  }, 0);
}

export function listTotalPrice(
  list: PackingList,
  gearItems: GearItem[],
): number {
  return list.items.reduce((sum, item) => {
    const gear = gearItems.find((g) => g.id === item.gearItemId);
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
): { category: Category; label: string; weightGrams: number; color: string }[] {
  const map = new Map<Category, number>();

  for (const item of list.items) {
    const gear = gearItems.find((g) => g.id === item.gearItemId);
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
  return list.items
    .map((item) => {
      const gear = gearItems.find((g) => g.id === item.gearItemId);
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
