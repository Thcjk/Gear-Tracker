"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Der abgedunkelte Grund aller Dialoge – und der Grund, warum es diese
 * Komponente überhaupt gibt.
 *
 * position:fixed bezieht sich normalerweise auf das Fenster. Sobald aber
 * irgendein Vorfahr eine transform, filter oder perspective trägt, wird
 * DIESER Vorfahr zum Bezugsrahmen. Genau das ist hier der Fall: der
 * Seitenwechsel (PageTransition) animiert mit translate3d und endet nicht
 * auf transform:none, sondern auf translate3d(0,0,0) – der Bezugsrahmen
 * bleibt also für immer stehen.
 *
 * Die Folge war messbar: der Grund des Export-Dialogs lag bei
 * [16, −1004, 358, 1704] statt bei [0, 0, 390, 844]. Er deckte das
 * Fenster nicht ab, scrollte mit der Seite mit, und ein Tipp neben den
 * Dialog landete je nach Scrollstand irgendwo im Nichts statt auf dem
 * Grund, der ihn schliessen sollte.
 *
 * Ein Portal an den <body> hängt den Dialog aus jedem transformierten
 * Vorfahren heraus. Damit stimmt fixed wieder.
 *
 * Escape schliesst, ein Tipp auf den Grund schliesst, ein Tipp auf den
 * Inhalt nicht. Das ist das Muster, das die App vorher schon hatte –
 * es liegt jetzt nur an einer Stelle statt an vier.
 */
export function DialogOverlay({
  label,
  onClose,
  className = "",
  children,
}: {
  label: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  /**
   * Erst nach der Hydration: beim statischen Export wird diese Seite auf
   * dem Server gerendert, wo es kein document gibt. Ein Dialog, der beim
   * ersten Rendern noch nicht steht, ist unkritisch – er öffnet ohnehin
   * erst auf eine Aktion hin.
   */
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!host) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={`animate-fade-in fixed inset-0 z-50 flex items-end justify-center overscroll-contain bg-black/40 p-4 backdrop-blur-sm sm:items-center ${className}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    host,
  );
}
