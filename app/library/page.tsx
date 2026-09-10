"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { GearItemCard } from "@/components/gear/GearItemCard";
import {
  GearItemForm,
  gearItemToFormValues,
  type GearFormValues,
} from "@/components/gear/GearItemForm";
import { ImportFromLinkForm } from "@/components/gear/ImportFromLinkForm";
import { CATEGORIES } from "@/lib/categories";
import { useAppStore } from "@/lib/store";
import type { Category, GearItem, ProductImportSuggestion, SortKey } from "@/types";

export default function LibraryPage() {
  const { ready, data, addGearItem, updateGearItem, removeGearItem } =
    useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [category, setCategory] = useState<Category | "all">("all");
  const [editing, setEditing] = useState<GearItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [importDraft, setImportDraft] = useState<Partial<GearFormValues> | null>(
    null,
  );

  const items = useMemo(() => {
    let list = [...data.gearItems];
    if (category !== "all") {
      list = list.filter((i) => i.category === category);
    }
    list.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name, "de");
      if (sortKey === "weightGrams") return a.weightGrams - b.weightGrams;
      return (a.price ?? 0) - (b.price ?? 0);
    });
    return list;
  }, [data.gearItems, category, sortKey]);

  function handleCreate(values: GearFormValues) {
    addGearItem(values);
    setCreating(false);
    setImportDraft(null);
  }

  function handleUpdate(values: GearFormValues) {
    if (!editing) return;
    updateGearItem({ ...editing, ...values });
    setEditing(null);
  }

  function handleImport(suggestion: ProductImportSuggestion) {
    setCreating(true);
    setEditing(null);
    setImportDraft({
      name: suggestion.name ?? "",
      weightGrams: suggestion.weightGrams ?? 0,
      price: suggestion.price,
      sourceUrl: suggestion.sourceUrl,
      category: "hygiene-misc",
    });
  }

  if (!ready) {
    return <p className="text-sm text-earth-500">Lade Library…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-forest-900 dark:text-forest-50">
            Gear-Library
          </h2>
          <p className="text-sm text-earth-600 dark:text-earth-300">
            {data.gearItems.length} Items gespeichert
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setImportDraft(null);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>
      </div>

      <ImportFromLinkForm onImported={handleImport} />

      {(creating || editing) && (
        <GearItemForm
          title={editing ? "Item bearbeiten" : "Neues Item"}
          submitLabel={editing ? "Speichern" : "Hinzufügen"}
          initial={
            editing
              ? gearItemToFormValues(editing)
              : importDraft ?? undefined
          }
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
            setImportDraft(null);
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
          <div className="rounded-card bg-white p-6 text-sm text-earth-600 shadow-soft dark:bg-forest-900 dark:text-earth-300 dark:shadow-soft-dark">
            Noch keine Items. Lege dein erstes Gear an oder importiere per Link.
          </div>
        ) : (
          items.map((item) => (
            <GearItemCard
              key={item.id}
              item={item}
              onEdit={(g) => {
                setEditing(g);
                setCreating(false);
                setImportDraft(null);
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
