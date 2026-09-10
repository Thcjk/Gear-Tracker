"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { PackingListItem } from "@/types";
import { CategoryStage } from "@/components/wizard/CategoryStage";
import { LibraryPicker } from "@/components/wizard/LibraryPicker";
import { Button, IconButton } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { filterGearItems, sortGearItems } from "@/lib/calculations";
import { useAppStore } from "@/lib/store";
import { WIZARD_CATEGORIES } from "@/lib/wizardSteps";

function WizardInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { ready, data, updatePackingList } = useAppStore();
  const [stepIndex, setStepIndex] = useState(0);

  const list = useMemo(
    () => data.packingLists.find((l) => l.id === id),
    [data.packingLists, id],
  );

  const category = WIZARD_CATEGORIES[stepIndex];

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
    return <p className="text-sm text-clay-600 dark:text-clay-400">Lade…</p>;
  }

  if (!list) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-clay-600 dark:text-clay-400">
          Packliste nicht gefunden.
        </p>
        <Link href="/lists" className="text-ember-600 underline">
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

  function goNext() {
    if (stepIndex < WIZARD_CATEGORIES.length - 1) {
      setStepIndex(stepIndex + 1);
      window.scrollTo({ top: 0 });
      return;
    }
    router.replace(`/lists/detail?id=${list!.id}`);
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-2 flex items-center gap-3">
        <IconButton
          onClick={() =>
            stepIndex === 0
              ? router.replace(`/lists/detail?id=${list.id}`)
              : setStepIndex(stepIndex - 1)
          }
          aria-label={stepIndex === 0 ? "Wizard verlassen" : "Ein Schritt zurück"}
        >
          <ArrowLeft className="h-5 w-5" />
        </IconButton>
        <p className="truncate text-sm font-semibold text-clay-600 dark:text-clay-400">
          {list.name}
        </p>
      </div>

      <CategoryStage category={category} />

      <SurfaceCard className="mt-6 p-4">
        <LibraryPicker
          items={categoryItems}
          selection={selection}
          onToggle={toggleItem}
          onQuantity={setQuantity}
        />
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
          {stepIndex === WIZARD_CATEGORIES.length - 1 ? "Abschliessen" : "Weiter"}
        </Button>
      </div>
    </div>
  );
}

export default function PackingListWizardPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-clay-600 dark:text-clay-400">Lade…</p>
      }
    >
      <WizardInner />
    </Suspense>
  );
}
