"use client";

import { TurtleMascot, STAGE_LABEL, getPackStage } from "@/components/mascot/TurtleMascot";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CATEGORIES, formatWeight } from "@/lib/categories";
import { CATEGORY_NUMBER, FlatlayObject } from "@/components/flatlay/FlatlayObject";

/**
 * Prüfseite für die gezeichneten Bestandteile.
 *
 * Sie ist nicht verlinkt und taucht in keiner Navigation auf – wer sie
 * sehen will, tippt /vorschau. Sie steht trotzdem im Build, weil sich die
 * fünf Gepäckstufen sonst nur mit passend konstruierten Packlisten prüfen
 * liessen.
 */
const SAMPLES = [1500, 4200, 7400, 10600, 14800];

export default function VorschauPage() {
  return (
    <div className="space-y-4">
      <ScreenHeader title="Vorschau" subtitle="Maskottchen und Objekte" />

      <SurfaceCard as="section" className="p-4">
        <h2 className="handwritten mb-3 text-xl font-bold text-paper-800 dark:text-paper-100">
          Schildkröte, fünf Stufen
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SAMPLES.map((grams) => (
            <li
              key={grams}
              className="rounded-control px-2 py-3 text-center shadow-neu-in-sm"
            >
              <TurtleMascot
                totalWeightGrams={grams}
                className="mx-auto h-32 w-32"
              />
              <p className="mt-1 text-sm font-bold tabular-nums text-paper-800 dark:text-paper-100">
                {formatWeight(grams)}
              </p>
              <p className="handwritten text-base leading-tight text-paper-700 dark:text-paper-300">
                Stufe {getPackStage(grams)} · {STAGE_LABEL[getPackStage(grams)]}
              </p>
            </li>
          ))}
        </ul>
      </SurfaceCard>

      <SurfaceCard as="section" className="p-4">
        <h2 className="handwritten mb-3 text-xl font-bold text-paper-800 dark:text-paper-100">
          Flatlay-Objekte, sieben Kategorien
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((meta) => (
            <li
              key={meta.id}
              className="flex flex-col items-center gap-1 rounded-control bg-paper-200 px-2 py-3 text-center shadow-neu-in-sm"
            >
              <FlatlayObject category={meta.id} className="h-14 w-14" />
              <p className="text-xs font-bold tabular-nums text-paper-600">
                {CATEGORY_NUMBER[meta.id]}
              </p>
              <p className="handwritten text-base leading-tight text-paper-800">
                {meta.label}
              </p>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
