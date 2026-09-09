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

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>({
    gearItems: [],
    packingLists: [],
    theme: "light",
  });

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    document.documentElement.classList.toggle("dark", loaded.theme === "dark");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveData(data);
    document.documentElement.classList.toggle("dark", data.theme === "dark");
  }, [data, ready]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setData((prev) => ({ ...prev, theme }));
  }, []);

  const addGearItem = useCallback(
    (item: Omit<GearItem, "id" | "createdAt">) => {
      const next: GearItem = {
        ...item,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        gearItems: upsertGearItem(prev.gearItems, next),
      }));
    },
    [],
  );

  const updateGearItem = useCallback((item: GearItem) => {
    setData((prev) => ({
      ...prev,
      gearItems: upsertGearItem(prev.gearItems, item),
    }));
  }, []);

  const removeGearItem = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      gearItems: deleteGearItem(prev.gearItems, id),
      packingLists: prev.packingLists.map((list) => ({
        ...list,
        items: list.items.filter((i) => i.gearItemId !== id),
        updatedAt: new Date().toISOString(),
      })),
    }));
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
    setData((prev) => ({
      ...prev,
      packingLists: upsertPackingList(prev.packingLists, list),
    }));
    return list;
  }, []);

  const updatePackingList = useCallback((list: PackingList) => {
    setData((prev) => ({
      ...prev,
      packingLists: upsertPackingList(prev.packingLists, {
        ...list,
        updatedAt: new Date().toISOString(),
      }),
    }));
  }, []);

  const removePackingList = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      packingLists: deletePackingList(prev.packingLists, id),
    }));
  }, []);

  const replaceData = useCallback((next: AppData) => {
    setData(next);
  }, []);

  const clearAll = useCallback(() => {
    setData(resetData());
  }, []);

  const value = useMemo(
    () => ({
      ready,
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
    }),
    [
      ready,
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
    ],
  );

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
