// Prüft den Worker als Ganzes: CORS, Methoden, Adressprüfung, Antwortform.
// fetch wird dabei ersetzt, damit kein Netz nötig ist.
import worker from "../src/index.ts";

const ENV = { ALLOWED_ORIGINS: "https://thcjk.github.io" };
const ALLOWED = "https://thcjk.github.io";

let fails = 0;
function check(pass, label, detail = "") {
  if (!pass) fails++;
  console.log((pass ? "  ok   " : "  FAIL ") + label + (detail ? "  → " + detail : ""));
}

/** Ersetzt fetch für einen Aufruf und gibt das gelieferte HTML zurück. */
function servePage(html, { status = 200 } = {}) {
  globalThis.fetch = async () =>
    new Response(status === 200 ? html : "", {
      status,
      headers: { "Content-Type": "text/html" },
    });
}

function post(url, { origin = ALLOWED, method = "POST", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  return new Request("https://worker.example/", {
    method,
    headers,
    ...(method === "POST" ? { body: body ?? JSON.stringify({ url }) } : {}),
  });
}

const call = (req) => worker.fetch(req, ENV);

console.log("=== CORS");
{
  const res = await call(new Request("https://worker.example/", {
    method: "OPTIONS",
    headers: { Origin: ALLOWED },
  }));
  check(res.status === 204, "Preflight der erlaubten Herkunft: 204", String(res.status));
  check(res.headers.get("Access-Control-Allow-Origin") === ALLOWED,
        "Allow-Origin ist die konkrete Adresse, nicht *",
        String(res.headers.get("Access-Control-Allow-Origin")));
  check(res.headers.get("Vary") === "Origin", "Vary: Origin gesetzt");
}
{
  const res = await call(new Request("https://worker.example/", {
    method: "OPTIONS",
    headers: { Origin: "https://boese.example" },
  }));
  check(res.status === 403, "Preflight fremder Herkunft: 403", String(res.status));
  check(res.headers.get("Access-Control-Allow-Origin") === null,
        "keine CORS-Freigabe für fremde Herkunft");
}
{
  servePage(`<script type="application/ld+json">{"@type":"Product","name":"X"}</script>`);
  const res = await call(post("https://shop.example/x", { origin: "https://boese.example" }));
  check(res.status === 403, "POST fremder Herkunft: 403", String(res.status));
}

console.log("\n=== Methoden");
{
  const res = await call(new Request("https://worker.example/", {
    method: "GET",
    headers: { Origin: ALLOWED },
  }));
  check(res.status === 405, "GET wird abgelehnt", String(res.status));
}

console.log("\n=== Adressprüfung");
for (const [value, label] of [
  ["", "leere Adresse"],
  ["zelt ultra", "kein Link"],
  ["file:///etc/passwd", "file:-Adresse"],
  ["http://localhost:8080/x", "localhost"],
  ["http://192.168.1.10/x", "privates Netz"],
  ["http://169.254.169.254/latest/meta-data/", "Metadaten-Adresse der Cloud"],
]) {
  const res = await call(post(value));
  const body = await res.json();
  check(res.status === 400 && typeof body.error === "string", label + " → 400", `${res.status} ${body.error ?? ""}`);
}

console.log("\n=== Antwortform");
{
  servePage(`<html><head>
    <script type="application/ld+json">{"@type":"Product","name":"Zelt Ultra 2",
      "weight":{"value":1.24,"unitCode":"KGM"},
      "offers":{"price":"549.00","priceCurrency":"CHF"}}</script>
  </head><body>Zelt</body></html>`);
  const res = await call(post("https://shop.example/zelt"));
  const body = await res.json();
  check(res.status === 200, "200 bei Treffer");
  check(res.headers.get("Access-Control-Allow-Origin") === ALLOWED, "CORS-Kopfzeile auch bei der Antwort");
  check(JSON.stringify(body) === JSON.stringify({
    found: true, name: "Zelt Ultra 2", weightGrams: 1240, price: 549, currency: "CHF", confidence: "high",
  }), "vollständige Antwort aus JSON-LD", JSON.stringify(body));
}
{
  servePage(`<html><body><p>Nichts Verwertbares hier.</p></body></html>`);
  const res = await call(post("https://shop.example/leer"));
  const body = await res.json();
  check(res.status === 200 && JSON.stringify(body) === JSON.stringify({ found: false }),
        "kein Treffer → { found: false }", JSON.stringify(body));
}
{
  servePage("", { status: 404 });
  const res = await call(post("https://shop.example/weg"));
  const body = await res.json();
  check(res.status === 502 && typeof body.error === "string", "Seite nicht erreichbar → 502", `${res.status} ${body.error}`);
}
{
  globalThis.fetch = async () => { throw new TypeError("network"); };
  const res = await call(post("https://shop.example/tot"));
  check(res.status === 502, "Netzfehler → 502, kein Absturz", String(res.status));
}
{
  servePage(`<title>Kocher</title><body>Gewicht: 73 g · 49.90 CHF</body>`);
  const res = await call(post("https://shop.example/kocher"));
  const body = await res.json();
  check(body.confidence === "low", "Regex-Treffer wird als 'low' ausgewiesen", body.confidence);
}

console.log("\n" + (fails ? fails + " Fehlschläge" : "Alles grün."));
process.exit(fails ? 1 : 0);
