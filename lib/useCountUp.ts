"use client";

import { useEffect, useRef, useState } from "react";

/** easing-out: schnell starten, weich auslaufen */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/**
 * Zählt beim ersten Rendern von 0 auf `target` hoch. Spätere Änderungen von
 * `target` (Item hinzugefügt, Menge geändert) werden vom aktuellen Wert aus
 * weitergezählt statt wieder bei 0 zu beginnen.
 */
export function useCountUp(target: number, duration = 1000): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || duration <= 0) {
      fromRef.current = target;
      setValue(target);
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const current = from + delta * easeOutCubic(t);
      fromRef.current = current;
      setValue(current);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
        setValue(target);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}
