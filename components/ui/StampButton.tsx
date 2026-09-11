"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { STAMP_EDGE_IDS } from "@/components/ui/InkDefs";
import { stampLookFor } from "@/lib/pinning";

/**
 * Die Hauptaktion eines Bildschirms als Stempel.
 *
 * Ein Stempel ist keine Schaltfläche mit runden Ecken: er ist schief
 * aufgedrückt, seine Kante ist ausgefranst, und er hat einen Rahmen
 * innerhalb der Fläche. Genau diese drei Dinge macht die Komponente –
 * mehr nicht, weil ein Knopf, der aussieht wie ein Siegel, immer noch ein
 * Knopf sein muss.
 *
 * Die Fläche selbst ist eine ganz normale, deckende Hintergrundfarbe
 * (bg-accent). Die ausgefranste Ellipse darüber liegt nur ein paar Pixel
 * weiter aussen und deckt sie ab. Das ist Absicht: läge die Farbe nur im
 * SVG, stünde die Schrift für jede Prüfung auf durchsichtigem Grund, und
 * ohne SVG-Unterstützung stünde sie auf gar nichts.
 *
 * Die Drehung stammt aus der Beschriftung und bleibt deshalb stehen –
 * ein Knopf, der bei jedem Render seinen Winkel wechselt, sieht kaputt
 * aus.
 */
export function StampButton({
  className = "",
  shape = "oval",
  children,
  stampSeed,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  shape?: "oval" | "round";
  /** Bestimmt Winkel und Kante – sonst zählt der Text des Knopfes. */
  stampSeed?: string;
  children: ReactNode;
}) {
  const seed =
    stampSeed ?? (typeof children === "string" ? children : "stempel");
  const look = stampLookFor(seed);
  const edge = STAMP_EDGE_IDS[look.edge];

  // rounded-[50%] statt rounded-full: das ergibt exakt dieselbe Ellipse
  // wie das SVG darüber. Eine Pille hätte an den Enden Schultern, die
  // über die Ellipse hinausragen – und genau die sähen dann aus wie ein
  // normaler Knopf mit einem Gekritzel darauf.
  const box = shape === "round" ? "h-14 w-14 px-0" : "min-h-11 px-8 py-2.5";

  return (
    <button
      className={`stamp relative inline-flex shrink-0 items-center justify-center gap-2 rounded-[50%] bg-accent text-sm font-bold uppercase tracking-wider text-on-accent transition-transform duration-150 disabled:pointer-events-none disabled:opacity-50 ${box} ${className}`}
      style={{ "--stamp-tilt": `${look.tilt}deg` } as React.CSSProperties}
      {...props}
    >
      {/* Die Kante. preserveAspectRatio="none" zieht die Ellipse auf die
          tatsächliche Knopfbreite – die Störung ist dafür vorverzerrt. */}
      <svg
        aria-hidden
        focusable="false"
        viewBox="0 0 200 84"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible text-accent"
      >
        <ellipse
          cx="100"
          cy="42"
          rx="100"
          ry="42"
          fill="currentColor"
          filter={`url(#${edge})`}
        />
        {/* Der innere Ring sitzt weit genug aussen, dass er nicht unter
            der Schrift durchläuft. */}
        <ellipse
          cx="100"
          cy="42"
          rx="91"
          ry="33"
          fill="none"
          stroke="var(--on-accent)"
          strokeWidth="2.5"
          opacity="0.45"
          filter={`url(#${edge})`}
        />
      </svg>
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}
