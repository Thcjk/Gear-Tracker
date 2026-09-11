"use client";

import { useEffect, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconButton } from "@/components/ui/Button";
import { DialogOverlay } from "@/components/ui/DialogOverlay";
import type { Destination } from "@/lib/weather";

/**
 * Der Zielort auf der Karte: klein und ruhig in der Packliste, gross und
 * bedienbar, wenn man sie antippt.
 *
 * Die Vorschau ist bewusst tot – kein Ziehen, kein Zoomen, kein Rad. Eine
 * halbe Karte, die beim Scrollen den Finger abfängt, wäre auf dem Telefon
 * nur ärgerlich. Wer wirklich schauen will, tippt sie an und bekommt eine
 * ganze.
 *
 * Die Namensnennung von OpenStreetMap steht in beiden Ansichten als
 * echter, verlinkter Text. Sie ist keine Verzierung, sondern die
 * Bedingung, unter der die Kacheln benutzt werden dürfen.
 */

/**
 * Leaflets eigener Marker lädt drei PNG-Dateien über relative Pfade, die
 * unter einem basePath ins Leere zeigen. Ein eigenes Icon aus Inline-SVG
 * spart die Requests und trifft ausserdem den Stil der App.
 */
const PIN = L.divIcon({
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 26],
  html: `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden
    style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.5))">
    <path d="M12 1.8 C7.6 1.8 4.6 5 4.6 9 C4.6 14.4 12 22.4 12 22.4
             C12 22.4 19.4 14.4 19.4 9 C19.4 5 16.4 1.8 12 1.8 Z"
          fill="#A8401F" stroke="#F3ECDC" stroke-width="1.6"/>
    <circle cx="12" cy="9" r="2.8" fill="#F3ECDC"/>
  </svg>`,
});

/**
 * Leaflet misst die Containergrösse beim Anlegen. Im Overlay läuft zu
 * diesem Zeitpunkt noch die Einblend-Animation, und die Karte merkt sich
 * eine zu kleine Fläche – sichtbar als grauer Streifen am Rand. Ein
 * invalidateSize nach dem ersten Frame räumt das auf.
 */
function Resize() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 260);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

function MapCanvas({
  destination,
  zoom,
  interactive,
  onTiles,
}: {
  destination: Destination;
  zoom: number;
  interactive: boolean;
  onTiles?: (state: "da" | "weg") => void;
}) {
  const center: [number, number] = [destination.lat, destination.lon];
  return (
    <MapContainer
      // Leaflet setzt das Zentrum nur beim Anlegen. Ohne den Schlüssel
      // bliebe die Karte beim Wechsel des Zielorts auf dem alten
      // Ausschnitt stehen.
      key={`${destination.lat},${destination.lon},${zoom},${interactive}`}
      center={center}
      zoom={zoom}
      zoomControl={interactive}
      attributionControl={false}
      dragging={interactive}
      touchZoom={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
    >
      {interactive && <Resize />}
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={18}
        eventHandlers={
          onTiles
            ? {
                tileload: () => onTiles("da"),
                tileerror: () => onTiles("weg"),
              }
            : undefined
        }
      />
      <Marker position={center} icon={PIN} />
    </MapContainer>
  );
}

/** Die Lizenzzeile. Ein Link, den man auch treffen kann. */
function Attribution({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-paper-700 dark:text-paper-400 ${className}`}>
      Karte{" "}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        // Negativer Rand plus Innenabstand: die Zeile bleibt schmal, die
        // Trefferfläche des Links wird 40 px hoch.
        className="-my-2 inline-flex min-h-10 items-center px-1 underline decoration-dotted underline-offset-2"
      >
        &copy; OpenStreetMap
      </a>
    </p>
  );
}

/**
 * Die grosse Ansicht.
 *
 * Gleiches Muster wie die übrigen Dialoge der App: dunkler Grund, Escape
 * und Tippen daneben schliessen. Bewusst KEIN Wischen nach unten – die
 * Karte darin wird gezogen, und eine Geste, die mal die Karte bewegt und
 * mal den Dialog schliesst, ist schlimmer als keine. Die anderen Dialoge
 * kennen sie ohnehin nicht.
 *
 * Der Start-Zoom liegt drei Stufen weiter draussen als die Vorschau: beim
 * Öffnen will man zuerst wissen, wo das überhaupt ist.
 */
function MapDialog({
  destination,
  zoom,
  onClose,
}: {
  destination: Destination;
  zoom: number;
  onClose: () => void;
}) {
  return (
    <DialogOverlay label={`Karte: ${destination.name}`} onClose={onClose}>
      <div className="animate-splash-in flex max-h-[88vh] w-full max-w-2xl flex-col gap-3 rounded-card bg-paper-100 p-3 shadow-sheet dark:bg-paper-900">
        <div className="flex items-center gap-3 px-1">
          <h2 className="handwritten min-w-0 flex-1 break-words text-xl font-bold text-paper-800 dark:text-paper-100">
            {destination.name}
          </h2>
          {/* autoFocus: der Fokus muss in den Dialog, sonst tabbt man
              hinter ihm weiter. Dasselbe Mittel wie in den anderen
              Dialogen der App. */}
          <IconButton
            autoFocus
            variant="quiet"
            onClick={onClose}
            aria-label="Karte schliessen"
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-control shadow-neu-in-sm [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-paper-300">
          <div className="h-[60vh] max-h-[70vh] min-h-[16rem]">
            <MapCanvas
              destination={destination}
              zoom={zoom}
              interactive
            />
          </div>
        </div>

        <Attribution className="px-1 text-right" />
      </div>
    </DialogOverlay>
  );
}

export default function MapPreview({
  destination,
  zoom = 11,
}: {
  destination: Destination;
  zoom?: number;
}) {
  const [tiles, setTiles] = useState<"warten" | "da" | "weg">("warten");
  const [open, setOpen] = useState(false);

  // Erst wenn eine Kachel gescheitert ist UND keine angekommen, gilt die
  // Karte als unerreichbar: am Rand des Ausschnitts schlägt über dem Meer
  // regelmässig eine einzelne Kachel fehl, während der Rest steht.
  if (tiles === "weg") return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Karte von ${destination.name} gross anzeigen`}
        className="group relative block w-full overflow-hidden rounded-control shadow-neu-in-sm transition-shadow hover:shadow-neu"
      >
        {/*
          pointer-events:none auf der Vorschaukarte.

          Leaflet hängt seine Handler auch dann an den Container, wenn alle
          Interaktionen aus sind; ohne das hier verschluckt die Karte den
          Tipp, der sie eigentlich öffnen soll. aria-hidden, weil ein
          Kachelbild ohne Bedienung für einen Screenreader keine
          Information ist – der Knopf darüber ist beschriftet.
        */}
        <div
          aria-hidden
          className="pointer-events-none h-40 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-paper-300"
        >
          <MapCanvas
            destination={destination}
            zoom={zoom}
            interactive={false}
            onTiles={(state) =>
              setTiles((prev) => (prev === "da" ? prev : state))
            }
          />
        </div>
        {/* Der Hinweis, dass da mehr ist. Klein und in der Ecke – ein
            Banner über der Karte würde genau das verdecken, worum es
            geht. */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-paper-100/90 text-paper-800 shadow-neu-sm transition-transform group-hover:scale-110 dark:bg-paper-900/90 dark:text-paper-100"
        >
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      <Attribution className="mt-0.5 text-right" />

      {open && (
        <MapDialog
          destination={destination}
          // Drei Stufen weiter draussen: beim Öffnen will man zuerst
          // wissen, wo das überhaupt ist.
          zoom={Math.max(3, zoom - 3)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
