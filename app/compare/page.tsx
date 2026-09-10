"use client";

import { useMemo, useState } from "react";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
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
    return <p className="text-sm text-earth-500">Lade Vergleich…</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-forest-900 dark:text-forest-50">
          Vergleich
        </h2>
        <p className="text-sm text-earth-600 dark:text-earth-300">
          Wähle zwei oder mehr Packlisten.
        </p>
      </div>

      {data.packingLists.length === 0 ? (
        <EmptyState>Noch keine Packlisten zum Vergleichen.</EmptyState>
      ) : (
        <SurfaceCard className="space-y-2 p-4">
          {data.packingLists.map((list) => (
            <label
              key={list.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-forest-50 dark:hover:bg-forest-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(list.id)}
                onChange={() => toggle(list.id)}
                className="h-4 w-4 rounded border-forest-300 text-ember-500"
              />
              <span className="font-medium text-forest-900 dark:text-forest-50">
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
