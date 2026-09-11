"use client";

import { useEffect, useState } from "react";
import { SkyIcon } from "@/components/weather/SkyIcon";
import {
  fetchForecast,
  type Destination,
  type ForecastDay,
} from "@/lib/weather";

/**
 * Fünf Tage am Zielort.
 *
 * Verschwindet vollständig, wenn etwas schiefgeht – offline, Zeitüber-
 * schreitung, kaputte Antwort. Eine Fehlermeldung über das Wetter wäre in
 * einer Packliste Lärm: das Wetter ist Beiwerk, die Liste ist die Sache.
 * Wer offline auf dem Berg steht, hat andere Sorgen als einen roten
 * Kasten, der ihm sagt, dass er offline ist.
 */
const WEEKDAY = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

function dayLabel(iso: string, index: number): string {
  if (index === 0) return "Heute";
  // Mittag statt Mitternacht: in Zeitzonen westlich von UTC läge
  // "2026-07-14T00:00Z" noch im 13. Juli und der Wochentag wäre falsch.
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime()) ? iso.slice(5) : WEEKDAY[date.getDay()];
}

export function ForecastStrip({ destination }: { destination: Destination }) {
  const [days, setDays] = useState<ForecastDay[] | null>(null);

  useEffect(() => {
    let alive = true;
    setDays(null);
    void fetchForecast(destination).then((result) => {
      // Der Zielort kann gewechselt haben, während die Antwort unterwegs
      // war – dann gehört sie nicht mehr hierher.
      if (alive) setDays(result);
    });
    return () => {
      alive = false;
    };
  }, [destination]);

  if (!days || days.length === 0) return null;

  return (
    <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
      {days.map((day, index) => (
        <li
          key={day.date}
          className="flex min-w-[3.3rem] flex-1 flex-col items-center gap-1 rounded-control bg-paper-200 px-1.5 py-2.5 shadow-neu-in-sm dark:bg-paper-950"
        >
          <span className="handwritten text-base leading-none text-paper-700 dark:text-paper-300">
            {dayLabel(day.date, index)}
          </span>
          <SkyIcon kind={day.kind} label={day.label} className="h-7 w-7 text-accent" />
          <span className="text-sm font-bold tabular-nums text-paper-800 dark:text-paper-100">
            {Math.round(day.maxC)}°
          </span>
          <span className="text-xs tabular-nums text-paper-700 dark:text-paper-400">
            {Math.round(day.minC)}°
          </span>
          {day.mm >= 1 && (
            <span className="text-xs tabular-nums text-accent-secondary">
              {Math.round(day.mm)} mm
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
