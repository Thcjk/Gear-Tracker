"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { CategoryWeightChart } from "@/components/dashboard/CategoryWeightChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopHeaviestItems } from "@/components/dashboard/TopHeaviestItems";
import { PackingListItemCard } from "@/components/lists/PackingListItemCard";
import {
  listItemCount,
  listPackedProgress,
  listTotalPrice,
  listTotalWeight,
  topHeaviestItems,
  weightByCategory,
} from "@/lib/calculations";
import { formatPrice, formatWeight } from "@/lib/categories";
import { exportPackingListPdf } from "@/lib/pdfExport";
import { useAppStore } from "@/lib/store";

function PackingListDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { ready, data, updatePackingList } = useAppStore();
  const [selectedGearId, setSelectedGearId] = useState("");

  const list = useMemo(
    () => data.packingLists.find((l) => l.id === id),
    [data.packingLists, id],
  );

  if (!ready) {
    return <p className="text-sm text-earth-500">Lade Packliste…</p>;
  }

  if (!list) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-earth-600 dark:text-earth-300">
          Packliste nicht gefunden.
        </p>
        <Link href="/lists" className="text-ember-600 underline">
          Zurück zu den Listen
        </Link>
      </div>
    );
  }

  const progress = listPackedProgress(list);
  const totalWeight = listTotalWeight(list, data.gearItems);
  const totalPrice = listTotalPrice(list, data.gearItems);
  const itemCount = listItemCount(list);
  const chartData = weightByCategory(list, data.gearItems);
  const heaviest = topHeaviestItems(list, data.gearItems);
  const availableGear = data.gearItems.filter(
    (g) => !list.items.some((i) => i.gearItemId === g.id),
  );

  function saveList(next = list!) {
    updatePackingList(next);
  }

  function addItem() {
    if (!selectedGearId || !list) return;
    saveList({
      ...list,
      items: [
        ...list.items,
        { gearItemId: selectedGearId, quantity: 1, packed: false },
      ],
    });
    setSelectedGearId("");
  }

  return (
    <div className="space-y-4">
      <DashboardHeader
        name={list.name}
        packed={progress.packed}
        total={progress.total}
        onBack={() => router.push("/lists")}
        onRename={(name) => saveList({ ...list, name })}
        onExportPdf={() => exportPackingListPdf(list, data.gearItems)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Gesamtgewicht" value={formatWeight(totalWeight)} />
        <StatCard label="Gesamtwert" value={formatPrice(totalPrice)} />
        <StatCard label="Anzahl Items" value={String(itemCount)} />
      </div>

      <CategoryWeightChart data={chartData} />
      <TopHeaviestItems items={heaviest} />

      <div className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
        <h3 className="mb-3 text-base font-semibold text-forest-900 dark:text-forest-50">
          Item hinzufügen
        </h3>
        {availableGear.length === 0 ? (
          <p className="text-sm text-earth-500 dark:text-earth-400">
            Alle Library-Items sind bereits in der Liste, oder die Library ist
            leer.{" "}
            <Link href="/library" className="text-ember-600 underline">
              Zur Library
            </Link>
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedGearId}
              onChange={(e) => setSelectedGearId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm dark:border-forest-700 dark:bg-forest-950"
            >
              <option value="">Item wählen…</option>
              {availableGear.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatWeight(g.weightGrams)})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addItem}
              disabled={!selectedGearId}
              className="inline-flex items-center gap-1 rounded-2xl bg-ember-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {list.items.length === 0 ? (
          <div className="rounded-card bg-white p-6 text-sm text-earth-600 shadow-soft dark:bg-forest-900 dark:text-earth-300 dark:shadow-soft-dark">
            Diese Liste ist noch leer.
          </div>
        ) : (
          list.items.map((item) => {
            const gear = data.gearItems.find((g) => g.id === item.gearItemId);
            return (
              <PackingListItemCard
                key={item.gearItemId}
                item={item}
                gear={gear}
                onTogglePacked={() =>
                  saveList({
                    ...list,
                    items: list.items.map((i) =>
                      i.gearItemId === item.gearItemId
                        ? { ...i, packed: !i.packed }
                        : i,
                    ),
                  })
                }
                onQuantityChange={(quantity) =>
                  saveList({
                    ...list,
                    items: list.items.map((i) =>
                      i.gearItemId === item.gearItemId
                        ? { ...i, quantity }
                        : i,
                    ),
                  })
                }
                onRemove={() =>
                  saveList({
                    ...list,
                    items: list.items.filter(
                      (i) => i.gearItemId !== item.gearItemId,
                    ),
                  })
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PackingListDetailPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-earth-500">Lade Packliste…</p>}
    >
      <PackingListDetailInner />
    </Suspense>
  );
}
