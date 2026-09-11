"use client";

import {
  TurtleMascot,
  STAGE_LABEL,
  getPackStage,
  TURTLE_VARIANTS,
} from "@/components/mascot/TurtleMascot";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CATEGORIES, formatWeight } from "@/lib/categories";
import { CATEGORY_NUMBER, FlatlayObject } from "@/components/flatlay/FlatlayObject";
import {
  CampMark,
  Compass,
  DoodleArrow,
  Footprints,
  WaypointLine,
} from "@/components/doodle/Doodles";

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
                variant={0}
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
          Panzer-Varianten
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TURTLE_VARIANTS.map((_, index) => (
            <li
              key={index}
              className="rounded-control px-2 py-3 text-center shadow-neu-in-sm"
            >
              <TurtleMascot
                totalWeightGrams={7400}
                variant={index}
                animated={false}
                className="mx-auto h-28 w-28"
              />
              <p className="handwritten text-base text-paper-700 dark:text-paper-300">
                Variante {index}
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

      <SurfaceCard as="section" className="p-4">
        <h2 className="handwritten mb-3 text-xl font-bold text-paper-800 dark:text-paper-100">
          Doodles
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Kompass", <Compass key="c" className="h-14 w-14 -rotate-6" />],
            ["Lagerplatz", <CampMark key="m" className="h-14 w-14 rotate-3" />],
            ["Fussspuren", <Footprints key="f" className="h-8 w-32 -rotate-2" />],
            ["Pfeil, gebogen", <DoodleArrow key="a1" className="h-12 w-12" />],
            ["Pfeil, gerade", <DoodleArrow key="a2" variant="straight" className="h-12 w-12 rotate-6" />],
            ["Pfeil, Haken", <DoodleArrow key="a3" variant="hook" className="h-12 w-12 -rotate-3" />],
          ].map(([label, el]) => (
            <li
              key={label as string}
              className="flex flex-col items-center justify-end gap-2 rounded-control px-2 py-4 text-center text-accent shadow-neu-in-sm"
            >
              {el as JSX.Element}
              <span className="handwritten text-base text-paper-700 dark:text-paper-300">
                {label as string}
              </span>
            </li>
          ))}
        </ul>
        <WaypointLine className="mt-4 text-paper-300 dark:text-paper-700" />
      </SurfaceCard>
    </div>
  );
}
