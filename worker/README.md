# Produkt-Import-Worker

Ein einzelner Cloudflare Worker, der eine Produktseite serverseitig abruft
und daraus Name, Gewicht und Preis liest. Die App selbst kann das nicht:
sie liegt als statische Seite auf GitHub Pages, und Shops geben ihre Seiten
nicht per CORS für fremde Herkünfte frei.

Kein KI-Dienst. Gelesen wird strukturierte Auszeichnung, und wo die fehlt,
ein eng begrenzter Regex-Fallback. Unsichere Treffer werden als solche
gekennzeichnet, statt als Tatsache ausgegeben.

## Schnittstelle

```
POST https://<name>.<subdomain>.workers.dev/
Content-Type: application/json

{ "url": "https://shop.example/produkt/zelt-ultra-2" }
```

Antwort bei einem Treffer:

```json
{
  "found": true,
  "name": "Zelt Ultra 2",
  "weightGrams": 1240,
  "price": 549,
  "currency": "CHF",
  "confidence": "high"
}
```

`name`, `weightGrams`, `price` und `currency` fehlen einzeln, wenn sie nicht
zu ermitteln waren. Konnte gar nichts gelesen werden:

```json
{ "found": false }
```

Fehler kommen als `{ "error": "..." }` mit passendem Status (400 ungültige
Adresse, 403 nicht freigegebene Herkunft, 405 falsche Methode, 502 Seite
nicht erreichbar).

### Woher die Werte stammen

Der Reihe nach, das erste Ergebnis pro Feld gewinnt:

1. **JSON-LD** – `<script type="application/ld+json">` mit
   `"@type": "Product"`. Gelesen werden `name`, `offers.price`,
   `offers.priceCurrency` sowie das Gewicht aus `weight` (auch als
   `QuantitativeValue` mit `unitCode` `GRM`/`KGM`) oder aus
   `additionalProperty`. Kilogramm werden in Gramm umgerechnet.
2. **Open Graph und Meta-Tags** – `og:title`, `product:price:amount`,
   `product:price:currency`, `product:weight:value`/`:units`.
3. **Regex über den sichtbaren Text** – Gewicht
   `(\d+[.,]?\d*)\s?(g|gramm|kg)\b`, bevorzugt in der Nähe einer
   Beschriftung wie „Gewicht“; Preis `(\d+[.,]\d{2})\s?(CHF|EUR|$|€|Fr.)`
   oder mit dem Symbol davor. Der Schweizer Tausenderapostroph
   (`1'299.00`) wird erkannt.

`confidence` ist `"high"`, wenn **alle** gelieferten Werte aus Stufe 1
oder 2 stammen, sonst `"low"`. Es zählt also das schwächste Glied: ein
sicher gelesener Name rettet ein geratenes Gewicht nicht. Die App zeigt
`"low"`-Treffer mit einem Hinweis an und übernimmt grundsätzlich nichts
ungeprüft.

### Grenzen

- Nur `http` und `https`, keine privaten oder lokalen Adressen.
- Höchstens 2 MB werden gelesen, danach bricht der Worker ab.
- 10 Sekunden Zeitlimit pro Abruf.
- Kein API-Schlüssel, kein Rate-Limit – der Zugang wird allein über CORS
  auf die eine erlaubte Herkunft begrenzt.
- Shops, die ihre Preise erst per JavaScript nachladen, liefern nichts.
  Dann kommt `found: false` und der Nutzer trägt von Hand ein.

## Deploy

Voraussetzung: Node ≥ 18 und ein Cloudflare-Konto.

```bash
cd worker
npm install
npx wrangler login     # öffnet den Browser
npx wrangler deploy
```

`wrangler deploy` gibt am Ende die Adresse aus, unter der der Worker läuft:

```
Published gear-tracker-import
  https://gear-tracker-import.<dein-subdomain>.workers.dev
```

### Über GitHub Actions (ohne Terminal)

Geht beides nicht – kein Terminal, kein Browser-Login – deployt der Workflow
`.github/workflows/deploy-worker.yml` den Worker auf Knopfdruck:

1. Im Repository unter Settings → Secrets and variables → Actions → Secrets
   ein Secret `CLOUDFLARE_API_TOKEN` anlegen (Vorlage "Edit Cloudflare
   Workers").
2. Unter Actions → „Deploy Import-Worker" → „Run workflow".
3. Die ausgegebene Adresse steht in der Zusammenfassung des Laufs.

Der Token liegt dabei ausschliesslich in den GitHub-Secrets, nie im Code.

### Ohne Browser-Login

Geht der interaktive Login nicht (zum Beispiel auf dem Handy), erkennt
Wrangler auch einen API-Token aus der Umgebung:

```bash
export CLOUDFLARE_API_TOKEN=...    # Vorlage "Edit Cloudflare Workers"
npx wrangler deploy
```

Der Token gehört **nur** in die Umgebung des Deploy-Befehls, niemals in
eine Datei im Repository.

## Erlaubte Herkunft eintragen

In `wrangler.toml` steht unter `[vars]`, wer den Worker aufrufen darf:

```toml
[vars]
ALLOWED_ORIGINS = "https://thcjk.github.io"
```

Bewusst kein `"*"`. Der Worker ruft fremde Seiten ab – das soll nicht jede
beliebige Website über den Browser eines Besuchers tun können. Für die
lokale Entwicklung eine zweite Herkunft mit Komma anhängen:

```toml
ALLOWED_ORIGINS = "https://thcjk.github.io,http://localhost:3000"
```

Nach jeder Änderung erneut `npx wrangler deploy`.

## Worker-Adresse in der App hinterlegen

Die App liest die Adresse aus `NEXT_PUBLIC_IMPORT_WORKER_URL`. Fehlt sie,
bleibt die Import-Fläche in der Library einfach aus – die App funktioniert
unverändert weiter.

**Lokal** in `.env.local` im Projektstamm:

```
NEXT_PUBLIC_IMPORT_WORKER_URL=https://gear-tracker-import.<subdomain>.workers.dev
```

**Für GitHub Pages** in `.github/workflows/deploy.yml`; der Wert steht im
`env`-Block des Build-Schritts und lässt sich über eine Repository-Variable
gleichen Namens überschreiben (Settings → Secrets and variables → Actions →
Variables).

## Tests

```bash
npm test        # Auslesen gegen 14 Beispielseiten, ohne Netz
npm run typecheck
```
