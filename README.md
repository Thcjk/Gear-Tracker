# Ultralight Gear-Tracker

Web-App zum Verwalten und Analysieren von Ultralight-Trekking-Ausrüstung.

## Live

**https://thcjk.github.io/Gear-Tracker/**

> Deployment über GitHub Pages (statischer Export). Daten liegen in LocalStorage.

## Features

- **Gear-Library** – Items anlegen, bearbeiten, löschen, sortieren und filtern
- **Produkt-Import per Link** – lokal/`next dev` via `/api/import-product`; auf GitHub Pages öffnet sich das Formular mit Link-Referenz (keine Server-API)
- **Packlisten** – mehrere Listen, Mengen, „gepackt“-Checkbox + Fortschritt
- **Dashboard** – Gesamtgewicht, Gesamtwert, Kategorie-Chart, Top-5 schwerste Items
- **Vergleich** – 2+ Listen nebeneinander mit Differenz
- **PDF-Export** – Packliste als PDF
- **Light/Dark Mode** – Zustand in LocalStorage

## Tech

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Recharts
- jsPDF
- lucide-react

## Entwicklung

```bash
npm install
npm run dev
```

## GitHub Pages Build (lokal)

```bash
npm run build:pages
npx serve out
```

## Deploy

Push auf `main` triggert `.github/workflows/pages.yml`.

In GitHub: **Settings → Pages → Source = GitHub Actions**.

## Lizenz

MIT
