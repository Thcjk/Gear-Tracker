"use client";

import { useEffect, useState } from "react";
import { SPLASH_FADE_MS, SPLASH_MIN_VISIBLE_MS } from "./splashCss";

/**
 * In-App-Splash statt nativem iOS-Splash: iOS unterstützt für Web-Apps nur
 * statische apple-touch-startup-image-Dateien pro Gerätegrösse, was eine
 * Bilderflut wäre und trotzdem nur beim Start vom Home-Bildschirm greift.
 * Diese Variante läuft überall gleich – auch im Browser-Tab.
 *
 * Das Markup steckt im vorgerenderten HTML, seine Gestaltung als <style> im
 * <head> (siehe splashCss.ts). Dadurch erscheint das Logo mit dem ersten
 * Paint, statt auf das Tailwind-Stylesheet zu warten.
 *
 * Die Anzeigedauer zählt ab Navigationsstart. Früher lief der Timer erst
 * nach der Hydration los und hängte sich damit hinten an die Ladezeit an –
 * erst sekundenlang nichts, dann kurz das Logo, dann die App.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setPhase("done");
      return;
    }

    // performance.now() zählt ab Navigationsstart – genau die Zeit, die der
    // Nutzer den Splash (oder davor das leere Fenster) schon gesehen hat.
    const remaining = Math.max(0, SPLASH_MIN_VISIBLE_MS - performance.now());

    let done: number | undefined;
    const fade = window.setTimeout(() => {
      setPhase("fading");
      done = window.setTimeout(() => setPhase("done"), SPLASH_FADE_MS);
    }, remaining);

    return () => {
      window.clearTimeout(fade);
      if (done !== undefined) window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div aria-hidden className="splash" data-state={phase}>
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
