"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { GearItem } from "@/types";
import { ComfortTempBadge } from "@/components/gear/ComfortTempBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatPrice, formatWeight, getCategoryMeta } from "@/lib/categories";
import { staggerDelay } from "@/lib/stagger";

export function GearItemCard({
  item,
  index = 0,
  showCategory = true,
  onEdit,
  onDelete,
}: {
  item: GearItem;
  index?: number;
  /** In einer Kategorie-Sektion wäre die Zeile auf jeder Karte redundant. */
  showCategory?: boolean;
  onEdit: (item: GearItem) => void;
  onDelete: (id: string) => void;
}) {
  const meta = getCategoryMeta(item.category);

  return (
    <SurfaceCard
      as="article"
      pinned={item.id}
      className="group/card animate-rise p-4"
      style={{ animationDelay: staggerDelay(index) }}
    >
      {/* Antippfläche über der ganzen Karte.
          
          Als eigenes Element und nicht als ::after am Bearbeiten-Knopf:
          der bekommt beim Drücken active:translate-y-px, und ein transform
          macht ihn zum Bezugsrahmen seines eigenen Pseudo-Elements. Die
          Fläche schrumpft dann zwischen mousedown und mouseup auf
          Knopfgrösse zusammen, das Klick-Ereignis landet beim gemeinsamen
          Vorfahren – und nichts passiert. Auf den Listen-Karten geht der
          ::after-Weg, weil ein Link keinen solchen Effekt hat.
          
          Für Tastatur und Screenreader zählt weiter der beschriftete
          Knopf weiter unten; diese Fläche ist nur für den Daumen da. Sie
          steht zuerst im Markup; darüber liegen nur die beiden Knöpfe,
          die dafür ausdrücklich z-10 tragen. Der übrige Inhalt bleibt
          unpositioniert, sonst läge er über der Fläche und der Klick
          käme nie an. */}
      <span
        aria-hidden
        onClick={() => onEdit(item)}
        className="absolute inset-0 cursor-pointer rounded-card"
      />

      <div className="flex items-start gap-3">
        <CategoryIcon category={item.category} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {/* min-w-0 lässt die Spalte schmaler werden als der Name lang
                ist; ohne das schob ein langer Name das Gewicht aus der
                Karte und eines von beiden war nicht mehr zu sehen. Der
                Name bricht um, statt abgeschnitten zu werden – er ist das
                Einzige, woran man ein Item wiedererkennt. */}
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-base font-bold leading-snug text-paper-800 dark:text-paper-100">
                {item.name}
              </h3>
              {showCategory && (
                <p className="mt-0.5 text-sm text-paper-700 dark:text-paper-400">
                  {meta.label}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-extrabold text-olive-700 dark:text-olive-300">
                {formatWeight(item.weightGrams)}
              </p>
              {item.price != null && (
                <p className="text-sm text-paper-700 dark:text-paper-400">
                  {formatPrice(item.price)}
                </p>
              )}
            </div>
          </div>
          {item.comfortTempC != null && (
            <ComfortTempBadge celsius={item.comfortTempC} className="mt-2" />
          )}
          {item.notes && (
            <p className="mt-2 line-clamp-2 text-sm text-paper-700 dark:text-paper-400">
              {item.notes}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              variant="raised"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="relative z-10 px-3 py-2 text-[0.8125rem]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Bearbeiten
            </Button>
            {/* Über der Fläche darunter, sonst öffnet Löschen das Formular. */}
            <Button
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="relative z-10 px-3 py-2 text-[0.8125rem]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Löschen
            </Button>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
