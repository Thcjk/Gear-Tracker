"use client";

import { useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Destination } from "@/lib/weather";

/**
 * Ein Blick auf die Karte, mehr nicht.
 *
 * Nichts daran ist bedienbar: kein Ziehen, kein Zoomen, kein Rad, kein
 * Doppelklick. Die Karte liegt in einer Packliste wie ein eingeklebter
 * Ausschnitt – wer wirklich navigieren will, hat dafür eine Karten-App,
 * und eine halbe Karte, die den Finger abfängt, während man scrollt,
 * wäre auf dem Telefon schlicht ärgerlich.
 *
 * Deshalb steht sie auch auf aria-hidden und ist nicht per Tab
 * erreichbar: für Screenreader ist der Ortsname daneben die Information,
 * ein Kachelbild ohne Bedienung ist keine.
 *
 * Die Namensnennung von OpenStreetMap bleibt sichtbar. Sie ist keine
 * Verzierung, sondern die Bedingung, unter der die Kacheln benutzt
 * werden dürfen – und sie steht als echter Text UNTER der Karte statt in
 * Leaflets eigenem Kästchen darin: das Kästchen bringt sein eigenes
 * Weiss, sein eigenes Blau und ein "Leaflet"-Logo mit, und es läge
 * innerhalb des aria-hidden-Bereichs, wäre also für Screenreader weg.
 * Eine Lizenzangabe, die man nicht vorlesen kann, ist keine.
 *
 * Kommt keine einzige Kachel an – offline, gesperrter Kachelserver –,
 * verschwindet der Block ganz, wie der Wetterstreifen auch. Ein leeres
 * graues Rechteck mit einer Nadel darin sähe aus wie ein Fehler, und in
 * einer Packliste ist es schlicht Lärm.
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

export default function MapPreview({
  destination,
  zoom = 11,
}: {
  destination: Destination;
  zoom?: number;
}) {
  const center: [number, number] = [destination.lat, destination.lon];
  const [tiles, setTiles] = useState<"warten" | "da" | "weg">("warten");

  // Erst wenn eine Kachel gescheitert ist UND keine angekommen, gilt die
  // Karte als unerreichbar: am Rand des Ausschnitts schlägt über dem Meer
  // regelmässig eine einzelne Kachel fehl, während der Rest steht.
  if (tiles === "weg") return null;

  return (
    <div className="mt-3">
      <div
        aria-hidden
        className="h-40 overflow-hidden rounded-control shadow-neu-in-sm [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-paper-300"
      >
      <MapContainer
        // key: Leaflet setzt das Zentrum nur beim Anlegen. Ohne den
        // Schlüssel bliebe die Karte beim Wechsel des Zielorts auf dem
        // alten Ausschnitt stehen.
        key={`${destination.lat},${destination.lon}`}
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={18}
          eventHandlers={{
            tileload: () => setTiles("da"),
            tileerror: () => setTiles((state) => (state === "da" ? state : "weg")),
          }}
        />
        <Marker position={center} icon={PIN} />
      </MapContainer>
      </div>
      <p className="mt-0.5 text-right text-xs text-paper-700 dark:text-paper-400">
        Karte{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          // Negativer Rand plus Innenabstand: die Zeile bleibt schmal,
          // die Trefferfläche des Links wird 40 px hoch.
          className="-my-2 inline-flex min-h-10 items-center px-1 underline decoration-dotted underline-offset-2"
        >
          &copy; OpenStreetMap
        </a>
      </p>
    </div>
  );
}
