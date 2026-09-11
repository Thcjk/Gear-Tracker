"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { NoteInput } from "@/components/ui/NoteInput";
import { searchPlaces, type Destination, type GeoHit } from "@/lib/weather";

/**
 * Zielort setzen.
 *
 * Das Feld ist die einzige Stelle der App, an der etwas nach draussen
 * geht – deshalb steht unter der Suche, was dabei passiert, und nicht im
 * Kleingedruckten irgendwo anders.
 *
 * Gesucht wird erst nach einer kurzen Pause im Tippen und ab zwei
 * Zeichen. Ein Request pro Tastendruck wäre auf einer Tour im Funkloch
 * genau die Art Verschwendung, die man nicht merkt, bis der Akku leer
 * ist.
 */
const DEBOUNCE_MS = 450;

export function DestinationField({
  destination,
  onChange,
}: {
  destination?: Destination;
  onChange: (destination: Destination | undefined) => void;
}) {
  const [term, setTerm] = useState("");
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  /**
   * Läuft mit, damit eine langsame Antwort eine schnellere nicht
   * überschreibt: ohne den Zähler kann die Antwort auf "Be" nach der auf
   * "Bern" eintreffen und die Treffer wieder verschlechtern.
   */
  const run = useRef(0);

  useEffect(() => {
    const query = term.trim();
    if (query.length < 2) {
      setHits([]);
      setSearched(false);
      return;
    }

    const mine = ++run.current;
    setBusy(true);
    const timer = window.setTimeout(async () => {
      const found = await searchPlaces(query);
      if (run.current !== mine) return;
      setHits(found);
      setSearched(true);
      setBusy(false);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      setBusy(false);
    };
  }, [term]);

  if (destination) {
    return (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        <p className="min-w-0 flex-1 break-words font-semibold text-paper-800 dark:text-paper-100">
          {destination.name}
        </p>
        <IconButton
          variant="quiet"
          onClick={() => {
            onChange(undefined);
            setTerm("");
            setHits([]);
            setSearched(false);
          }}
          aria-label="Zielort entfernen"
        >
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    );
  }

  return (
    <div>
      <NoteInput
        label="Zielort"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="z.B. Grindelwald"
        autoComplete="off"
      />

      <p className="mt-2 text-xs text-paper-700 dark:text-paper-400">
        Für die Suche geht der eingetippte Ort an open-meteo.com, für die
        Vorhersage die Koordinaten. Sonst verlässt nichts dieses Gerät.
      </p>

      {busy && (
        <p className="mt-2 flex items-center gap-2 text-sm text-paper-700 dark:text-paper-400">
          <Search className="h-4 w-4 animate-pulse" aria-hidden />
          Suche…
        </p>
      )}

      <ul className="mt-2 space-y-2 empty:hidden">
        {hits.map((hit) => (
          <li key={`${hit.lat},${hit.lon}`}>
            <Button
              onClick={() => onChange({ name: hit.name, lat: hit.lat, lon: hit.lon })}
              className="w-full justify-start text-left"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">
                {hit.name}
                {hit.detail && (
                  <span className="font-normal text-paper-700 dark:text-paper-400">
                    {" · "}
                    {hit.detail}
                  </span>
                )}
              </span>
            </Button>
          </li>
        ))}
      </ul>

      {searched && !busy && hits.length === 0 && (
        <p className="mt-2 text-sm text-paper-700 dark:text-paper-400">
          Kein Ort gefunden – oder gerade keine Verbindung.
        </p>
      )}
    </div>
  );
}
