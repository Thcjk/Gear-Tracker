"use client";

import type {
  Category,
  GearItem,
  PackingList,
  SharedListItem,
  SharedPackingList,
} from "@/types";
import { CATEGORIES } from "@/lib/categories";
import { indexGearItems } from "@/lib/calculations";
import { readJson, writeJson } from "@/lib/storage";

const OWNER_KEY = "ultralight-gear-tracker-owner-v1";
const CATEGORY_IDS = new Set<string>(CATEGORIES.map((c) => c.id));

export function loadOwnerName(): string {
  const stored = readJson<unknown>(OWNER_KEY, null);
  return typeof stored === "string" ? stored : "";
}

export function saveOwnerName(name: string): void {
  writeJson(OWNER_KEY, name);
}

/** Löst die Referenzen der Packliste zu eigenständigen Einträgen auf. */
export function buildSharedList(
  list: PackingList,
  gearItems: GearItem[],
  ownerName: string,
): SharedPackingList {
  const index = indexGearItems(gearItems);

  const items: SharedListItem[] = list.items.flatMap((entry) => {
    const gear = index.get(entry.gearItemId);
    if (!gear) return [];
    return [
      {
        name: gear.name,
        category: gear.category,
        weightGrams: gear.weightGrams,
        quantity: entry.quantity,
        ...(gear.price !== undefined ? { price: gear.price } : {}),
      },
    ];
  });

  return {
    format: "gear-tracker-share",
    version: 1,
    ownerName,
    listName: list.name,
    exportedAt: new Date().toISOString(),
    items,
    totalWeightGrams: items.reduce(
      (sum, item) => sum + item.weightGrams * item.quantity,
      0,
    ),
    totalPrice: items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    ),
  };
}

export function sharedListFileName(listName: string): string {
  const safe = listName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${safe || "packliste"}-vergleich.json`;
}

export function downloadSharedList(shared: SharedPackingList): void {
  const blob = new Blob([JSON.stringify(shared, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = sharedListFileName(shared.listName);
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------- Import ------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseItem(raw: unknown): SharedListItem | null {
  if (!isRecord(raw)) return null;

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const weightGrams = Number(raw.weightGrams);
  const quantity = Number(raw.quantity);
  const price = Number(raw.price);
  if (!name || !Number.isFinite(weightGrams) || weightGrams < 0) return null;

  const category =
    typeof raw.category === "string" && CATEGORY_IDS.has(raw.category)
      ? (raw.category as Category)
      : "hygiene-misc";

  return {
    name,
    category,
    weightGrams,
    quantity:
      Number.isFinite(quantity) && quantity >= 1 ? Math.floor(quantity) : 1,
    ...(Number.isFinite(price) && price >= 0 ? { price } : {}),
  };
}

/**
 * Prüft eine fremde Datei und gibt sie normalisiert zurück – oder null,
 * wenn sie kein brauchbarer Export ist. Wirft nie: der Aufrufer zeigt
 * bei null eine Meldung an, statt dass die App abstürzt.
 */
export function parseSharedList(raw: string): SharedPackingList | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  const listName =
    typeof parsed.listName === "string" ? parsed.listName.trim() : "";
  const ownerName =
    typeof parsed.ownerName === "string" ? parsed.ownerName.trim() : "";
  if (!listName || !Array.isArray(parsed.items)) return null;

  const items = parsed.items
    .map(parseItem)
    .filter((item): item is SharedListItem => item !== null);

  // Eine Datei ganz ohne lesbare Items ist kein sinnvoller Vergleich
  if (items.length === 0) return null;

  return {
    format: "gear-tracker-share",
    version: 1,
    ownerName: ownerName || "Unbekannt",
    listName,
    exportedAt:
      typeof parsed.exportedAt === "string"
        ? parsed.exportedAt
        : new Date().toISOString(),
    items,
    // Summen werden neu gerechnet: die Werte aus der Datei könnten von den
    // Items abweichen, die Items sind die belastbare Quelle.
    totalWeightGrams: items.reduce(
      (sum, item) => sum + item.weightGrams * item.quantity,
      0,
    ),
    totalPrice: items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0,
    ),
  };
}
