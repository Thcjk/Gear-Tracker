"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Share2, Wand2 } from "lucide-react";
import { Suspense } from "react";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { ShareExportDialog } from "@/components/lists/ShareExportDialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopHeaviestItems } from "@/components/dashboard/TopHeaviestItems";
import { PackingListItemCard } from "@/components/lists/PackingListItemCard";
import { Button } from "@/components/ui/Button";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  indexGearItems,
  listItemCount,
  listPackedProgress,
  listTotalPrice,
  listTotalWeight,
  topHeaviestItems,
  weightByCategory,
} from "@/lib/calculations";
import { formatPrice, formatWeight } from "@/lib/categories";
import {
  buildSharedList,
  downloadSharedList,
  loadOwnerName,
  saveOwnerName,
} from "@/lib/shareFormat";
import { useAppStore } from "@/lib/store";
import {
  getPreviousReference,
  recordListWeight,
  type WeightSnapshot,
} from "@/lib/weightHistory";

/**
 * Recharts ist die mit Abstand grösste Abhängigkeit der Seite. Als
 * dynamischer Import mit ssr:false landet die Bibliothek in einem eigenen
 * Chunk, der erst nach dem Seitengerüst geladen wird, statt den initialen
 * Download der Detailseite aufzublähen. Bewusst ohne loading-Platzhalter:
 * die Diagrammhöhe hängt von der Anzahl Kategorien ab, ein geratener
 * Platzhalter würde eher springen als der kurz leere Bereich.
 */
const CategoryWeightChart = dynamic(
  () =>
    import("@/components/dashboard/CategoryWeightChart").then(
      (mod) => mod.CategoryWeightChart,
    ),
  { ssr: false },
);

function PackingListDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { ready, data, updatePackingList } = useAppStore();
  const [selectedGearId, setSelectedGearId] = useState("");
  const [reference, setReference] = useState<WeightSnapshot | null>(null);
  const [sharing, setSharing] = useState(false);

  const list = useMemo(
    () => data.packingLists.find((l) => l.id === id),
    [data.packingLists, id],
  );

  const gearIndex = useMemo(
    () => indexGearItems(data.gearItems),
    [data.gearItems],
  );

  // Sechs Auswertungen über dieselben Daten – einmal pro Datenstand statt
  // bei jedem Render (Auswahl im Dropdown, Umbenennen, Badge-Update).
  const stats = useMemo(() => {
    if (!list) return null;
    return {
      progress: listPackedProgress(list),
      totalWeight: listTotalWeight(list, data.gearItems),
      totalPrice: listTotalPrice(list, data.gearItems),
      itemCount: listItemCount(list),
      chartData: weightByCategory(list, data.gearItems),
      heaviest: topHeaviestItems(list, data.gearItems),
    };
  }, [list, data.gearItems]);

  const availableGear = useMemo(() => {
    if (!list) return [];
    const inList = new Set(list.items.map((i) => i.gearItemId));
    return data.gearItems.filter((g) => !inList.has(g.id));
  }, [list, data.gearItems]);

  const currentWeight = stats?.totalWeight ?? 0;

  useEffect(() => {
    if (!ready || !list) return;
    setReference(getPreviousReference(list.id));
    recordListWeight(list.id, list.name, currentWeight);
  }, [ready, list, currentWeight]);

  if (!ready) {
    return <p className="text-sm text-clay-700 dark:text-clay-400">Lade Packliste…</p>;
  }

  if (!list || !stats) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-clay-700 dark:text-clay-400">
          Packliste nicht gefunden.
        </p>
        <Link href="/lists" className="text-ember-800 underline dark:text-ember-400">
          Zurück zu den Listen
        </Link>
      </div>
    );
  }

  const { progress, totalWeight, totalPrice, itemCount, chartData, heaviest } =
    stats;

  function saveList(next = list!) {
    updatePackingList(next);
  }

  /** Liste als eigenständige Datei sichern, damit sie jemand anders
   *  in seiner Vergleichsansicht öffnen kann. */
  function handleShareExport(ownerName: string) {
    if (!list) return;
    saveOwnerName(ownerName);
    downloadSharedList(buildSharedList(list, data.gearItems, ownerName));
    setSharing(false);
  }

  // jsPDF wird nur beim Klick gebraucht und deshalb erst dann geladen.
  async function handleExportPdf() {
    if (!list) return;
    const { exportPackingListPdf } = await import("@/lib/pdfExport");
    exportPackingListPdf(list, data.gearItems);
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
        onExportPdf={handleExportPdf}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Gesamtgewicht"
          countTo={totalWeight}
          format={formatWeight}
          duration={1100}
          index={0}
        />
        <StatCard
          label="Gesamtwert"
          countTo={totalPrice}
          format={formatPrice}
          duration={900}
          index={1}
        />
        <StatCard label="Anzahl Items" value={String(itemCount)} index={2} />
      </div>

      <AchievementBadges
        totalWeight={totalWeight}
        packed={progress.packed}
        total={progress.total}
        reference={reference}
      />

      <Button
        variant="raised"
        onClick={() => setSharing(true)}
        className="w-full"
      >
        <Share2 className="h-4 w-4" />
        Für Vergleich exportieren
      </Button>

      <CategoryWeightChart data={chartData} />
      <TopHeaviestItems items={heaviest} />

      <SurfaceCard className="p-4">
        <h3 className="mb-3 text-base font-bold text-clay-900 dark:text-clay-50">
          Item hinzufügen
        </h3>
        <Button
          variant="raised"
          onClick={() => router.push(`/lists/wizard?id=${list.id}`)}
          className="mb-3 w-full"
        >
          <Wand2 className="h-4 w-4" />
          Kategorien durchgehen
        </Button>

        {availableGear.length === 0 ? (
          <p className="text-sm text-clay-700 dark:text-clay-400">
            Alle Library-Items sind bereits in der Liste, oder die Library ist
            leer.{" "}
            <Link href="/library" className="text-ember-800 underline dark:text-ember-400">
              Zur Library
            </Link>
          </p>
        ) : (
          <div className="flex gap-2">
            <select
              value={selectedGearId}
              onChange={(e) => setSelectedGearId(e.target.value)}
              className="neu-field min-w-0 flex-1 text-sm"
            >
              <option value="">Item wählen…</option>
              {availableGear.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({formatWeight(g.weightGrams)})
                </option>
              ))}
            </select>
            <Button
              variant="accent"
              onClick={addItem}
              disabled={!selectedGearId}
              className="px-3"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        )}
      </SurfaceCard>

      <div className="space-y-3">
        {list.items.length === 0 ? (
          <EmptyState>Diese Liste ist noch leer.</EmptyState>
        ) : (
          list.items.map((item, index) => {
            const gear = gearIndex.get(item.gearItemId);
            return (
              <PackingListItemCard
                key={item.gearItemId}
                item={item}
                gear={gear}
                index={index}
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
      {sharing && (
        <ShareExportDialog
          initialName={loadOwnerName()}
          onConfirm={handleShareExport}
          onClose={() => setSharing(false)}
        />
      )}
    </div>
  );
}

export default function PackingListDetailPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-clay-700 dark:text-clay-400">Lade Packliste…</p>}
    >
      <PackingListDetailInner />
    </Suspense>
  );
}
