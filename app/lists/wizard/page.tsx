"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PartyPopper } from "lucide-react";
import type { GearDraft, GearItem, PackingListItem } from "@/types";
import { CategoryStage } from "@/components/wizard/CategoryStage";
import { LibraryPicker } from "@/components/wizard/LibraryPicker";
import { QuickItemForm } from "@/components/wizard/QuickItemForm";
import { Button, IconButton } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  filterGearItems,
  indexGearItems,
  listTotalWeight,
  sortGearItems,
} from "@/lib/calculations";
import { formatWeight, getCategoryMeta } from "@/lib/categories";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useAppStore } from "@/lib/store";
import { WIZARD_CATEGORIES } from "@/lib/wizardSteps";

function WizardInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { ready, data, updatePackingList, addGearItem } = useAppStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<"library" | "new">("library");

  const list = useMemo(
    () => data.packingLists.find((l) => l.id === id),
    [data.packingLists, id],
  );

  const onSummary = stepIndex >= WIZARD_CATEGORIES.length;
  const category = WIZARD_CATEGORIES[Math.min(stepIndex, WIZARD_CATEGORIES.length - 1)];

  const categoryItems = useMemo(
    () =>
      category
        ? sortGearItems(filterGearItems(data.gearItems, category), "name")
        : [],
    [data.gearItems, category],
  );

  /** Bereits in der Liste liegende Einträge, nach Gear-Id nachschlagbar. */
  const selection = useMemo(() => {
    const map = new Map<string, PackingListItem>();
    for (const item of list?.items ?? []) map.set(item.gearItemId, item);
    return map;
  }, [list]);

  const chosenInStep = categoryItems.filter((item) => selection.has(item.id));

  if (!ready) {
    return <p className="text-sm text-clay-700 dark:text-clay-400">Lade…</p>;
  }

  if (!list) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-clay-700 dark:text-clay-400">
          Packliste nicht gefunden.
        </p>
        <Link href="/lists" className="text-ember-800 underline dark:text-ember-200">
          Zurück zu den Listen
        </Link>
      </div>
    );
  }

  function writeItems(items: PackingListItem[]) {
    if (!list) return;
    updatePackingList({ ...list, items });
  }

  function toggleItem(gearItemId: string) {
    if (!list) return;
    writeItems(
      selection.has(gearItemId)
        ? list.items.filter((i) => i.gearItemId !== gearItemId)
        : [...list.items, { gearItemId, quantity: 1, packed: false }],
    );
  }

  function setQuantity(gearItemId: string, quantity: number) {
    if (!list) return;
    writeItems(
      list.items.map((i) =>
        i.gearItemId === gearItemId ? { ...i, quantity } : i,
      ),
    );
  }

  /** Neues Item: erst in die Library, dann direkt in die Packliste. */
  function createAndAdd(draft: GearDraft) {
    if (!list) return;
    const created = addGearItem(draft);
    writeItems([
      ...list.items,
      { gearItemId: created.id, quantity: 1, packed: false },
    ]);
  }

  function goNext() {
    setStepIndex(stepIndex + 1);
    setMode("library");
    window.scrollTo({ top: 0 });
  }

  if (onSummary) {
    const gearIndex = indexGearItems(data.gearItems);
    const rows = list.items
      .map((item) => ({ item, gear: gearIndex.get(item.gearItemId) }))
      .filter((row): row is { item: PackingListItem; gear: GearItem } =>
        Boolean(row.gear),
      );

    return (
      <div className="flex min-h-[70vh] flex-col">
        <div className="flex flex-col items-center py-2 text-center">
          <span className="animate-icon-in flex h-24 w-24 items-center justify-center rounded-full bg-clay-200 text-ember-700 shadow-neu-lg dark:bg-clay-800">
            <PartyPopper className="h-11 w-11" />
          </span>
          <h2 className="animate-label-in mt-5 text-2xl font-extrabold tracking-tight text-clay-900 [animation-delay:90ms] dark:text-clay-50">
            {list.name}
          </h2>
          <p className="animate-label-in mt-1 text-sm text-clay-700 [animation-delay:140ms] dark:text-clay-400">
            {rows.length} {rows.length === 1 ? "Item" : "Items"} ·{" "}
            {formatWeight(listTotalWeight(list, data.gearItems))}
          </p>
        </div>

        <SurfaceCard className="mt-6 p-4">
          {rows.length === 0 ? (
            <p className="text-sm text-clay-700 dark:text-clay-400">
              Du hast alle Kategorien übersprungen. Items lassen sich jederzeit
              im Dashboard ergänzen.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map(({ item, gear }) => (
                <li key={item.gearItemId} className="flex items-center gap-3">
                  <CategoryIcon category={gear.category} className="h-4 w-4" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-clay-900 dark:text-clay-50">
                      {gear.name}
                      {item.quantity > 1 && (
                        <span className="text-clay-700 dark:text-clay-400">
                          {" "}
                          x{item.quantity}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-clay-700 dark:text-clay-400">
                      {getCategoryMeta(gear.category).label}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums text-aqua-700 dark:text-aqua-300">
                    {formatWeight(gear.weightGrams * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SurfaceCard>

        <div className="mt-auto flex items-center gap-3 pt-8">
          <Button
            variant="quiet"
            onClick={() => {
              setStepIndex(WIZARD_CATEGORIES.length - 1);
              setMode("library");
            }}
            className="px-2"
          >
            Zurück
          </Button>
          <Button
            variant="accent"
            onClick={() => router.replace(`/lists/detail?id=${list.id}`)}
            className="ml-auto min-w-32"
          >
            Fertig
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-2 flex items-center gap-3">
        <IconButton
          onClick={() =>
            stepIndex === 0
              ? router.replace(`/lists/detail?id=${list.id}`)
              : (setStepIndex(stepIndex - 1), setMode("library"))
          }
          aria-label={stepIndex === 0 ? "Wizard verlassen" : "Ein Schritt zurück"}
        >
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <p className="truncate text-sm font-semibold text-clay-700 dark:text-clay-400">
          {list.name}
        </p>
      </div>

      <CategoryStage category={category} />

      <div className="mt-6 flex justify-center">
        <div
          role="tablist"
          aria-label="Eingabeart"
          className="inline-flex rounded-control bg-clay-200 p-1 shadow-neu-in-sm dark:bg-clay-800"
        >
          {(
            [
              { id: "library", label: "Aus Library" },
              { id: "new", label: "Neu anlegen" },
            ] as const
          ).map(({ id: modeId, label }) => (
            <button
              key={modeId}
              type="button"
              role="tab"
              aria-selected={mode === modeId}
              onClick={() => setMode(modeId)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                mode === modeId
                  ? "bg-clay-200 text-ember-800 shadow-neu-sm dark:bg-clay-800 dark:text-ember-200"
                  : "text-clay-700 dark:text-clay-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <SurfaceCard className="mt-4 p-4">
        {mode === "library" ? (
          <LibraryPicker
            items={categoryItems}
            selection={selection}
            onToggle={toggleItem}
            onQuantity={setQuantity}
          />
        ) : (
          <QuickItemForm category={category} onCreate={createAndAdd} />
        )}
      </SurfaceCard>

      <div className="mt-auto flex items-center gap-3 pt-8">
        <Button variant="quiet" onClick={goNext} className="px-2">
          Überspringen
        </Button>
        <Button
          variant="accent"
          onClick={goNext}
          disabled={chosenInStep.length === 0}
          className="ml-auto min-w-32"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}

export default function PackingListWizardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-clay-700 dark:text-clay-400">Lade…</p>
      }
    >
      <WizardInner />
    </Suspense>
  );
}
