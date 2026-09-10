/**
 * Produkt-Import für den Gear-Tracker.
 *
 * Die App läuft als statische Seite auf GitHub Pages und kann fremde
 * Produktseiten nicht selbst abrufen – der Browser verbietet das mangels
 * CORS-Freigabe der Shops. Dieser Worker holt die Seite serverseitig und
 * gibt zurück, was sich sicher daraus lesen lässt.
 *
 * Kein KI-Dienst, keine Heuristik, die rät: gelesen wird strukturierte
 * Auszeichnung, und wo die fehlt, ein klar begrenzter Regex-Fallback. Was
 * dabei herauskommt, ist ein Vorschlag mit Vertrauensangabe – die App legt
 * ihn dem Nutzer zur Bestätigung vor, statt ihn zu übernehmen.
 */

export interface Env {
  /** Kommaliste erlaubter Herkünfte. Siehe wrangler.toml. */
  ALLOWED_ORIGINS: string;
}

/**
 * Wie in der Vorgabe: "high" kommt aus JSON-LD, alles andere ist "low".
 *
 * Meta-Tags sind zwar vom Shop gesetzt und nicht geraten – sie landen
 * trotzdem bei "low", weil die Vorgabe "high" ausdrücklich an JSON-LD
 * bindet. Die Richtung stimmt so: lieber einmal zu viel "bitte prüfen" als
 * ein unsicherer Treffer, der wie eine Tatsache aussieht.
 */
type Confidence = "high" | "low";

/** Aus welcher der drei Stufen ein einzelner Wert stammt. */
type Source = "json-ld" | "meta" | "text";

interface Found {
  found: true;
  name?: string;
  weightGrams?: number;
  price?: number;
  currency?: string;
  confidence: Confidence;
}

type Result = Found | { found: false };

/** Mehr als das liest der Worker nicht ein – Produktseiten sind kleiner. */
const MAX_BYTES = 2 * 1024 * 1024;
/** Hängt ein Shop, soll der Nutzer nicht ewig auf den Spinner schauen. */
const FETCH_TIMEOUT_MS = 10_000;

const USER_AGENT =
  "Mozilla/5.0 (compatible; GearTrackerImport/1.0; +https://github.com/Thcjk/Gear-Tracker)";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = allowedOrigin(origin, env);

    if (request.method === "OPTIONS") {
      // Preflight. Ohne Freigabe absichtlich ohne CORS-Kopfzeilen: der
      // Browser bricht dann ab, und zwar mit einer Meldung, die sagt warum.
      return new Response(null, {
        status: allowed ? 204 : 403,
        headers: corsHeaders(allowed),
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Nur POST." }, 405, allowed);
    }
    if (origin !== null && !allowed) {
      return json({ error: "Herkunft nicht freigegeben." }, 403, allowed);
    }

    let target: URL;
    try {
      const body = (await request.json()) as { url?: unknown };
      target = parseTarget(body?.url);
    } catch (error) {
      const message =
        error instanceof RangeError ? error.message : "Ungültige Anfrage.";
      return json({ error: message }, 400, allowed);
    }

    let html: string;
    try {
      html = await loadPage(target);
    } catch {
      return json({ error: "Seite nicht erreichbar." }, 502, allowed);
    }

    return json(extract(html), 200, allowed);
  },
};

/* ---------------------------------------------------------------- CORS */

function allowedOrigin(origin: string | null, env: Env): string | null {
  if (!origin) return null;
  const list = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return list.includes(origin) ? origin : null;
}

function corsHeaders(allowed: string | null): HeadersInit {
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    // Die Antwort hängt von der Herkunft ab – ohne das könnte ein Cache
    // die Freigabe der einen Herkunft an eine andere ausliefern.
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, allowed: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(allowed),
    },
  });
}

/* ------------------------------------------------------------- Abrufen */

/**
 * Prüft die übergebene Adresse, bevor der Worker sie abruft.
 *
 * Ohne diese Prüfung wäre der Worker ein offener Weiterleiter: jemand
 * könnte ihn interne Adressen oder file:-URLs abrufen lassen.
 */
function parseTarget(raw: unknown): URL {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new RangeError("Bitte einen Produkt-Link angeben.");
  }
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new RangeError("Das ist keine gültige Adresse.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new RangeError("Nur http- und https-Adressen.");
  }
  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    host === "[::1]" ||
    host === "0.0.0.0";
  if (isPrivate) {
    throw new RangeError("Diese Adresse ist nicht erlaubt.");
  }
  return url;
}

async function loadPage(url: URL): Promise<string> {
  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "de-CH,de;q=0.9,en;q=0.8",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Stückweise lesen und bei MAX_BYTES abbrechen: eine Seite, die endlos
  // liefert, soll den Worker nicht am Speicherlimit sterben lassen.
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let text = "";
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
    if (bytes >= MAX_BYTES) {
      await reader.cancel();
      break;
    }
  }
  return text;
}

/* ----------------------------------------------------------- Auslesen */

interface Field<T> {
  value: T;
  source: Source;
}

/**
 * Reihenfolge: strukturierte Auszeichnung schlägt Metadaten, Metadaten
 * schlagen den Regex-Fallback. Jedes Feld merkt sich, woher es stammt.
 */
export function extract(html: string): Result {
  // Jede Stufe genau einmal auswerten, danach Feld für Feld die beste
  // Quelle nehmen.
  const structured = fromJsonLd(html);
  const meta = fromMeta(html);
  const text = fromText(html);

  const name = structured.name ?? meta.name ?? text.name ?? null;
  const weight = structured.weightGrams ?? meta.weightGrams ?? text.weightGrams ?? null;
  const price = structured.price ?? meta.price ?? text.price ?? null;
  const currency = structured.currency ?? meta.currency ?? text.currency ?? null;

  if (!name && !weight && !price) return { found: false };

  // Die Angabe gilt für den Treffer als Ganzes, also zählt das schwächste
  // Glied: ein sicherer Name rettet ein geratenes Gewicht nicht.
  const parts = [name, weight, price].filter(Boolean) as Field<unknown>[];
  const confidence: Confidence = parts.every((p) => p.source === "json-ld")
    ? "high"
    : "low";

  return {
    found: true,
    ...(name ? { name: name.value } : {}),
    ...(weight ? { weightGrams: weight.value } : {}),
    ...(price ? { price: price.value } : {}),
    ...(currency ? { currency: currency.value } : {}),
    confidence,
  };
}

interface Candidate {
  name?: Field<string>;
  weightGrams?: Field<number>;
  price?: Field<number>;
  currency?: Field<string>;
}

/* -- (a) JSON-LD ------------------------------------------------------ */

const JSON_LD_RE =
  /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function fromJsonLd(html: string): Candidate {
  const out: Candidate = {};
  for (const match of html.matchAll(JSON_LD_RE)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      // Ein kaputter Block heisst nicht, dass die anderen kaputt sind.
      continue;
    }
    for (const node of flatten(parsed)) {
      if (!isProduct(node)) continue;
      const product = node as Record<string, unknown>;

      const name = firstString(product.name);
      if (name && !out.name) out.name = { value: name, source: "json-ld" };

      const weight = weightFromJsonLd(product);
      if (weight !== null && !out.weightGrams) {
        out.weightGrams = { value: weight, source: "json-ld" };
      }

      for (const offer of flatten(product.offers)) {
        if (typeof offer !== "object" || offer === null) continue;
        const o = offer as Record<string, unknown>;
        const price = toNumber(o.price ?? o.lowPrice);
        if (price !== null && !out.price) {
          out.price = { value: price, source: "json-ld" };
        }
        const currency = firstString(o.priceCurrency);
        if (currency && !out.currency) {
          out.currency = { value: normalizeCurrency(currency), source: "json-ld" };
        }
      }
    }
  }
  return out;
}

/** Ein "@graph" oder ein Array liefert mehrere Knoten – alle einsammeln. */
function* flatten(value: unknown): Generator<unknown> {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    for (const entry of value) yield* flatten(entry);
    return;
  }
  yield value;
  if (typeof value === "object" && "@graph" in (value as object)) {
    yield* flatten((value as Record<string, unknown>)["@graph"]);
  }
}

function isProduct(node: unknown): boolean {
  if (typeof node !== "object" || node === null) return false;
  const type = (node as Record<string, unknown>)["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some(
    (entry) => typeof entry === "string" && entry.toLowerCase() === "product",
  );
}

/**
 * Gewicht steckt entweder in "weight" (QuantitativeValue) oder als
 * Freitext in "additionalProperty". Beides kommt in freier Wildbahn vor.
 */
function weightFromJsonLd(product: Record<string, unknown>): number | null {
  for (const node of flatten(product.weight)) {
    const grams = quantityToGrams(node);
    if (grams !== null) return grams;
  }
  for (const node of flatten(product.additionalProperty)) {
    if (typeof node !== "object" || node === null) continue;
    const prop = node as Record<string, unknown>;
    const label = (firstString(prop.name) ?? "").toLowerCase();
    if (!/gewicht|weight|masse/.test(label)) continue;
    const grams = quantityToGrams(prop.value) ?? quantityToGrams(prop);
    if (grams !== null) return grams;
  }
  return null;
}

function quantityToGrams(node: unknown): number | null {
  if (typeof node === "number") return round(node);
  if (typeof node === "string") return parseWeight(node);
  if (typeof node !== "object" || node === null) return null;

  const q = node as Record<string, unknown>;
  const value = toNumber(q.value ?? q.minValue);
  if (value === null) {
    return typeof q.value === "string" ? parseWeight(q.value) : null;
  }
  // unitCode nach UN/CEFACT: GRM = Gramm, KGM = Kilogramm.
  const unit = (firstString(q.unitCode) ?? firstString(q.unitText) ?? "")
    .trim()
    .toLowerCase();
  if (unit === "kgm" || unit === "kg" || unit === "kilogramm") {
    return round(value * 1000);
  }
  if (unit === "grm" || unit === "g" || unit === "gramm" || unit === "gram") {
    return round(value);
  }
  // Ohne Einheit ist die Zahl nicht deutbar – lieber nichts als geraten.
  return null;
}

/* -- (b) Open Graph und Meta-Tags ------------------------------------- */

/**
 * Zweite Stufe: vom Shop gesetzte Maschinendaten. Sie sind verlässlicher
 * als der Regex-Fallback, gelten laut Vorgabe aber trotzdem nicht als
 * "high" – das bleibt JSON-LD vorbehalten.
 */
function fromMeta(html: string): Candidate {
  const out: Candidate = {};
  const meta = readMetaTags(html);

  const name = meta.get("og:title") ?? meta.get("twitter:title");
  if (name) out.name = { value: cleanText(name), source: "meta" };

  const price = toNumber(
    meta.get("product:price:amount") ??
      meta.get("og:price:amount") ??
      meta.get("product:price") ??
      meta.get("price"),
  );
  if (price !== null) out.price = { value: price, source: "meta" };

  const currency =
    meta.get("product:price:currency") ??
    meta.get("og:price:currency") ??
    meta.get("priceCurrency");
  if (currency) {
    out.currency = { value: normalizeCurrency(currency), source: "meta" };
  }

  const weight = meta.get("product:weight:value") ?? meta.get("weight");
  if (weight) {
    const unit = meta.get("product:weight:units");
    const grams = unit
      ? quantityToGrams({ value: weight, unitText: unit })
      : parseWeight(weight);
    if (grams !== null) out.weightGrams = { value: grams, source: "meta" };
  }

  return out;
}

const META_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;

function readMetaTags(html: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const tag of html.matchAll(META_RE)) {
    const attrs = new Map<string, string>();
    for (const attr of tag[0].matchAll(ATTR_RE)) {
      attrs.set(attr[1].toLowerCase(), attr[3] ?? attr[4] ?? "");
    }
    const key = attrs.get("property") ?? attrs.get("name") ?? attrs.get("itemprop");
    const content = attrs.get("content");
    if (!key || content === undefined) continue;
    if (!map.has(key)) map.set(key, decodeEntities(content));
  }
  return map;
}

/* -- (c) Regex über den sichtbaren Text ------------------------------- */

const STRIP_RE = /<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi;
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i;

/** Beschriftetes Gewicht ist deutlich verlässlicher als die erste Zahl. */
const LABELLED_WEIGHT_RE =
  /(?:gewicht|weight|packmass|packgewicht)\b[^0-9]{0,24}(\d+(?:[.,]\d+)?)\s?(kg|kilogramm|g|gramm|gram)\b/i;
const WEIGHT_RE = /(\d+(?:[.,]\d+)?)\s?(kg|kilogramm|g|gramm|gram)\b/i;
/** Schweizer Tausendertrennung ist ein Apostroph: 1'299.00 */
const AMOUNT = "\\d{1,3}(?:['\u2019.,]\\d{3})*[.,]\\d{2}";
const CURRENCY_SYMBOLS = "CHF|EUR|USD|Fr\\.|SFr\\.|\\$|€";
const PRICE_AFTER_RE = new RegExp(`(${AMOUNT})\\s?(${CURRENCY_SYMBOLS})`, "i");
const PRICE_BEFORE_RE = new RegExp(`(${CURRENCY_SYMBOLS})\\s?(${AMOUNT})`, "i");

function fromText(html: string): Candidate {
  const out: Candidate = {};

  const title = TITLE_RE.exec(html)?.[1];
  if (title) {
    const value = cleanText(decodeEntities(title));
    if (value) out.name = { value, source: "text" };
  }

  const text = visibleText(html);

  const weightMatch = LABELLED_WEIGHT_RE.exec(text) ?? WEIGHT_RE.exec(text);
  if (weightMatch) {
    const grams = toGrams(weightMatch[1], weightMatch[2]);
    if (grams !== null) out.weightGrams = { value: grams, source: "text" };
  }

  const after = PRICE_AFTER_RE.exec(text);
  const before = PRICE_BEFORE_RE.exec(text);
  // Der frühere Treffer gewinnt: der Preis steht in aller Regel vor den
  // Fussnoten mit Versandkosten und Gutscheinbeträgen.
  const useAfter =
    after && (!before || after.index <= before.index) ? after : null;
  const hit = useAfter
    ? { amount: useAfter[1], symbol: useAfter[2] }
    : before
      ? { amount: before[2], symbol: before[1] }
      : null;
  if (hit) {
    const price = parseAmount(hit.amount);
    if (price !== null) {
      out.price = { value: price, source: "text" };
      out.currency = { value: normalizeCurrency(hit.symbol), source: "text" };
    }
  }

  return out;
}

function visibleText(html: string): string {
  return decodeEntities(
    html.replace(STRIP_RE, " ").replace(/<[^>]+>/g, " "),
  ).replace(/\s+/g, " ");
}

/* ------------------------------------------------------------- Helfer */

function parseWeight(raw: string): number | null {
  const match = WEIGHT_RE.exec(raw);
  if (!match) return null;
  return toGrams(match[1], match[2]);
}

function toGrams(amount: string, unit: string): number | null {
  const value = Number(amount.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;
  const grams = /^kg|^kilogramm/i.test(unit) ? value * 1000 : value;
  // Über 100 kg ist kein Ausrüstungsgegenstand mehr, sondern ein Fehlgriff.
  if (grams > 100_000) return null;
  return round(grams);
}

function parseAmount(raw: string): number | null {
  // Tausendertrenner raus, dann ist das letzte Trennzeichen das Komma.
  const normalized = raw
    .replace(/['\u2019]/g, "")
    .replace(/[.,](?=\d{3}\b)/g, "")
    .replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
    : null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  }
  if (typeof value !== "string") return null;
  return parseAmount(value.trim()) ?? null;
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = firstString(entry);
      if (found) return found;
    }
  }
  return null;
}

function normalizeCurrency(raw: string): string {
  const value = raw.trim().toUpperCase();
  if (value === "$") return "USD";
  if (value === "€") return "EUR";
  if (value === "FR." || value === "SFR.") return "CHF";
  return value;
}

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 160);
}

function round(value: number): number {
  return Math.round(value);
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  euro: "€",
};

function decodeEntities(raw: string): string {
  return raw.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, body: string) => {
    if (body.startsWith("#")) {
      const code = body[1] === "x" || body[1] === "X"
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return ENTITIES[body.toLowerCase()] ?? whole;
  });
}
