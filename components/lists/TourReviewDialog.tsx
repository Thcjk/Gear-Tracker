"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, Flag, X } from "lucide-react";
import { CampMark } from "@/components/doodle/Doodles";
import { TurtleMascot, getTurtleVariant } from "@/components/mascot/TurtleMascot";
import { Button, IconButton } from "@/components/ui/Button";
import { StampButton } from "@/components/ui/StampButton";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatWeight } from "@/lib/categories";
import type {
  GearItem,
  PackingList,
  PackingListItem,
  TourGeneralAnswers,
  TourItemReview,
  TourReview,
  WeightFeeling,
} from "@/types";

/**
 * "Tour beenden" – die Auswertung nach der Tour.
 *
 * Zwei Schritte statt eines langen Formulars: die allgemeinen Fragen sind
 * schnell beantwortet, die Item-Durchsicht dauert. Wer nur den ersten
 * Schritt ausfüllen mag, kann trotzdem speichern – eine halb ausgefüllte
 * Auswertung ist mehr wert als eine, die nie entsteht.
 *
 * Vorbelegt wird nichts geraten: "benutzt" steht anfangs auf ja, weil man
 * die Ausnahmen sucht und nicht die Regel abhakt. Bei einer Nachbearbeitung
 * kommen die gespeicherten Werte zurück.
 */

const FEELINGS: { value: WeightFeeling; hint: string }[] = [
  { value: "zu schwer", hint: "Der Rucksack hat gedrückt." },
  { value: "genau richtig", hint: "Passte so." },
  { value: "zu leicht", hint: "Da wäre noch Luft gewesen." },
];

interface Draft {
  answers: TourGeneralAnswers;
  reviews: Map<string, TourItemReview>;
}

function draftFrom(list: PackingList, existing?: TourReview): Draft {
  const reviews = new Map<string, TourItemReview>();
  for (const item of list.items) {
    const saved = existing?.itemReviews.find(
      (r) => r.gearItemId === item.gearItemId,
    );
    reviews.set(item.gearItemId, {
      gearItemId: item.gearItemId,
      used: saved ? saved.used : true,
      ...(saved?.note ? { note: saved.note } : {}),
    });
  }
  return {
    answers: existing?.generalAnswers ?? { weightFeeling: "genau richtig" },
    reviews,
  };
}

export function TourReviewDialog({
  list,
  gearIndex,
  existing,
  onSave,
  onClose,
}: {
  list: PackingList;
  gearIndex: Map<string, GearItem>;
  /** Gesetzt, wenn eine bestehende Auswertung nachbearbeitet wird. */
  existing?: TourReview;
  onSave: (
    answers: TourGeneralAnswers,
    itemReviews: TourItemReview[],
  ) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(list, existing));
  /** Nach dem Speichern: kurzer Abschluss statt sofortigem Verschwinden. */
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const items = useMemo(
    () =>
      list.items
        .map((item) => ({ item, gear: gearIndex.get(item.gearItemId) }))
        .filter(
          (entry): entry is { item: PackingListItem; gear: GearItem } =>
            entry.gear !== undefined,
        ),
    [list.items, gearIndex],
  );

  function setAnswer<K extends keyof TourGeneralAnswers>(
    key: K,
    value: TourGeneralAnswers[K],
  ) {
    setDraft((prev) => ({ ...prev, answers: { ...prev.answers, [key]: value } }));
  }

  function setReview(gearItemId: string, patch: Partial<TourItemReview>) {
    setDraft((prev) => {
      const reviews = new Map(prev.reviews);
      const current = reviews.get(gearItemId) ?? { gearItemId, used: true };
      reviews.set(gearItemId, { ...current, ...patch });
      return { ...prev, reviews };
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const answers: TourGeneralAnswers = {
      weightFeeling: draft.answers.weightFeeling,
      ...trimmed("whatWorked"),
      ...trimmed("whatWasMissing"),
      ...trimmed("whatToLeaveOut"),
      ...trimmed("notes"),
    };
    const itemReviews = [...draft.reviews.values()].map((review) => {
      const note = review.note?.trim();
      return {
        gearItemId: review.gearItemId,
        used: review.used,
        ...(note ? { note } : {}),
      };
    });
    onSave(answers, itemReviews);
    setDone(true);
  }

  function trimmed(key: "whatWorked" | "whatWasMissing" | "whatToLeaveOut" | "notes") {
    const value = draft.answers[key]?.trim();
    return value ? { [key]: value } : {};
  }

  const unusedCount = [...draft.reviews.values()].filter((r) => !r.used).length;
  /** Was auf dieser Tour tatsächlich mitgereist ist. */
  const carriedGrams = items.reduce(
    (sum, { item, gear }) => sum + gear.weightGrams * item.quantity,
    0,
  );

  if (done) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tour ausgewertet"
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <SurfaceCard className="animate-rise relative w-full max-w-md p-6 text-center">
          <CampMark className="absolute right-5 top-5 h-9 w-9 rotate-12 text-paper-400 dark:text-paper-600" />
          <TurtleMascot
            totalWeightGrams={carriedGrams}
            variant={getTurtleVariant(list.id)}
            className="mx-auto h-32 w-32"
          />
          <h2 className="mt-4 text-xl font-bold text-paper-800 dark:text-paper-100">
            Tour im Buch
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-paper-700 dark:text-paper-300">
            {unusedCount === 0
              ? "Alles gebraucht – so kann die Liste bleiben."
              : `${unusedCount} ${unusedCount === 1 ? "Item war" : "Items waren"} umsonst dabei. Beim nächsten Packen weisst du es.`}
          </p>
          <StampButton
            stampSeed="tour-fertig"
            type="button"
            onClick={onClose}
            className="mt-5 w-full"
          >
            <Check className="h-4 w-4" />
            Fertig
          </StampButton>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tour beenden – ${list.name}`}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <SurfaceCard className="animate-rise flex max-h-[85vh] w-full max-w-md flex-col p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-200 text-accent shadow-neu-sm dark:bg-paper-900">
            <Flag className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-paper-800 dark:text-paper-100">
              {existing ? "Auswertung bearbeiten" : "Tour beenden"}
            </h2>
            <p className="mt-1 text-sm text-paper-700 dark:text-paper-400">
              Schritt {step} von 2 ·{" "}
              {step === 1 ? "Wie war’s insgesamt?" : "Was hast du gebraucht?"}
            </p>
          </div>
          <IconButton variant="quiet" onClick={onClose} aria-label="Schliessen">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4"
        >
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {step === 1 ? (
              <div className="grid gap-4">
                <fieldset className="grid gap-2">
                  <legend className="neu-label mb-1">Das Gewicht war…</legend>
                  {FEELINGS.map((option) => {
                    const active =
                      draft.answers.weightFeeling === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-control px-3 py-2.5 text-sm ${
                          active ? "shadow-neu-in-sm" : "shadow-neu-sm"
                        }`}
                      >
                        <input
                          type="radio"
                          name="weightFeeling"
                          value={option.value}
                          checked={active}
                          onChange={() =>
                            setAnswer("weightFeeling", option.value)
                          }
                          className="h-4 w-4 shrink-0 accent-rust-600 dark:accent-rust-400"
                        />
                        <span className="min-w-0">
                          <span className="font-semibold text-paper-800 dark:text-paper-100">
                            {option.value}
                          </span>
                          <span className="block text-paper-700 dark:text-paper-400">
                            {option.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </fieldset>

                <TextField
                  label="Was hat gut funktioniert?"
                  value={draft.answers.whatWorked ?? ""}
                  onChange={(value) => setAnswer("whatWorked", value)}
                />
                <TextField
                  label="Was hat gefehlt?"
                  value={draft.answers.whatWasMissing ?? ""}
                  onChange={(value) => setAnswer("whatWasMissing", value)}
                />
                <TextField
                  label="Was würdest du weglassen?"
                  value={draft.answers.whatToLeaveOut ?? ""}
                  onChange={(value) => setAnswer("whatToLeaveOut", value)}
                />
                <TextField
                  label="Notizen"
                  value={draft.answers.notes ?? ""}
                  onChange={(value) => setAnswer("notes", value)}
                />
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-paper-700 dark:text-paper-400">
                In dieser Liste ist kein Item, das sich beurteilen liesse.
              </p>
            ) : (
              <ul className="grid gap-2">
                {items.map(({ item, gear }) => {
                  const review = draft.reviews.get(item.gearItemId);
                  const used = review?.used ?? true;
                  return (
                    <li
                      key={item.gearItemId}
                      className="rounded-control px-3 py-2.5 shadow-neu-in-sm"
                    >
                      <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={used}
                          onChange={() =>
                            setReview(item.gearItemId, { used: !used })
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 accent-rust-600 dark:accent-rust-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block font-semibold ${
                              used
                                ? "text-paper-800 dark:text-paper-100"
                                : "text-paper-700 dark:text-paper-400"
                            }`}
                          >
                            {gear.name}
                          </span>
                          <span className="block text-xs text-paper-700 dark:text-paper-400">
                            {formatWeight(gear.weightGrams * item.quantity)}
                            {used ? " · benutzt" : " · nicht gebraucht"}
                          </span>
                        </span>
                      </label>
                      <input
                        value={review?.note ?? ""}
                        onChange={(e) =>
                          setReview(item.gearItemId, { note: e.target.value })
                        }
                        placeholder="Notiz (optional)"
                        maxLength={140}
                        className="neu-field mt-2 py-2 text-sm"
                        aria-label={`Notiz zu ${gear.name}`}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {step === 2 && items.length > 0 && (
            <p className="text-sm text-paper-700 dark:text-paper-400">
              {unusedCount === 0
                ? "Alles gebraucht."
                : `${unusedCount} ${unusedCount === 1 ? "Item" : "Items"} nicht gebraucht.`}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {step === 1 ? (
              <StampButton stampSeed="tour-weiter" type="button" onClick={() => setStep(2)}>
                Weiter
                <ArrowRight className="h-4 w-4" />
              </StampButton>
            ) : (
              <Button type="button" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
            )}
            <Button type="submit" variant={step === 2 ? "accent" : "raised"}>
              <Check className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="neu-label">{label}</span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={500}
        className="neu-field"
      />
    </label>
  );
}
