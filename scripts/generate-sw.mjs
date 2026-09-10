import { createHash } from "crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, relative, sep } from "path";
import { createRequire } from "module";

/**
 * Erzeugt nach `next build` einen Service Worker in out/.
 *
 * Grund: Beim Start vom Home-Bildschirm zeigt iOS ein leeres Fenster, bis die
 * Seite das erste Mal zeichnet. Ohne Cache heisst das bei jedem Start rund ein
 * halbes Megabyte über Mobilfunk – daher die langen schwarzen Sekunden vor dem
 * Logo. Mit vorgefülltem Cache kommt der Start aus dem Gerät und die App ist
 * unterwegs auch ohne Empfang benutzbar, was zu einer Tourenplanungs-App passt.
 *
 * Der Worker wird generiert statt von Hand gepflegt, weil die Dateinamen der
 * Chunks bei jedem Build wechseln und eine statische Liste sofort veralten
 * würde.
 */

const require = createRequire(import.meta.url);
const { basePath = "" } = require("../next.config.js");

const root = process.cwd();
const outDir = join(root, "out");

/** Diese Endungen bilden die App-Hülle; alles andere bleibt aussen vor. */
const PRECACHE_EXTENSIONS = new Set([
  ".html",
  ".txt",
  ".js",
  ".css",
  ".woff2",
  ".svg",
  ".png",
  ".json",
]);

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

/**
 * Dateipfad → URL, unter der der Browser die Datei anfragt. Der Export läuft
 * mit trailingSlash, deshalb wird aus `library/index.html` die URL
 * `/Gear-Tracker/library/` und nicht der Dateiname.
 */
function toUrl(file) {
  const rel = relative(outDir, file).split(sep).join("/");
  if (rel === "index.html") return `${basePath}/`;
  if (rel.endsWith("/index.html")) {
    return `${basePath}/${rel.slice(0, -"index.html".length)}`;
  }
  return `${basePath}/${rel}`;
}

const files = listFiles(outDir).filter((file) =>
  PRECACHE_EXTENSIONS.has(file.slice(file.lastIndexOf("."))),
);

const urls = [...new Set(files.map(toUrl))].sort();

// Version aus dem Inhalt: ein unveränderter Build erzeugt denselben Worker,
// ein geänderter einen neuen Cache-Namen und damit ein sauberes Update.
const version = createHash("sha1")
  .update(files.sort().map((file) => readFileSync(file)).join("\u0000"))
  .digest("hex")
  .slice(0, 12);

const sw = `/* Automatisch erzeugt von scripts/generate-sw.mjs – nicht bearbeiten. */
const CACHE = "gear-tracker-${version}";
const BASE = ${JSON.stringify(`${basePath}/`)};
const PRECACHE = ${JSON.stringify(urls, null, 2)};
/* Der Einstiegspunkt, wenn eine unbekannte Seite offline angefragt wird. */
const FALLBACK = ${JSON.stringify(`${basePath}/library/`)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      // Der neue Worker soll nicht warten, bis alle alten Tabs zu sind.
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Antwort im Hintergrund erneuern, ohne den aktuellen Request aufzuhalten. */
function revalidate(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) {
    return;
  }

  // Gehashte Build-Artefakte ändern sich nie unter demselben Namen.
  if (url.pathname.startsWith(BASE + "_next/static/")) {
    event.respondWith(
      caches.match(request).then((hit) => hit || revalidate(request)),
    );
    return;
  }

  // Seitenaufrufe zuerst aus dem Cache: das ist der Start vom Home-Bildschirm
  // und soll sofort zeichnen. Die Auffrischung läuft daneben und greift beim
  // nächsten Start.
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((hit) => {
        const fresh = revalidate(request);
        if (hit) return hit;
        return fresh.then((response) => response || caches.match(FALLBACK));
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((hit) => {
      const fresh = revalidate(request);
      return hit || fresh;
    }),
  );
});
`;

writeFileSync(join(outDir, "sw.js"), sw);
console.log(
  `Service Worker geschrieben: out/sw.js (${urls.length} Dateien, Version ${version})`,
);
