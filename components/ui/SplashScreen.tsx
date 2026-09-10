"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import {
  SPLASH_FADE_MS,
  SPLASH_MIN_VISIBLE_MS,
  SPLASH_REVEAL_MS,
} from "./splashCss";

/**
 * In-App-Splash statt nativem iOS-Splash: iOS unterstützt für Web-Apps nur
 * statische apple-touch-startup-image-Dateien pro Gerätegrösse, was eine
 * Bilderflut wäre und trotzdem nur beim Start vom Home-Bildschirm greift.
 * Diese Variante läuft überall gleich – auch im Browser-Tab.
 *
 * Markup und Gestaltung stecken im vorgerenderten HTML bzw. als <style> im
 * <head> (siehe splashCss.ts): das Logo erscheint mit dem ersten Paint,
 * statt auf das Tailwind-Stylesheet zu warten.
 *
 * Ablauf: der Splash steht SPLASH_MIN_VISIBLE_MS, auch wenn die App längst
 * bereit ist. Braucht das Laden länger, wird nicht künstlich verlängert –
 * er geht, sobald der Store gelesen ist. Formel also
 * max(SPLASH_MIN_VISIBLE_MS, Zeit bis "ready").
 *
 * Nur beim Kaltstart: die Komponente hängt im Root-Layout, das beim
 * Tab-Wechsel nicht neu montiert wird. Das Modul-Flag deckt zusätzlich den
 * Fall ab, dass React den Baum doch einmal neu aufbaut (Fast Refresh,
 * Fehlergrenze) – ein zweiter Splash mitten in der Bedienung wäre ein
 * Rückschritt, kein Effekt.
 */
let alreadyShown = false;

/** Ohne Browser gibt es keine Uhr – im SSR-Pfad zählt nur das Markup. */
function sinceLoad(): number {
  if (typeof performance === "undefined") return 0;
  return performance.now();
}

function setState(value: "leaving" | "done") {
  document.documentElement.setAttribute("data-splash", value);
}

export function SplashScreen() {
  const { ready } = useAppStore();
  const [removed, setRemoved] = useState(alreadyShown);

  useEffect(() => {
    if (alreadyShown) {
      // Kein Kaltstart: sofort in den Ruhezustand, sonst hinge der Inhalt
      // am opacity:0 des "hold"-Zustands fest.
      setState("done");
      return;
    }
    if (!ready) return;

    alreadyShown = true;
    const wait = Math.max(0, SPLASH_MIN_VISIBLE_MS - sinceLoad());
    let cleanup: number | undefined;

    const start = window.setTimeout(() => {
      setState("leaving");
      // Erst nach dem längeren der beiden Übergänge abräumen, sonst
      // springt der Inhalt auf seinen Ruhezustand, während er noch
      // einblendet.
      cleanup = window.setTimeout(() => {
        setState("done");
        setRemoved(true);
      }, Math.max(SPLASH_FADE_MS, SPLASH_REVEAL_MS) + 60);
    }, wait);

    return () => {
      window.clearTimeout(start);
      if (cleanup !== undefined) window.clearTimeout(cleanup);
    };
  }, [ready]);

  if (removed) return null;

  return (
    <div aria-hidden className="splash">
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
