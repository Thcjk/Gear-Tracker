"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { tabIndexForPath } from "@/components/nav/BottomNav";

/**
 * Slide-Übergang beim Wechsel zwischen den Tabs.
 *
 * Bewusst ohne framer-motion: die Bibliothek wiegt mehr als alles, was
 * hier animiert wird, und für "neuer Screen schiebt sich rein" reicht eine
 * CSS-Keyframe. Der key auf dem Pfad erzwingt einen Remount, dadurch läuft
 * die Animation bei jedem Wechsel neu an. Die Richtung ergibt sich aus der
 * Reihenfolge der Tabs: weiter rechts kommt von rechts herein.
 *
 * Die alte Seite wird dabei nicht mit ausgeblendet – dafür bräuchte es
 * AnimatePresence und beide Bäume gleichzeitig im DOM. Das Ergebnis
 * entspricht dem "Push" nativer Apps.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previous = useRef(pathname);

  const from = tabIndexForPath(previous.current);
  const to = tabIndexForPath(pathname);
  const goingBack = to < from;

  useEffect(() => {
    previous.current = pathname;
  }, [pathname]);

  return (
    <div
      key={pathname}
      className={goingBack ? "animate-slide-back" : "animate-slide-forward"}
    >
      {children}
    </div>
  );
}
