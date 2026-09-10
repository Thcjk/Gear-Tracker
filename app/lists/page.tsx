"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PackingListCard } from "@/components/lists/PackingListCard";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState, SURFACE_CLASSES } from "@/components/ui/SurfaceCard";
import { useAppStore } from "@/lib/store";

export default function ListsPage() {
  const router = useRouter();
  const { ready, data, addPackingList, removePackingList } = useAppStore();
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const list = addPackingList(trimmed);
    setName("");
    setShowForm(false);
    // Direkt in den geführten Kategorie-Durchlauf statt in eine leere Liste
    router.push(`/lists/wizard?id=${list.id}`);
  }

  if (!ready) {
    return <p className="text-sm text-clay-700 dark:text-clay-400">Lade Listen…</p>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Packlisten"
        subtitle={`${data.packingLists.length} Listen`}
        action={
          <Button variant="accent" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Neu
          </Button>
        }
      />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className={`${SURFACE_CLASSES} animate-rise p-5`}
        >
          <label className="grid gap-2 text-sm">
            <span className="neu-label">
              Listenname
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Weekend Alps"
              className="neu-field"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <Button type="submit" variant="forest">
              Erstellen
            </Button>
            <Button type="button" onClick={() => setShowForm(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.packingLists.length === 0 ? (
          <EmptyState>
            Noch keine Packlisten. Erstelle eine für deine nächste Tour.
          </EmptyState>
        ) : (
          data.packingLists.map((list, index) => (
            <PackingListCard
              key={list.id}
              list={list}
              index={index}
              gearItems={data.gearItems}
              onDelete={(id) => {
                if (confirm("Packliste wirklich löschen?")) {
                  removePackingList(id);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
