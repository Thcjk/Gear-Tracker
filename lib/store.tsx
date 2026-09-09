"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppData, GearItem, PackingList, ThemeMode } from "@/types";
import {
  createId,
  deleteGearItem,
  deletePackingList,
  loadData,
  resetData,
  saveData,
  upsertGearItem,
  upsertPackingList,
} from "@/lib/storage";

interface AppStoreValue {
  ready: boolean;
  data: AppData;
  setTheme: (theme: ThemeMode) => void;
  addGearItem: (item: Omit<GearItem, "id" | "createdAt">) => void;
  updateGearItem: (item: GearItem) => void;
  removeGearItem: (id: string) => void;
  addPackingList: (name: string) => PackingList;
  updatePackingList: (list: PackingList) => void;
  removePackingList: (id: string) => void;
  replaceData: (data: AppData) => void;
  clearAll: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    const loaded = loadData();
    applyThemeClass(loaded.theme);
    setData(loaded);
  }, []);

  useEffect(() => {
    if (!data) return;
    saveData(data);
    applyThemeClass(data.theme);
  }, [data]);

  const setTheme = useCallback((theme: ThemeMode) => {
    applyThemeClass(theme);
    setData((prev) => (prev ? { ...prev, theme } : prev));
  }, []);

  const addGearItem = useCallback(
    (item: Omit<GearItem, "id" | "createdAt">) => {
      const next: GearItem = {
        ...item,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      setData((prev) =>
        prev
          ? { ...prev, gearItems: upsertGearItem(prev.gearItems, next) }
          : prev,
      );
    },
    [],
  );

  const updateGearItem = useCallback((item: GearItem) => {
    setData((prev) =>
      prev
        ? { ...prev, gearItems: upsertGearItem(prev.gearItems, item) }
        : prev,
    );
  }, []);

  const removeGearItem = useCallback((id: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            gearItems: deleteGearItem(prev.gearItems, id),
            packingLists: prev.packingLists.map((list) => ({
              ...list,
              items: list.items.filter((i) => i.gearItemId !== id),
              updatedAt: new Date().toISOString(),
            })),
          }
        : prev,
    );
  }, []);

  const addPackingList = useCallback((name: string) => {
    const now = new Date().toISOString();
    const list: PackingList = {
      id: createId(),
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    setData((prev) =>
      prev
        ? {
            ...prev,
            packingLists: upsertPackingList(prev.packingLists, list),
          }
        : prev,
    );
    return list;
  }, []);

  const updatePackingList = useCallback((list: PackingList) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            packingLists: upsertPackingList(prev.packingLists, {
              ...list,
              updatedAt: new Date().toISOString(),
            }),
          }
        : prev,
    );
  }, []);

  const removePackingList = useCallback((id: string) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            packingLists: deletePackingList(prev.packingLists, id),
          }
        : prev,
    );
  }, []);

  const replaceData = useCallback((next: AppData) => {
    applyThemeClass(next.theme);
    setData(next);
  }, []);

  const clearAll = useCallback(() => {
    const next = resetData();
    applyThemeClass(next.theme);
    setData(next);
  }, []);

  const value = useMemo<AppStoreValue | null>(() => {
    if (!data) return null;
    return {
      ready: true,
      data,
      setTheme,
      addGearItem,
      updateGearItem,
      removeGearItem,
      addPackingList,
      updatePackingList,
      removePackingList,
      replaceData,
      clearAll,
    };
  }, [
    data,
    setTheme,
    addGearItem,
    updateGearItem,
    removeGearItem,
    addPackingList,
    updatePackingList,
    removePackingList,
    replaceData,
    clearAll,
  ]);

  if (!value) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-10 text-sm text-earth-500">
        Lade Ultralight Gear-Tracker…
      </div>
    );
  }

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return ctx;
}
