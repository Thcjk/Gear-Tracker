"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Category, GearDraft, GearItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { StampButton } from "@/components/ui/StampButton";
import { SURFACE_CLASSES } from "@/components/ui/SurfaceCard";
import {
  CATEGORIES,
  COMFORT_TEMP_MAX,
  COMFORT_TEMP_MIN,
  hasComfortTemp,
} from "@/lib/categories";

/** Formularwerte entsprechen exakt einem Gear-Item ohne id/createdAt. */
export type GearFormValues = GearDraft;

const emptyValues: GearFormValues = {
  name: "",
  category: "shelter",
  weightGrams: 0,
  price: undefined,
  comfortTempC: undefined,
  notes: "",
};

export function GearItemForm({
  initial,
  title,
  hint,
  submitLabel,
  hideCategory = false,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<GearFormValues>;
  title: string;
  /** Platz für Herkunftshinweise, etwa beim Import per Link. */
  hint?: ReactNode;
  submitLabel: string;
  /** Kommt die Kategorie aus dem Kontext (Library-Sektion), entfällt die Auswahl. */
  hideCategory?: boolean;
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

  const showComfortTemp = hasComfortTemp(values.category);

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
      // Nach einem Kategoriewechsel wäre ein stehengebliebener Wert
      // nirgends mehr sichtbar und damit nicht mehr korrigierbar.
      comfortTempC:
        showComfortTemp &&
        values.comfortTempC !== undefined &&
        !Number.isNaN(values.comfortTempC)
          ? values.comfortTempC
          : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${SURFACE_CLASSES} sheet-card animate-rise p-5`}
    >
      <h2 className="text-lg font-bold text-paper-800 dark:text-paper-100">
        {title}
      </h2>
      {hint}
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
        <label className={`grid gap-1 text-sm ${hideCategory ? "hidden" : ""}`}>
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
        {showComfortTemp && (
          <label className="grid gap-1 text-sm">
            <span className="neu-label">Komforttemperatur (°C)</span>
            <input
              type="number"
              min={COMFORT_TEMP_MIN}
              max={COMFORT_TEMP_MAX}
              step="0.5"
              // Minuszeichen sind der Normalfall; ohne die Angabe zeigt iOS
              // ein Ziffernfeld ganz ohne Vorzeichentaste.
              inputMode="text"
              placeholder="z. B. -5"
              value={values.comfortTempC ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  comfortTempC:
                    e.target.value === "" ? undefined : Number(e.target.value),
                }))
              }
              className="neu-field"
            />
          </label>
        )}
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
        <StampButton type="submit">{submitLabel}</StampButton>
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
    comfortTempC: item.comfortTempC,
    notes: item.notes,
  };
}
