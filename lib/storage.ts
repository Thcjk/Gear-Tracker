import type { AppData, GearItem, PackingList, ThemeMode } from "@/types";

const STORAGE_KEY = "ultralight-gear-tracker-v1";

const defaultData: AppData = {
  gearItems: [],
  packingLists: [],
  theme: "light",
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadData(): AppData {
  if (!canUseStorage()) return { ...defaultData };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      gearItems: parsed.gearItems ?? [],
      packingLists: parsed.packingLists ?? [],
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data: AppData): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function upsertGearItem(items: GearItem[], item: GearItem): GearItem[] {
  const index = items.findIndex((g) => g.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
}

export function deleteGearItem(items: GearItem[], id: string): GearItem[] {
  return items.filter((g) => g.id !== id);
}

export function upsertPackingList(
  lists: PackingList[],
  list: PackingList,
): PackingList[] {
  const index = lists.findIndex((l) => l.id === list.id);
  if (index === -1) return [...lists, list];
  const next = [...lists];
  next[index] = list;
  return next;
}

export function deletePackingList(lists: PackingList[], id: string): PackingList[] {
  return lists.filter((l) => l.id !== id);
}

export function setTheme(data: AppData, theme: ThemeMode): AppData {
  return { ...data, theme };
}

export function exportJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importJson(raw: string): AppData {
  const parsed = JSON.parse(raw) as Partial<AppData>;
  return {
    gearItems: Array.isArray(parsed.gearItems) ? parsed.gearItems : [],
    packingLists: Array.isArray(parsed.packingLists) ? parsed.packingLists : [],
    theme: parsed.theme === "dark" ? "dark" : "light",
  };
}

export function resetData(): AppData {
  return { ...defaultData };
}
