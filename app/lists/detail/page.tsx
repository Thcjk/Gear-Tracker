"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Flag, Plus, Share2, Wand2 } from "lucide-react";
import {
  TurtleMascot,
  STAGE_LABEL,
  getPackStage,
  getTurtleVariant,
} from "@/components/mascot/TurtleMascot";
import {
  DoodleArrow,
  Footprints,
  WaypointLine,
} from "@/components/doodle/Doodles";
import { Suspense } from "react";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { ShareExportDialog } from "@/components/lists/ShareExportDialog";
import { TourReviewDialog } from "@/components/lists/TourReviewDialog";
import { TourReviewLog } from "@/components/lists/TourReviewLog";
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
import type { TourReview } from "@/types";

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
  const {
    ready,
    data,
    updatePackingList,
    addTourReview,
    updateTourReview,
    removeTourReview,
  } = useAppStore();
  const [selectedGearId, setSelectedGearId] = useState("");
  const [reference, setReference] = useState<WeightSnapshot | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  /** null = zu, "new" = neue Auswertung, sonst die zu bearbeitende. */
  const [reviewing, setReviewing] = useState<TourReview | "new" | null>(null);

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

  /** Neueste zuerst – das letzte Fazit ist das, was man sucht. */
  const reviews = useMemo(
    () =>
      data.tourReviews
        .filter((review) => review.packingListId === id)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [data.tourReviews, id],
  );

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
    return (
      <p className="text-sm text-paper-700 dark:text-paper-400">
        Lade Packliste…
      </p>
    );
  }

  if (!list || !stats) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-paper-700 dark:text-paper-400">
          Packliste nicht gefunden.
        </p>
        <Link href="/lists" className="text-accent underline">
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
    try {
      const { exportPackingListPdf } = await import("@/lib/pdfExport");
      exportPackingListPdf(list, data.gearItems);
    } catch {
      // Der Chunk kann fehlen (offline, halb aktualisierter Cache), und
      // jsPDF kann an ungewöhnlichen Inhalten scheitern. Vorher passierte
      // in beiden Fällen sichtbar nichts.
      setPdfFailed(true);
    }
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

      {/* Die Schildkröte steht über den Zahlen: sie ordnet das Gewicht
          ein, bevor man es gelesen hat. Der ironische Badge weiter unten
          bleibt davon unberührt – er sagt etwas anderes. */}
      <SurfaceCard as="section" pinned={`mascot:${list.id}`} className="p-4">
        <div className="flex items-center gap-4">
          <TurtleMascot
            totalWeightGrams={totalWeight}
            variant={getTurtleVariant(list.id)}
            className="h-32 w-32 shrink-0"
            title={`Schildkröte, ${STAGE_LABEL[getPackStage(totalWeight)]}`}
          />
          <div className="min-w-0">
            <p className="text-2xl font-extrabold tabular-nums text-paper-800 dark:text-paper-100">
              {formatWeight(totalWeight)}
            </p>
            <p className="handwritten text-lg leading-snug text-paper-700 dark:text-paper-300">
              {STAGE_LABEL[getPackStage(totalWeight)]}
            </p>
          </div>
        </div>
      </SurfaceCard>

      {/* Spur von der Schildkröte zu den Kennzahlen. Leicht schief und
          nach links versetzt – mittig ausgerichtet sähe sie nach Trennlinie
          aus statt nach Notiz. */}
      <Footprints className="-my-1 ml-6 h-5 w-40 -rotate-2 text-paper-300 dark:text-paper-700" />

      {pdfFailed && (
        <SurfaceCard as="section" className="p-4" role="alert">
          <p className="text-sm text-paper-800 dark:text-paper-100">
            Das PDF liess sich nicht erzeugen. Versuch es noch einmal – bist
            du offline, klappt es, sobald wieder Empfang da ist.
          </p>
          <Button
            variant="raised"
            onClick={() => setPdfFailed(false)}
            className="mt-3"
          >
            Verstanden
          </Button>
        </SurfaceCard>
      )}

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

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="raised" onClick={() => setSharing(true)}>
          <Share2 className="h-4 w-4" />
          Für Vergleich exportieren
        </Button>
        <Button variant="cool" onClick={() => setReviewing("new")}>
          <Flag className="h-4 w-4" />
          Tour beenden
        </Button>
      </div>

      <TourReviewLog
        reviews={reviews}
        gearIndex={gearIndex}
        onEdit={(review) => setReviewing(review)}
        onDelete={(review) => {
          if (confirm("Diese Auswertung wirklich löschen?")) {
            removeTourReview(review.id);
          }
        }}
      />

      <WaypointLine className="text-paper-200 dark:text-paper-300/50" />

      <CategoryWeightChart data={chartData} />
      <TopHeaviestItems items={heaviest} />

      <SurfaceCard className="p-4">
        <h3 className="mb-3 text-base font-bold text-paper-800 dark:text-paper-100">
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
          <p className="text-sm text-paper-700 dark:text-paper-400">
            Alle Library-Items sind bereits in der Liste, oder die Library ist
            leer.{" "}
            <Link href="/library" className="text-accent underline">
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

      {/* Kleiner Pfeil vom Abschnitt darüber in die Item-Liste */}
      {list.items.length > 0 && (
        <div className="-mb-1 flex items-center gap-2 pl-2">
          <DoodleArrow className="h-7 w-7 text-paper-900 dark:text-paper-100" />
          <span className="handwritten text-base text-paper-900 dark:text-paper-100">
            abhaken, was im Rucksack liegt
          </span>
        </div>
      )}

      <div className="space-y-3">
        {list.items.length === 0 ? (
          <EmptyState
            illustration={
              <TurtleMascot
                totalWeightGrams={0}
                variant={getTurtleVariant(list.id)}
                animated={false}
                className="h-28 w-28"
              />
            }
          >
            Noch nichts gepackt. Such dir unten ein Item aus der Library oder
            geh die Kategorien durch.
          </EmptyState>
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
                      i.gearItemId === item.gearItemId ? { ...i, quantity } : i,
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
      {reviewing && (
        <TourReviewDialog
          list={list}
          gearIndex={gearIndex}
          existing={reviewing === "new" ? undefined : reviewing}
          onSave={(answers, itemReviews) => {
            if (reviewing === "new") {
              addTourReview({
                packingListId: list.id,
                generalAnswers: answers,
                itemReviews,
              });
            } else {
              updateTourReview({
                ...reviewing,
                generalAnswers: answers,
                itemReviews,
              });
            }
            // Der Dialog bleibt stehen und zeigt seinen Abschluss; er
            // schliesst sich über onClose selbst.
          }}
          onClose={() => setReviewing(null)}
        />
      )}
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
      fallback={
        <p className="text-sm text-paper-700 dark:text-paper-400">
          Lade Packliste…
        </p>
      }
    >
      <PackingListDetailInner />
    </Suspense>
  );
}
