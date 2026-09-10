"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Meldet den Service Worker an, der die App-Hülle im Gerät vorhält.
 *
 * Ohne ihn lädt jeder Start vom Home-Bildschirm die App komplett neu über das
 * Netz – auf dem Berg mit einem Balken Empfang dauert das eben jene Sekunden,
 * in denen der Bildschirm leer bleibt.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Ob beim Laden schon ein Worker die Seite kontrolliert, entscheidet
    // später, ob ein Wechsel ein Update ist (neu laden) oder die
    // Erstinstallation (nichts tun, die Seite ist ja aktuell).
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    function onControllerChange() {
      if (!hadController || reloading) return;
      reloading = true;
      // Neue Version übernommen: einmal neu laden, damit Markup und Chunks
      // aus demselben Build stammen. Der Zustand liegt im LocalStorage und
      // übersteht das.
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    // Erst nach dem Laden registrieren: die Installation lädt die ganze Hülle
    // und soll dem ersten Rendern keine Bandbreite wegnehmen.
    const register = () => {
      navigator.serviceWorker.register(`${BASE_PATH}/sw.js`).catch(() => {
        // Kein Cache ist kein Fehlerfall – die App läuft dann wie bisher.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
