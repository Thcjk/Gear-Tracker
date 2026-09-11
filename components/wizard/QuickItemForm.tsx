"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type { Category, GearDraft } from "@/types";
import { Button } from "@/components/ui/Button";
import { NoteInput } from "@/components/ui/NoteInput";
import { getCategoryMeta } from "@/lib/categories";

/**
 * Mini-Formular im Wizard: legt ein Item an, das gleichzeitig in die
 * Gear-Library und in die aktuelle Packliste wandert. Die Kategorie kommt
 * aus dem Schritt und wird deshalb nicht abgefragt.
 */
export function QuickItemForm({
  category,
  onCreate,
}: {
  category: Category;
  onCreate: (draft: GearDraft) => void;
}) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const weightGrams = Number(weight);
  const valid = name.trim() !== "" && Number.isFinite(weightGrams) && weightGrams > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const parsedPrice = Number(price);
    onCreate({
      name: name.trim(),
      category,
      weightGrams,
      ...(price !== "" && Number.isFinite(parsedPrice) && parsedPrice >= 0
        ? { price: parsedPrice }
        : {}),
    });

    setName("");
    setWeight("");
    setPrice("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <NoteInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={`z.B. ${getCategoryMeta(category).label}-Item`}
      />

      <div className="grid grid-cols-2 gap-3">
        <NoteInput
          label="Gewicht (g)"
          type="number"
          min={1}
          inputMode="numeric"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <NoteInput
          label="Preis (CHF)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="optional"
        />
      </div>

      <Button type="submit" variant="cool" disabled={!valid}>
        <Plus className="h-4 w-4" />
        Anlegen und übernehmen
      </Button>
    </form>
  );
}
