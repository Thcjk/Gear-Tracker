"use client";

import { useEffect, useState } from "react";

const VISIBLE_MS = 950;
const FADE_MS = 320;

/**
 * In-App-Splash statt nativem iOS-Splash: iOS unterstützt für Web-Apps nur
 * statische apple-touch-startup-image-Dateien pro Gerätegrösse, was eine
 * Bilderflut wäre und trotzdem nur beim Start vom Home-Bildschirm greift.
 * Diese Variante läuft überall gleich – auch im Browser-Tab.
 *
 * Rendert nur beim ersten Laden der App. Bei Navigationen innerhalb der
 * App bleibt die Komponente montiert und der Zustand "fertig" erhalten.
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

    const fade = window.setTimeout(() => setPhase("fading"), VISIBLE_MS);
    const done = window.setTimeout(
      () => setPhase("done"),
      VISIBLE_MS + FADE_MS,
    );
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(done);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-forest-900 transition-opacity duration-300 ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
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
