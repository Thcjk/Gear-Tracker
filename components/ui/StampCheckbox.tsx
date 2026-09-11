"use client";

import { useEffect, useRef, useState } from "react";
import { STAMP_EDGE_IDS } from "@/components/ui/InkDefs";
import { playCheckSound } from "@/lib/sounds";
import { stampLookFor } from "@/lib/pinning";

/**
 * Ein Kästchen, das beim Abhaken gestempelt wird.
 *
 * Leer ist es ein eingelassenes Feld im Papier – die Stelle, an der man
 * abhakt. Gesetzt liegt dort ein Stempelabdruck: ein ausgefranster Ring
 * mit einem Haken darin, leicht schief, wie von Hand aufgedrückt.
 *
 * Der Abdruck kommt mit einem kurzen Ruck herunter (250 ms): erst gross
 * und verdreht, dann etwas unter die Endgrösse, dann auf sie. Diese
 * Überschwingung ist der ganze Trick – ohne sie blendet nur ein Bild ein.
 *
 * Die Bewegung läuft nur bei einer echten Aktion, nicht beim ersten
 * Rendern. Sonst würde beim Öffnen einer Liste jedes bereits gepackte
 * Item gleichzeitig losstempeln.
 *
 * Das Kästchen selbst bleibt ein <input type="checkbox">: Tastatur,
 * Screenreader und die Leertaste funktionieren dadurch, ohne dass hier
 * etwas nachgebaut werden müsste.
 */
export function StampCheckbox({
  checked,
  onChange,
  seed,
  className = "",
  ...rest
}: {
  checked: boolean;
  onChange: () => void;
  /** Bestimmt Winkel und Kante des Abdrucks. */
  seed: string;
  className?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "onChange" | "type" | "className"
>) {
  const [stamping, setStamping] = useState(false);
  const timer = useRef<number | null>(null);
  const look = stampLookFor(seed);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function handleChange() {
    // Nur beim Setzen stempeln; beim Wieder-Auspacken wird der Abdruck
    // schlicht weggenommen.
    if (!checked) {
      setStamping(true);
      playCheckSound();
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStamping(false), 320);
    }
    onChange();
  }

  return (
    <span
      // Das Kästchen ist 26 px gross, das Eingabefeld darunter 44 – der
      // negative Rand nimmt die Differenz aus dem Layout wieder heraus.
      // Padding an einem <span> würde die Trefferfläche NICHT vergrössern
      // (nur ein <label> gibt Klicks weiter, und dieses Kästchen steht
      // teils selbst schon in einem), deshalb ist das Feld gross und die
      // Darstellung klein.
      className={`relative -m-[9px] inline-flex shrink-0 items-center justify-center ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="peer h-11 w-11 cursor-pointer appearance-none rounded-xl bg-transparent"
        {...rest}
      />
      {/* Das leere Feld im Papier. */}
      <span
        aria-hidden
        className="pointer-events-none absolute h-[26px] w-[26px] rounded-[30%] bg-paper-200 shadow-neu-in-sm transition-colors duration-150 peer-checked:bg-transparent peer-checked:shadow-none dark:bg-paper-950"
      />
      <svg
        aria-hidden
        viewBox="0 0 40 40"
        className="pointer-events-none absolute h-[34px] w-[34px] text-accent opacity-0 transition-opacity duration-100 peer-checked:opacity-100"
        style={
          {
            "--stamp-tilt": `${look.tilt * 2.4}deg`,
          } as React.CSSProperties
        }
      >
        <g
          className={stamping ? "stamp-mark stamp-mark--drop" : "stamp-mark"}
          filter={`url(#${STAMP_EDGE_IDS[look.edge]})`}
        >
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M12.5 20.5 L18 26 L28 13.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  );
}
