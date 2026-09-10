"use client";

import { Flag, Pencil, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import type { GearItem, TourReview, WeightFeeling } from "@/types";

/**
 * Das Tourbuch einer Packliste: was die abgeschlossenen Touren ergeben
 * haben.
 *
 * Nach oben gezogen wird, was beim nächsten Packen zählt – das
 * Gewichtsgefühl und die Items, die umsonst mitgereist sind. Die Freitexte
 * stehen darunter, sie liest man beim Vorbereiten, nicht im Vorbeigehen.
 */

const FEELING_STYLES: Record<WeightFeeling, string> = {
  "zu schwer": "text-red-700 dark:text-red-300",
  "genau richtig": "text-aqua-700 dark:text-aqua-300",
  "zu leicht": "text-clay-700 dark:text-clay-300",
};

function formatMoment(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("de-CH", { dateStyle: "medium" }).format(date);
}

export function TourReviewLog({
  reviews,
  gearIndex,
  onEdit,
  onDelete,
}: {
  reviews: TourReview[];
  gearIndex: Map<string, GearItem>;
  onEdit: (review: TourReview) => void;
  onDelete: (review: TourReview) => void;
}) {
  if (reviews.length === 0) return null;

  return (
    <SurfaceCard as="section" className="p-4">
      <h3 className="mb-1 flex items-center gap-2 text-base font-bold text-clay-900 dark:text-clay-50">
        <Flag className="h-4 w-4 text-ember-700 dark:text-ember-200" aria-hidden />
        Tourbuch
      </h3>
      <p className="mb-4 text-sm text-clay-700 dark:text-clay-400">
        {reviews.length === 1
          ? "Eine abgeschlossene Tour."
          : `${reviews.length} abgeschlossene Touren.`}
      </p>

      <ul className="space-y-3">
        {reviews.map((review) => {
          const unused = review.itemReviews
            .filter((entry) => !entry.used)
            .map((entry) => gearIndex.get(entry.gearItemId)?.name)
            .filter((name): name is string => Boolean(name));
          const notes = review.itemReviews
            .filter((entry) => entry.note)
            .map((entry) => ({
              name: gearIndex.get(entry.gearItemId)?.name,
              note: entry.note as string,
            }))
            .filter((entry) => entry.name);

          return (
            <li
              key={review.id}
              className="rounded-control px-3 py-3 shadow-neu-in-sm"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-semibold text-clay-900 dark:text-clay-50">
                  {formatMoment(review.completedAt)}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    FEELING_STYLES[review.generalAnswers.weightFeeling]
                  }`}
                >
                  Gewicht: {review.generalAnswers.weightFeeling}
                </p>
                <span className="ml-auto flex gap-1">
                  <IconButton
                    variant="quiet"
                    onClick={() => onEdit(review)}
                    aria-label={`Auswertung vom ${formatMoment(review.completedAt)} bearbeiten`}
                  >
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    variant="quiet"
                    onClick={() => onDelete(review)}
                    aria-label={`Auswertung vom ${formatMoment(review.completedAt)} löschen`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </span>
              </div>

              {unused.length > 0 && (
                <p className="mt-2 text-sm text-clay-700 dark:text-clay-300">
                  <strong className="font-semibold text-clay-900 dark:text-clay-50">
                    Nicht gebraucht:
                  </strong>{" "}
                  {unused.join(", ")}
                </p>
              )}

              <Answer label="Gut funktioniert" value={review.generalAnswers.whatWorked} />
              <Answer label="Gefehlt" value={review.generalAnswers.whatWasMissing} />
              <Answer label="Weglassen" value={review.generalAnswers.whatToLeaveOut} />
              <Answer label="Notizen" value={review.generalAnswers.notes} />

              {notes.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {notes.map((entry) => (
                    <li
                      key={entry.name}
                      className="text-sm text-clay-700 dark:text-clay-300"
                    >
                      <strong className="font-semibold text-clay-900 dark:text-clay-50">
                        {entry.name}:
                      </strong>{" "}
                      {entry.note}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </SurfaceCard>
  );
}

function Answer({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="mt-2 text-sm text-clay-700 dark:text-clay-300">
      <strong className="font-semibold text-clay-900 dark:text-clay-50">
        {label}:
      </strong>{" "}
      {value}
    </p>
  );
}
