"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { PackingListCard } from "@/components/lists/PackingListCard";
import { useAppStore } from "@/lib/store";

export default function ListsPage() {
  const { ready, data, addPackingList, removePackingList } = useAppStore();
  const [name, setName] = useState("");
  const [showForm, setShowForm] = useState(false);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    addPackingList(trimmed);
    setName("");
    setShowForm(false);
  }

  if (!ready) {
    return <p className="text-sm text-earth-500">Lade Listen…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-forest-900 dark:text-forest-50">
            Packlisten
          </h2>
          <p className="text-sm text-earth-600 dark:text-earth-300">
            {data.packingLists.length} Listen
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-2xl bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark"
        >
          <label className="grid gap-2 text-sm">
            <span className="font-medium text-earth-700 dark:text-earth-200">
              Listenname
            </span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Weekend Alps"
              className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="rounded-2xl bg-forest-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Erstellen
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-2xl bg-forest-100 px-4 py-2 text-sm font-medium text-forest-800 dark:bg-forest-800 dark:text-forest-100"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {data.packingLists.length === 0 ? (
          <div className="rounded-card bg-white p-6 text-sm text-earth-600 shadow-soft dark:bg-forest-900 dark:text-earth-300 dark:shadow-soft-dark">
            Noch keine Packlisten. Erstelle eine für deine nächste Tour.
          </div>
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
