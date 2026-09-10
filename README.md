# Gear-Tracker

Web-App zum Verwalten und Analysieren von Ultralight-Trekking-Ausrüstung: Gear-Library
pflegen, Packlisten zusammenstellen, Gewicht und Kosten im Blick behalten.

**Live:** https://thcjk.github.io/Gear-Tracker/

Die App ist eine rein statische Single-Page-Anwendung. Es gibt **kein Backend und kein
Konto** – alle Daten liegen ausschliesslich im LocalStorage des Browsers.

## Features

- **Gear-Library** – Items anlegen, bearbeiten, löschen; sortieren nach Name, Gewicht
  oder Preis; filtern nach Kategorie. Gewicht und Preis werden manuell erfasst.
- **Produkt-Import per Link** (optional) – ein Cloudflare Worker liest Name,
  Gewicht und Preis aus einer Produktseite und füllt das Formular vor. Der
  Vorschlag wird nie ungeprüft übernommen; unsichere Treffer sind markiert.
  Siehe [`worker/README.md`](worker/README.md). Ohne eingerichteten Worker
  bleibt die Fläche aus.
- **Packlisten** – beliebig viele Listen, die Items aus der Library referenzieren
  (inkl. Menge)
- **Fortschritt** – „gepackt"-Checkbox pro Item und Anzeige „X von Y gepackt"
- **Dashboard pro Liste** – Kennzahlen-Karten (Gesamtgewicht, Gesamtwert, Anzahl Items),
  Balkendiagramm „Gewicht pro Kategorie" und Top-5 der schwersten Items
- **Vergleich** – zwei oder mehr Packlisten nebeneinander mit Gewicht, Wert und Differenz
- **PDF-Export** – Packliste als PDF, vollständig im Browser erzeugt (jsPDF)
- **Light/Dark Mode** – Umschalter in den Einstellungen, Zustand im LocalStorage
- **Backup** – Daten als JSON exportieren und wieder importieren
- **Als App installierbar** – Web-App-Manifest mit `display: standalone`

Kategorien (fest): `shelter`, `sleep-system`, `backpack`, `kitchen`, `clothing`,
`electronics`, `hygiene-misc`.

## Auf dem Home-Bildschirm installieren

**iOS/Safari:** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm". Die App
startet danach ohne Adressleiste, mit eigenem Icon und dunkelgrüner
Statusleiste. **Android/Chrome:** Menü → „App installieren".

Das Icon liegt als `public/icon.svg`; die PNG-Grössen sind eingecheckt und
werden nur bei einer Änderung neu erzeugt:

```bash
npm i -D sharp && node scripts/generate-icons.mjs && npm un sharp
```

## Tech-Stack

- Next.js 14 (App Router) mit `output: 'export'` – statischer Export, keine Server-Routes
- Neumorphism-Oberfläche: Doppelschatten als Tailwind-Utilities (`shadow-neu*`),
  Schattenfarben als CSS-Variablen, die mit dem Theme wechseln
- TypeScript
- Tailwind CSS (Dark Mode über `class`)
- Recharts (Diagramme)
- jsPDF + jspdf-autotable (PDF-Export)
- lucide-react (Icons)

## Lokales Dev-Setup

```bash
npm install
npm run dev
```

Die App läuft dann unter http://localhost:3000/Gear-Tracker/ – der Pfad-Präfix kommt
vom `basePath` in `next.config.js` und gilt auch im Dev-Server.

Für den Produkt-Import `.env.example` nach `.env.local` kopieren und
`NEXT_PUBLIC_IMPORT_WORKER_URL` auf die Adresse setzen, die `wrangler deploy`
ausgegeben hat. Im GitHub-Actions-Build kommt derselbe Wert aus der
Repository-Variable gleichen Namens (Settings → Secrets and variables →
Actions → Variables).

Produktionsbuild lokal prüfen:

```bash
npm run build      # erzeugt den statischen Export in out/
npx serve out      # danach http://localhost:3000/Gear-Tracker/ öffnen
```

> `npm start` gibt es bewusst nicht: `next start` funktioniert mit `output: 'export'`
> nicht, weil kein Node-Server im Spiel ist.

## Deployment auf GitHub Pages

Jeder Push auf `main` startet den Workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. `npm ci`
2. `npm run build` → statischer Export nach `out/`
3. `actions/upload-pages-artifact` lädt `out/` hoch
4. `actions/deploy-pages` veröffentlicht das Artefakt

### Einmalige Einrichtung im Repo

**In den Repo-Settings unter „Pages" muss als Source „GitHub Actions" eingestellt
werden** (Settings → Pages → Build and deployment → Source = *GitHub Actions*).
Ohne diese Einstellung schlägt der Deploy-Schritt fehl bzw. es wird weiterhin der alte
Branch-Inhalt ausgeliefert.

Der Build-Output gehört **nicht** ins Repository – `out/` ist in `.gitignore`.

### basePath

GitHub Pages hostet das Projekt unter einem Unterpfad, deshalb setzt
`next.config.js` `basePath` und `assetPrefix` auf den Repo-Namen (`Gear-Tracker`).
Bei einer Umbenennung des Repos muss dieser Wert dort angepasst werden.

Finale URL: **https://thcjk.github.io/Gear-Tracker/**

## Lizenz

MIT
