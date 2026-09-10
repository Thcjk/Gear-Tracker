"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AppData, GearItem, PackingList, ThemeMode } from "@/types";
import { recordBackup } from "@/lib/backups";
import {
  createId,
  deleteGearItem,
  deletePackingList,
  isStorageWritable,
  loadData,
  resetData,
  saveData,
  upsertGearItem,
  upsertPackingList,
} from "@/lib/storage";

interface AppStoreValue {
  ready: boolean;
  data: AppData;
  /** true, wenn LocalStorage nicht beschrieben werden kann. */
  storageBlocked: boolean;
  /**
   * Gesetzt, wenn der gespeicherte Stand nicht lesbar war. Die Rohdaten
   * liegen dann in Quarantäne, die App startet leer – der Nutzer muss das
   * erfahren, sonst hält er den leeren Start für den Normalfall.
   */
  loadFailedAt: string | null;
  dismissLoadFailure: () => void;
  setTheme: (theme: ThemeMode) => void;
  addGearItem: (item: Omit<GearItem, "id" | "createdAt">) => GearItem;
  updateGearItem: (item: GearItem) => void;
  removeGearItem: (id: string) => void;
  addPackingList: (name: string) => PackingList;
  updatePackingList: (list: PackingList) => void;
  removePackingList: (id: string) => void;
  replaceData: (data: AppData) => void;
  clearAll: () => void;
}

const emptyData: AppData = {
  gearItems: [],
  packingLists: [],
  theme: "light",
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<AppData>(emptyData);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [loadFailedAt, setLoadFailedAt] = useState<string | null>(null);

  /**
   * Spiegelt den aktuellen Stand synchron, damit commit() ohne
   * setState-Callback rechnen kann.
   */
  const dataRef = useRef<AppData>(emptyData);

  useEffect(() => {
    const result = loadData();
    applyThemeClass(result.data.theme);
    dataRef.current = result.data;
    setData(result.data);
    if (result.status === "unreadable") {
      setLoadFailedAt(result.quarantinedAt ?? new Date().toISOString());
    }
    setStorageBlocked(!isStorageWritable());
    setReady(true);
  }, []);

  /**
   * Einziger Schreibpfad: neuen Stand berechnen, sofort persistieren, dann
   * rendern. Vorher lief der Schreibvorgang in einem Effekt nach dem
   * Commit – zwischen Klick und Persistenz lag ein Frame, in dem ein
   * Reload die Änderung verschluckt hat. dataRef wird synchron
   * mitgeführt, damit mehrere Aufrufe im selben Tick aufeinander aufbauen.
   */
  const commit = useCallback((mutate: (prev: AppData) => AppData) => {
    const next = mutate(dataRef.current);
    dataRef.current = next;
    // Schlägt das Schreiben fehl, läuft die App weiter – der Hinweis sagt
    // aber, dass die Änderung nur bis zum Neuladen hält.
    const written = saveData(next);
    setStorageBlocked(!written);
    // Sicherung nur, wenn der Hauptstand auch wirklich liegt.
    if (written) recordBackup(next);
    applyThemeClass(next.theme);
    setData(next);
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => commit((prev) => ({ ...prev, theme })),
    [commit],
  );

  const addGearItem = useCallback(
    (item: Omit<GearItem, "id" | "createdAt">) => {
      const next: GearItem = {
        ...item,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      commit((prev) => ({
        ...prev,
        gearItems: upsertGearItem(prev.gearItems, next),
      }));
      return next;
    },
    [commit],
  );

  const updateGearItem = useCallback(
    (item: GearItem) =>
      commit((prev) => ({
        ...prev,
        gearItems: upsertGearItem(prev.gearItems, item),
      })),
    [commit],
  );

  const removeGearItem = useCallback(
    (id: string) =>
      commit((prev) => ({
        ...prev,
        gearItems: deleteGearItem(prev.gearItems, id),
        packingLists: prev.packingLists.map((list) =>
          // Nur betroffene Listen anfassen, sonst bleibt die Referenz stehen
          list.items.some((i) => i.gearItemId === id)
            ? {
                ...list,
                items: list.items.filter((i) => i.gearItemId !== id),
                updatedAt: new Date().toISOString(),
              }
            : list,
        ),
      })),
    [commit],
  );

  const addPackingList = useCallback((name: string) => {
    const now = new Date().toISOString();
    const list: PackingList = {
      id: createId(),
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    commit((prev) => ({
      ...prev,
      packingLists: upsertPackingList(prev.packingLists, list),
    }));
    return list;
  }, [commit]);

  const updatePackingList = useCallback(
    (list: PackingList) =>
      commit((prev) => ({
        ...prev,
        packingLists: upsertPackingList(prev.packingLists, {
          ...list,
          updatedAt: new Date().toISOString(),
        }),
      })),
    [commit],
  );

  const removePackingList = useCallback(
    (id: string) =>
      commit((prev) => ({
        ...prev,
        packingLists: deletePackingList(prev.packingLists, id),
      })),
    [commit],
  );

  const replaceData = useCallback(
    (next: AppData) => commit(() => next),
    [commit],
  );

  const clearAll = useCallback(() => commit(() => resetData()), [commit]);

  const dismissLoadFailure = useCallback(() => setLoadFailedAt(null), []);

  const value = useMemo(
    () => ({
      ready,
      data,
      storageBlocked,
      loadFailedAt,
      dismissLoadFailure,
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
      storageBlocked,
      loadFailedAt,
      dismissLoadFailure,
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
