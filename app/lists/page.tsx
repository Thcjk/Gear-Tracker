"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PackingListCard } from "@/components/lists/PackingListCard";
import { Button } from "@/components/ui/Button";
import { StampButton } from "@/components/ui/StampButton";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState, SURFACE_CLASSES } from "@/components/ui/SurfaceCard";
import { TurtleMascot } from "@/components/mascot/TurtleMascot";
import { Compass } from "@/components/doodle/Doodles";
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
    return <p className="text-sm text-paper-700 dark:text-paper-400">Lade Listen…</p>;
  }

  return (
    <div className="space-y-4">
      <ScreenHeader
        title="Packlisten"
        subtitle={`${data.packingLists.length} Listen`}
        action={
          <StampButton stampSeed="neue-liste" onClick={() => setShowForm((v) => !v)}>
            <Plus className="h-4 w-4" />
            Neu
          </StampButton>
        }
      />

      {showForm && (
        <form
          onSubmit={handleCreate}
          className={`${SURFACE_CLASSES} sheet-card animate-rise p-5`}
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
            <StampButton type="submit">Erstellen</StampButton>
            <Button type="button" onClick={() => setShowForm(false)}>
              Abbrechen
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.packingLists.length === 0 ? (
          <EmptyState
            seed="leer:listen"
            illustration={
              <span className="relative block">
                {/* Der Kompass liegt hinter der Figur und ist leicht
                    schief – als Deko, nicht als zweites Symbol. */}
                <Compass className="absolute -left-10 -top-4 h-32 w-32 -rotate-12 text-paper-400 opacity-50 dark:text-paper-600" />
                <TurtleMascot
                  totalWeightGrams={0}
                  animated={false}
                  className="relative h-28 w-28"
                />
              </span>
            }
          >
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
                // Die Auswertungen hängen an der Liste und gehen mit ihr –
                // das gehört in die Frage, nicht in eine Überraschung danach.
                const attached = data.tourReviews.filter(
                  (review) => review.packingListId === id,
                ).length;
                const question = attached
                  ? `Packliste wirklich löschen? ${attached} ${
                      attached === 1 ? "Tour-Auswertung geht" : "Tour-Auswertungen gehen"
                    } mit.`
                  : "Packliste wirklich löschen?";
                if (confirm(question)) {
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
