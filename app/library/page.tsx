"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { GearItemCard } from "@/components/gear/GearItemCard";
import {
  GearItemForm,
  gearItemToFormValues,
  type GearFormValues,
} from "@/components/gear/GearItemForm";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/SurfaceCard";
import { CATEGORIES } from "@/lib/categories";
import { filterGearItems, sortGearItems } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { Category, GearItem, SortKey } from "@/types";

export default function LibraryPage() {
  const { ready, data, addGearItem, updateGearItem, removeGearItem } =
    useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [category, setCategory] = useState<Category | "all">("all");
  const [editing, setEditing] = useState<GearItem | null>(null);
  const [creating, setCreating] = useState(false);

  const items = useMemo(
    () => sortGearItems(filterGearItems(data.gearItems, category), sortKey),
    [data.gearItems, category, sortKey],
  );

  function handleCreate(values: GearFormValues) {
    addGearItem(values);
    setCreating(false);
  }

  function handleUpdate(values: GearFormValues) {
    if (!editing) return;
    updateGearItem({ ...editing, ...values });
    setEditing(null);
  }

  if (!ready) {
    return <p className="text-sm text-earth-500">Lade Library…</p>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Gear-Library"
        subtitle={`${data.gearItems.length} Items gespeichert`}
        action={
          <Button
            variant="accent"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Neu
          </Button>
        }
      />

      {(creating || editing) && (
        <GearItemForm
          title={editing ? "Item bearbeiten" : "Neues Item"}
          submitLabel={editing ? "Speichern" : "Hinzufügen"}
          initial={editing ? gearItemToFormValues(editing) : undefined}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as Category | "all")
          }
          className="rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm dark:border-forest-700 dark:bg-forest-900"
        >
          <option value="all">Alle Kategorien</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-xl border border-forest-200 bg-white px-3 py-2 text-sm dark:border-forest-700 dark:bg-forest-900"
        >
          <option value="name">Sortierung: Name</option>
          <option value="weightGrams">Sortierung: Gewicht</option>
          <option value="price">Sortierung: Preis</option>
        </select>
      </div>

      <div className="space-y-3">
        {items.length === 0 ? (
          <EmptyState>
            Noch keine Items. Lege dein erstes Gear mit Gewicht und Preis an.
          </EmptyState>
        ) : (
          items.map((item, index) => (
            <GearItemCard
              key={item.id}
              item={item}
              index={index}
              onEdit={(g) => {
                setEditing(g);
                setCreating(false);
              }}
              onDelete={(id) => {
                if (confirm("Item wirklich löschen?")) removeGearItem(id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
