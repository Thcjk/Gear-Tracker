"use client";

import { useEffect, useState, type AnimationEvent } from "react";
import { SPLASH_TOTAL_MS } from "./splashCss";

/**
 * In-App-Splash statt nativem iOS-Splash: iOS unterstützt für Web-Apps nur
 * statische apple-touch-startup-image-Dateien pro Gerätegrösse, was eine
 * Bilderflut wäre und trotzdem nur beim Start vom Home-Bildschirm greift.
 * Diese Variante läuft überall gleich – auch im Browser-Tab.
 *
 * Markup und Gestaltung stecken im vorgerenderten HTML bzw. als <style> im
 * <head> (siehe splashCss.ts): das Logo erscheint mit dem ersten Paint,
 * statt auf das Tailwind-Stylesheet zu warten. Ein- und Ausblenden erledigt
 * dort eine CSS-Animation, die auf visibility:hidden endet – der Splash
 * löst sich also auch dann auf, wenn das JavaScript spät oder nie ankommt,
 * und fängt danach keine Klicks mehr ab.
 *
 * Diese Komponente räumt anschliessend nur noch den Knoten weg.
 */
export function SplashScreen() {
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    // Rückfalllinie: hydratisiert die Seite erst nach dem Ende der
    // Animation, kommt kein animationend-Ereignis mehr an.
    const timer = window.setTimeout(() => setRemoved(true), SPLASH_TOTAL_MS + 200);
    return () => window.clearTimeout(timer);
  }, []);

  if (removed) return null;

  function handleEnd(event: AnimationEvent<HTMLDivElement>) {
    // Auch die Animationen von Logo und Schriftzug blubbern hier hoch
    if (event.target === event.currentTarget) setRemoved(true);
  }

  return (
    <div aria-hidden className="splash" onAnimationEnd={handleEnd}>
      <AppMark />
      <p className="splash__label">Gear-Tracker</p>
    </div>
  );
}

/** Dieselbe Grafik wie das App-Icon, inline damit nichts nachgeladen wird. */
function AppMark() {
  return (
    <svg viewBox="0 0 512 512" className="splash__mark" aria-hidden>
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
