"use client";

import { useState } from "react";
import { AlertTriangle, Link2, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import {
  GearItemForm,
  type GearFormValues,
} from "@/components/gear/GearItemForm";
import {
  importAvailable,
  importProduct,
  looksLikeUrl,
  type ImportHit,
} from "@/lib/importProduct";
import type { Category } from "@/types";

/**
 * Produkt-Import per Link.
 *
 * Der Worker liefert einen Vorschlag, nie eine Tatsache: das Ergebnis
 * landet in einem vorausgefüllten Formular, das der Nutzer bestätigt oder
 * korrigiert. Übernommen wird nichts von allein – ein falsch gelesenes
 * Gewicht würde sonst still in die Gesamtrechnung wandern.
 *
 * Findet der Worker nichts oder ist er nicht erreichbar, öffnet sich
 * dasselbe Formular leer, mit dem Link als Notiz. Der Weg endet also nie
 * in einer Sackgasse.
 */

/** Ergebnis eines Laufs, so wie es die Oberfläche zeigt. */
type Outcome =
  | { kind: "hit"; hit: ImportHit }
  | { kind: "miss" }
  | { kind: "error"; message: string };

export function ProductImport({
  onCreate,
}: {
  onCreate: (values: GearFormValues, category: Category) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  /** Der Link, zu dem das offene Formular gehört – nicht das Eingabefeld. */
  const [source, setSource] = useState("");

  if (!importAvailable) return null;

  async function run() {
    const value = url.trim();
    if (!looksLikeUrl(value) || loading) return;
    setLoading(true);
    setOutcome(null);
    const result = await importProduct(value);
    setSource(value);
    setOutcome(
      result.kind === "hit" ? { kind: "hit", hit: result } : result,
    );
    setLoading(false);
  }

  function close() {
    setOutcome(null);
    setSource("");
    setUrl("");
  }

  const canSubmit = looksLikeUrl(url) && !loading;

  return (
    <div className="space-y-3">
      <SurfaceCard as="section" className="p-4">
        <h2 className="mb-1 font-bold text-clay-900 dark:text-clay-50">
          Per Link importieren
        </h2>
        <p className="mb-3 text-sm text-clay-700 dark:text-clay-400">
          Produktseite einfügen – Name, Gewicht und Preis werden
          vorgeschlagen. Du bestätigst sie, bevor etwas gespeichert wird.
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Produkt-Link</span>
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder="https://shop.example/zelt-ultra-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void run();
                }
              }}
              disabled={loading}
              className="neu-field w-full"
            />
          </label>
          <Button
            type="button"
            variant="accent"
            onClick={() => void run()}
            disabled={!canSubmit}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird gelesen…
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" aria-hidden />
                Importieren
              </>
            )}
          </Button>
        </div>
        {/* role="status" statt "alert": die Meldung ist Rückmeldung auf eine
            eigene Aktion, kein Zwischenruf. */}
        <p role="status" className="sr-only">
          {loading ? "Produktseite wird gelesen." : ""}
        </p>
      </SurfaceCard>

      {outcome && (
        <GearItemForm
          key={source}
          title={outcome.kind === "hit" ? "Import prüfen" : "Neues Item"}
          hint={<ImportHint outcome={outcome} source={source} />}
          submitLabel="Hinzufügen"
          initial={initialFor(outcome, source)}
          onSubmit={(values) => {
            onCreate(values, values.category);
            close();
          }}
          onCancel={close}
        />
      )}
    </div>
  );
}

/**
 * Vorausgefüllte Werte. Bei einem Fehlschlag bleibt das Formular leer, der
 * Link steht aber als Notiz drin – dann muss ihn niemand zweimal suchen.
 */
function initialFor(outcome: Outcome, source: string): Partial<GearFormValues> {
  const reference = source ? `Quelle: ${source}` : "";
  if (outcome.kind !== "hit") return { notes: reference };
  const { hit } = outcome;
  return {
    ...(hit.name ? { name: hit.name } : {}),
    ...(hit.weightGrams !== undefined ? { weightGrams: hit.weightGrams } : {}),
    ...(hit.price !== undefined ? { price: hit.price } : {}),
    notes: reference,
  };
}

const HINT_BOX =
  "mt-3 flex items-start gap-2.5 rounded-control px-3 py-2.5 text-sm shadow-neu-in-sm";

function ImportHint({ outcome, source }: { outcome: Outcome; source: string }) {
  if (outcome.kind === "error") {
    return (
      <div className={HINT_BOX}>
        <AlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
          aria-hidden
        />
        <p className="min-w-0 text-clay-700 dark:text-clay-300">
          {outcome.message} Trag die Werte so lange von Hand ein – der Link
          steht in den Notizen.
        </p>
      </div>
    );
  }

  if (outcome.kind === "miss") {
    return (
      <div className={HINT_BOX}>
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-clay-700 dark:text-clay-400"
          aria-hidden
        />
        <p className="min-w-0 text-clay-700 dark:text-clay-300">
          Auf der Seite war nichts Auslesbares. Manche Shops laden ihre
          Angaben erst im Browser nach. Von Hand geht es genauso – der Link
          steht in den Notizen.
        </p>
      </div>
    );
  }

  const { hit } = outcome;
  const foreignCurrency =
    hit.price !== undefined && hit.currency && hit.currency !== "CHF";

  return (
    <div className="mt-3 space-y-2">
      {hit.confidence === "low" && (
        <div className={HINT_BOX}>
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden
          />
          <p className="min-w-0 text-clay-700 dark:text-clay-300">
            Unsicherer Treffer, bitte prüfen.
          </p>
        </div>
      )}
      {foreignCurrency && (
        <div className={HINT_BOX}>
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-clay-700 dark:text-clay-400"
            aria-hidden
          />
          <p className="min-w-0 text-clay-700 dark:text-clay-300">
            Der Preis stand in {hit.currency}. Das Feld rechnet in CHF – bitte
            umrechnen.
          </p>
        </div>
      )}
      <p className="break-words text-xs text-clay-700 dark:text-clay-400">
        Gelesen von {source}
      </p>
    </div>
  );
}
