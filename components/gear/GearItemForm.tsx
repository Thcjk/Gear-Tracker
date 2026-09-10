"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Category, GearDraft, GearItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { SURFACE_CLASSES } from "@/components/ui/SurfaceCard";
import { CATEGORIES } from "@/lib/categories";

/** Formularwerte entsprechen exakt einem Gear-Item ohne id/createdAt. */
export type GearFormValues = GearDraft;

const emptyValues: GearFormValues = {
  name: "",
  category: "shelter",
  weightGrams: 0,
  price: undefined,
  notes: "",
};

export function GearItemForm({
  initial,
  title,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<GearFormValues>;
  title: string;
  submitLabel: string;
  onSubmit: (values: GearFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<GearFormValues>({
    ...emptyValues,
    ...initial,
  });

  useEffect(() => {
    setValues({ ...emptyValues, ...initial });
  }, [initial]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!values.name.trim() || values.weightGrams <= 0) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      notes: values.notes?.trim() || undefined,
      price:
        values.price === undefined || Number.isNaN(values.price)
          ? undefined
          : values.price,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${SURFACE_CLASSES} animate-rise p-5`}
    >
      <h2 className="text-lg font-bold text-clay-900 dark:text-clay-50">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="neu-label">
            Name
          </span>
          <input
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="neu-field"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="neu-label">
            Kategorie
          </span>
          <select
            value={values.category}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                category: e.target.value as Category,
              }))
            }
            className="neu-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span className="neu-label">
              Gewicht (g)
            </span>
            <input
              required
              type="number"
              min={1}
              value={values.weightGrams || ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  weightGrams: Number(e.target.value),
                }))
              }
              className="neu-field"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="neu-label">
              Preis (CHF)
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.price ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  price:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
              className="neu-field"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="neu-label">
            Notizen
          </span>
          <textarea
            rows={2}
            value={values.notes ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, notes: e.target.value }))
            }
            className="neu-field"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" variant="accent">
          {submitLabel}
        </Button>
        <Button type="button" variant="raised" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

export function gearItemToFormValues(item: GearItem): GearFormValues {
  return {
    name: item.name,
    category: item.category,
    weightGrams: item.weightGrams,
    price: item.price,
    notes: item.notes,
  };
}
