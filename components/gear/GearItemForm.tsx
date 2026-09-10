"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Category, GearItem } from "@/types";
import { CATEGORIES } from "@/lib/categories";

export type GearFormValues = {
  name: string;
  category: Category;
  weightGrams: number;
  price?: number;
  notes?: string;
};

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
      className="rounded-card border border-forest-200 bg-white p-4 shadow-soft dark:border-forest-800 dark:bg-forest-900 dark:shadow-soft-dark"
    >
      <h2 className="text-lg font-semibold text-forest-900 dark:text-forest-50">
        {title}
      </h2>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-earth-700 dark:text-earth-200">
            Name
          </span>
          <input
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-earth-700 dark:text-earth-200">
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
            className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
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
            <span className="font-medium text-earth-700 dark:text-earth-200">
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
              className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium text-earth-700 dark:text-earth-200">
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
              className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-earth-700 dark:text-earth-200">
            Notizen
          </span>
          <textarea
            rows={2}
            value={values.notes ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, notes: e.target.value }))
            }
            className="rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 dark:border-forest-700 dark:bg-forest-950"
          />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="rounded-2xl bg-ember-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ember-600"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl bg-forest-100 px-4 py-2 text-sm font-medium text-forest-800 dark:bg-forest-800 dark:text-forest-100"
        >
          Abbrechen
        </button>
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
