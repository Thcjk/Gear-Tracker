"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Bis hierhin nach dem Laden darf ein Update die Seite noch selbst neu
 * laden. Danach ist die App in Benutzung und ein Reload würde mitten in
 * eine Eingabe platzen – dann greift die neue Version beim nächsten Start.
 */
const SELF_RELOAD_WINDOW_MS = 10_000;

/**
 * Meldet den Service Worker an, der die App-Hülle im Gerät vorhält.
 *
 * Ohne ihn lädt jeder Start vom Home-Bildschirm die App komplett neu über das
 * Netz – auf dem Berg mit einem Balken Empfang dauert das eben jene Sekunden,
 * in denen der Bildschirm leer bleibt.
 *
 * Updates kommen von allein: bei jedem Start prüft der Browser sw.js, lädt
 * bei Änderung den neuen Build im Hintergrund und meldet sich, sobald er
 * die Seite bedient. Die App muss nie vom Home-Bildschirm gelöscht und neu
 * hinzugefügt werden.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Ob beim Laden schon ein Worker die Seite kontrolliert, entscheidet
    // später, ob eine Aktivierung ein Update ist (neu laden) oder die
    // Erstinstallation (nichts tun, die Seite ist ja aktuell).
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    function onMessage(event: MessageEvent) {
      if (event.data?.type !== "sw-activated") return;
      if (!hadController || reloading) return;

      // Die Meldung kommt erst nach clients.claim(), der neue Worker bedient
      // die Seite also sicher. Früher wurde auf "controllerchange" neu
      // geladen – das lief in ein Rennen mit der Übernahme und landete
      // gelegentlich wieder auf dem alten Build.
      if (performance.now() > SELF_RELOAD_WINDOW_MS) return;

      reloading = true;
      // Neu laden, damit Markup und Chunks aus demselben Build stammen.
      // Der Zustand liegt im LocalStorage und übersteht das.
      window.location.reload();
    }

    navigator.serviceWorker.addEventListener("message", onMessage);

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
      navigator.serviceWorker.removeEventListener("message", onMessage);
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
