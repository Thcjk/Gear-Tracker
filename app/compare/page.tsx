"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState, SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAppStore } from "@/lib/store";

export default function ComparePage() {
  const { ready, data } = useAppStore();
  const [selected, setSelected] = useState<string[]>([]);

  const selectedLists = useMemo(
    () => data.packingLists.filter((l) => selected.includes(l.id)),
    [data.packingLists, selected],
  );

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  if (!ready) {
    return <p className="text-sm text-clay-600 dark:text-clay-400">Lade Vergleich…</p>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader title="Vergleich" subtitle="Wähle zwei oder mehr Packlisten." />

      {data.packingLists.length === 0 ? (
        <EmptyState>Noch keine Packlisten zum Vergleichen.</EmptyState>
      ) : (
        <SurfaceCard className="space-y-2 p-4">
          {data.packingLists.map((list) => (
            <label
              key={list.id}
              className="flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 transition-shadow active:shadow-neu-in-sm"
            >
              <span className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(list.id)}
                  onChange={() => toggle(list.id)}
                  className="h-5 w-5 cursor-pointer appearance-none rounded-md bg-clay-200 shadow-neu-sm transition-all checked:bg-ember-500 checked:shadow-neu-in-sm dark:bg-clay-950"
                />
                {/* appearance-none nimmt der Checkbox den Haken */}
                <Check
                  className={`pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white transition-opacity ${
                    selected.includes(list.id) ? "opacity-100" : "opacity-0"
                  }`}
                  strokeWidth={3}
                  aria-hidden
                />
              </span>
              <span className="font-semibold text-clay-900 dark:text-clay-50">
                {list.name}
              </span>
            </label>
          ))}
        </SurfaceCard>
      )}

      <ComparisonTable lists={selectedLists} gearItems={data.gearItems} />
    </div>
  );
}
