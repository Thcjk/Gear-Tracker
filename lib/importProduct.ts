/**
 * Anbindung an den Produkt-Import-Worker (siehe worker/).
 *
 * Der Worker holt eine Produktseite serverseitig und meldet zurück, was er
 * belegen kann. Was hier ankommt, ist ein Vorschlag – die Oberfläche legt
 * ihn dem Nutzer zur Bestätigung vor und übernimmt nichts von allein.
 */

/**
 * Ohne gesetzte Adresse bleibt die Import-Fläche aus. Die App soll auch
 * ohne Worker vollständig benutzbar sein, statt einen toten Knopf zu
 * zeigen.
 */
export const IMPORT_WORKER_URL = (
  process.env.NEXT_PUBLIC_IMPORT_WORKER_URL ?? ""
).trim();

/**
 * Nicht nur "gesetzt", sondern "brauchbar": eine halb ausgefüllte Adresse
 * aus der Vorlage (.env.example) würde sonst einen Knopf zeigen, der bei
 * jedem Druck scheitert.
 */
export const importAvailable = ((): boolean => {
  if (!IMPORT_WORKER_URL) return false;
  try {
    const url = new URL(IMPORT_WORKER_URL);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
})();

/** "high" nur, wenn alle Werte aus JSON-LD stammen – siehe worker/README.md. */
export type ImportConfidence = "high" | "low";

export interface ImportHit {
  kind: "hit";
  name?: string;
  weightGrams?: number;
  price?: number;
  currency?: string;
  confidence: ImportConfidence;
}

export type ImportOutcome =
  | ImportHit
  /** Seite erreichbar, aber nichts Verwertbares darin. */
  | { kind: "miss" }
  /** Netz weg, Worker down, Seite nicht erreichbar. */
  | { kind: "error"; message: string };

/** Hängt ein Shop, soll der Spinner nicht ewig laufen. */
const TIMEOUT_MS = 20_000;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Prüft die Antwort Feld für Feld, statt ihr zu vertrauen.
 *
 * Der Worker ist zwar eigener Code, aber eine ältere Version oder ein
 * Zwischenspeicher kann etwas anderes liefern – und ein falsch getipptes
 * Feld würde hier unbemerkt ins Formular wandern.
 */
function readOutcome(raw: unknown): ImportOutcome {
  if (typeof raw !== "object" || raw === null) {
    return { kind: "error", message: "Unerwartete Antwort vom Import-Dienst." };
  }
  const body = raw as Record<string, unknown>;
  if (body.found !== true) return { kind: "miss" };

  const hit: ImportHit = {
    kind: "hit",
    confidence: body.confidence === "high" ? "high" : "low",
  };
  if (isText(body.name)) hit.name = body.name.trim().slice(0, 160);
  if (isNumber(body.weightGrams) && body.weightGrams > 0) {
    hit.weightGrams = Math.round(body.weightGrams);
  }
  if (isNumber(body.price) && body.price > 0) {
    hit.price = Math.round(body.price * 100) / 100;
  }
  if (isText(body.currency)) hit.currency = body.currency.trim().toUpperCase();

  // "found: true" ohne ein einziges brauchbares Feld ist kein Treffer.
  if (!hit.name && hit.weightGrams === undefined && hit.price === undefined) {
    return { kind: "miss" };
  }
  return hit;
}

export async function importProduct(url: string): Promise<ImportOutcome> {
  if (!importAvailable) {
    return { kind: "error", message: "Der Import-Dienst ist nicht eingerichtet." };
  }

  // AbortController statt AbortSignal.timeout: ältere iOS-Versionen kennen
  // die Kurzform noch nicht, und genau dort läuft die App am häufigsten.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(IMPORT_WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response
        .json()
        .then((body: { error?: unknown }) =>
          isText(body?.error) ? body.error : null,
        )
        .catch(() => null);
      return {
        kind: "error",
        message: detail ?? `Der Import-Dienst antwortete mit ${response.status}.`,
      };
    }

    return readOutcome(await response.json());
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { kind: "error", message: "Der Shop hat zu lange gebraucht." };
    }
    return {
      kind: "error",
      message: "Der Import-Dienst war nicht erreichbar.",
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Grobe Vorprüfung, damit der Worker nicht für Tippfehler bemüht wird. */
export function looksLikeUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
