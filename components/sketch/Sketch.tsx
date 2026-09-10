/**
 * Gemeinsames Gerüst der Sketch-Illustrationen.
 *
 * Alle Zeichnungen teilen sich Strichführung und Attribute, damit sie
 * nebeneinander wie aus einem Block wirken: runde Enden, runde Ecken,
 * keine Füllung, Strichstärken zwischen 0.9 und 1.6 und Pfade mit ein bis
 * zwei Kurvenpunkten statt gerader Strecken.
 *
 * Farbe kommt über currentColor. So genügt eine Textfarbe am Elternelement
 * – text-accent dreht sich mit dem Theme, und dieselbe Zeichnung
 * funktioniert auf heller wie auf dunkler Fläche.
 */
import type { ReactNode } from "react";

export interface SketchProps {
  className?: string;
  /** Nur setzen, wenn die Zeichnung Information trägt statt zu schmücken. */
  title?: string;
}

export function SketchFrame({
  viewBox,
  className = "",
  title,
  children,
}: SketchProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg
      viewBox={viewBox}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}
