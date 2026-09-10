import { Thermometer } from "lucide-react";
import { formatComfortTemp } from "@/lib/categories";

/**
 * Komforttemperatur eines Schlafsystems.
 *
 * Steht als eigene Plakette neben Gewicht und Preis statt in den Notizen:
 * beim Packen für eine Tour ist sie die zweite Zahl, auf die man schaut,
 * und sie muss auf jeder Karte ohne Aufklappen lesbar sein.
 */
export function ComfortTempBadge({
  celsius,
  className = "",
}: {
  celsius: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-clay-200 px-2.5 py-1 text-xs font-bold tabular-nums text-clay-700 shadow-neu-in-sm dark:bg-clay-950 dark:text-clay-300 ${className}`}
    >
      <Thermometer className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {/* Ohne den Zusatz liest ein Screenreader nur "-5 Grad Celsius" vor. */}
      <span className="sr-only">Komforttemperatur </span>
      {formatComfortTemp(celsius)}
    </span>
  );
}
