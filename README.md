# Ultralight Gear-Tracker

Web-App zum Verwalten und Analysieren von Ultralight-Trekking-Ausrüstung.

## Features

- **Gear-Library** – Items anlegen, bearbeiten, löschen, sortieren und filtern
- **Produkt-Import per Link** – Server-Route scraped Gewicht/Preis-Vorschläge
- **Packlisten** – mehrere Listen, Mengen, „gepackt“-Checkbox + Fortschritt
- **Dashboard** – Gesamtgewicht, Gesamtwert, Kategorie-Chart, Top-5 schwerste Items
- **Vergleich** – 2+ Listen nebeneinander mit Differenz
- **PDF-Export** – Packliste als PDF
- **Light/Dark Mode** – Zustand in LocalStorage

Alles läuft lokal im Browser (LocalStorage). Kein Backend/DB außer der Import-API-Route.

## Tech

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Recharts
- jsPDF
- lucide-react

## Start

```bash
npm install
npm run dev
```

App öffnen unter [http://localhost:3000](http://localhost:3000).

## Deploy

Vercel empfohlen (unterstützt die `/api/import-product` Route nativ).

## Lizenz

MIT
