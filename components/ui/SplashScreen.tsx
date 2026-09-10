"use client";

import { useEffect, useState, type AnimationEvent } from "react";

/** Sichtbar plus Ausblenden – muss zur Keyframe "splash" passen. */
const TOTAL_MS = 1270;

/**
 * In-App-Splash statt nativem iOS-Splash: iOS unterstützt für Web-Apps nur
 * statische apple-touch-startup-image-Dateien pro Gerätegrösse, was eine
 * Bilderflut wäre und trotzdem nur beim Start vom Home-Bildschirm greift.
 *
 * Das Ein- und Ausblenden erledigt eine CSS-Keyframe, nicht JavaScript.
 * Die Komponente steht im vorgerenderten HTML und deckt damit schon den
 * ersten Frame ab; würde das Ausblenden an der Hydration hängen, bliebe
 * der Splash bei langsamer Verbindung sekundenlang und ohne geladenes
 * JavaScript dauerhaft stehen. Die Keyframe endet auf visibility:hidden,
 * die Fläche fängt danach also auch keine Klicks mehr ab.
 *
 * React räumt den Knoten anschliessend nur noch weg.
 */
export function SplashScreen() {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Rückfalllinie: hydratisiert die Seite erst nach dem Ende der
    // Animation, kommt kein animationend-Ereignis mehr an.
    const timer = window.setTimeout(() => setRemoved(true), TOTAL_MS + 200);
    return () => window.clearTimeout(timer);
  }, []);

  if (removed) return null;

  function handleEnd(event: AnimationEvent<HTMLDivElement>) {
    // Auch die Logo-Animation blubbert hier hoch
    if (event.target === event.currentTarget) setRemoved(true);
  }

  return (
    <div
      aria-hidden
      onAnimationEnd={handleEnd}
      className="animate-splash pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-900"
    >
      <div className="animate-splash-in">
        <AppMark />
      </div>
      <p className="animate-splash-in mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-forest-200 [animation-delay:120ms]">
        Gear-Tracker
      </p>
    </div>
  );
}

/** Dieselbe Grafik wie das App-Icon, inline damit nichts nachgeladen wird. */
function AppMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      className="h-24 w-24 drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      <rect width="512" height="512" rx="112" fill="#1e563e" />
      <path d="M256 132 L444 392 L68 392 Z" fill="#357f5c" />
      <path d="M256 132 L444 392 L256 392 Z" fill="#4b9a72" />
      <path d="M256 132 L302 196 L276 186 L256 208 L236 186 L210 196 Z" fill="#c8e6d5" />
      <path d="M256 258 L328 392 L184 392 Z" fill="#f97316" />
      <path d="M256 300 L284 392 L228 392 Z" fill="#1e563e" />
      <rect x="68" y="392" width="376" height="16" rx="8" fill="#c8e6d5" />
    </svg>
  );
}
