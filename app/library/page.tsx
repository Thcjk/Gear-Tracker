"use client";

import { useMemo, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";
import { CategorySection } from "@/components/gear/CategorySection";
import { GearItemCard } from "@/components/gear/GearItemCard";
import { ProductImport } from "@/components/gear/ProductImport";
import { TurtleMascot } from "@/components/mascot/TurtleMascot";
import { EmptyState } from "@/components/ui/SurfaceCard";
import {
  GearItemForm,
  gearItemToFormValues,
  type GearFormValues,
} from "@/components/gear/GearItemForm";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CATEGORIES } from "@/lib/categories";
import { filterGearItems, sortGearItems } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import type { Category, GearItem, SortKey } from "@/types";

export default function LibraryPage() {
  const { ready, data, addGearItem, updateGearItem, removeGearItem } =
    useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [openCategories, setOpenCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<GearItem | null>(null);
  const [creatingIn, setCreatingIn] = useState<Category | null>(null);

  /** Items je Kategorie, innerhalb der Sektion nach der Auswahl sortiert. */
  const grouped = useMemo(() => {
    const map = new Map<Category, GearItem[]>();
    for (const meta of CATEGORIES) {
      map.set(
        meta.id,
        sortGearItems(filterGearItems(data.gearItems, meta.id), sortKey),
      );
    }
    return map;
  }, [data.gearItems, sortKey]);

  const allOpen = openCategories.length === CATEGORIES.length;

  function toggleCategory(category: Category) {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }

  function openCategory(category: Category) {
    setOpenCategories((prev) =>
      prev.includes(category) ? prev : [...prev, category],
    );
  }

  function startCreate(category: Category) {
    setEditing(null);
    setCreatingIn(category);
    openCategory(category);
  }

  function handleCreate(values: GearFormValues) {
    addGearItem(values);
    setCreatingIn(null);
  }

  /** Nach dem Import die Zielsektion aufklappen – sonst sieht man nichts. */
  function handleImported(values: GearFormValues, category: Category) {
    addGearItem(values);
    openCategory(category);
  }

  function handleUpdate(values: GearFormValues) {
    if (!editing) return;
    updateGearItem({ ...editing, ...values });
    setEditing(null);
  }

  if (!ready) {
    return (
      <p className="text-sm text-paper-700 dark:text-paper-400">Lade Library…</p>
    );
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Gear-Library  "
        subtitle={`${data.gearItems.length} Items in ${CATEGORIES.length} Kategorien`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="neu-field h-11 w-auto flex-1 py-0 text-sm"
          aria-label="Sortierung innerhalb der Kategorien"
        >
          <option value="name">Sortierung: Name</option>
          <option value="weightGrams">Sortierung: Gewicht</option>
          <option value="price">Sortierung: Preis</option>
        </select>
        {/* Der frühere Kategorie-Filter ist durch die Sektionen überflüssig
            geworden; an seiner Stelle steht das Auf- und Zuklappen aller
            Sektionen, was mit sieben davon deutlich mehr bringt. */}
        <Button
          onClick={() =>
            setOpenCategories(allOpen ? [] : CATEGORIES.map((c) => c.id))
          }
          className="py-2.5"
        >
          {allOpen ? (
            <ChevronsDownUp className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
          {allOpen ? "Zuklappen" : "Aufklappen"}
        </Button>
      </div>

      <ProductImport onCreate={handleImported} />

      {data.gearItems.length === 0 && (
        <EmptyState illustration={<TurtleMascot totalWeightGrams={0} animated={false} className="h-28 w-28" />}>
          Noch nichts in der Library. Klapp eine Kategorie auf und leg dein
          erstes Item an – oder importiere es per Link.
        </EmptyState>
      )}

      <div className="space-y-3">
        {CATEGORIES.map((meta) => {
          const items = grouped.get(meta.id) ?? [];
          return (
            <CategorySection
              key={meta.id}
              category={meta.id}
              count={items.length}
              open={openCategories.includes(meta.id)}
              onToggle={() => toggleCategory(meta.id)}
            >
              {items.length === 0 && creatingIn !== meta.id && (
                <p className="px-3 text-sm text-paper-700 dark:text-paper-400">
                  Noch keine Items in dieser Kategorie.
                </p>
              )}

              {items.map((item, index) =>
                editing?.id === item.id ? (
                  <GearItemForm
                    key={item.id}
                    title="Item bearbeiten"
                    submitLabel="Speichern"
                    hideCategory
                    initial={gearItemToFormValues(item)}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <GearItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    showCategory={false}
                    onEdit={(gear) => {
                      setEditing(gear);
                      setCreatingIn(null);
                    }}
                    onDelete={(id) => {
                      if (confirm("Item wirklich löschen?")) removeGearItem(id);
                    }}
                  />
                ),
              )}

              {creatingIn === meta.id ? (
                <GearItemForm
                  title={`Neues Item · ${meta.label}`}
                  submitLabel="Hinzufügen"
                  hideCategory
                  initial={{ category: meta.id }}
                  onSubmit={handleCreate}
                  onCancel={() => setCreatingIn(null)}
                />
              ) : (
                <Button
                  variant="raised"
                  onClick={() => startCreate(meta.id)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  Hinzufügen
                </Button>
              )}
            </CategorySection>
          );
        })}
      </div>
    </div>
  );
}
