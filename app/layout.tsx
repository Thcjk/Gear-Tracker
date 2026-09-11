import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";
import { BottomNav } from "@/components/nav/BottomNav";
import { PageTransition } from "@/components/nav/PageTransition";
import { ServiceWorkerRegistration } from "@/components/ui/ServiceWorkerRegistration";
import { SplashScreen } from "@/components/splash/SplashScreen";
import { StorageWarning } from "@/components/ui/StorageWarning";
import { InkDefs } from "@/components/ui/InkDefs";
import {
  splashBootScript,
  splashCriticalCss,
} from "@/components/splash/splashCss";
import { AppStoreProvider } from "@/lib/store";
import { STORAGE_KEY } from "@/lib/storage";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Die Browser-Leiste folgt dem Systemtheme: eine feste Farbe wäre in einem
 * der beiden Modi ein Fremdkörper über der Seite. Das Manifest trägt
 * daneben Onyx als festen Wert – dort ist nur einer vorgesehen.
 */
const THEME_COLORS = [
  { media: "(prefers-color-scheme: light)", color: "#B8895F" },
  { media: "(prefers-color-scheme: dark)", color: "#3A2E22" },
];
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Akzentschrift für Etiketten, Marginalien und die Sprechblase des
 * Maskottchens – nie für Zahlen. Ein Gewicht, das man zweimal lesen muss,
 * ist ein schlechteres Gewicht.
 *
 * display:"swap" statt "optional": die Handschrift ist Teil des Looks,
 * nicht nur Zierde; sie darf einen Moment später kommen, aber sie soll
 * kommen. Nur zwei Schnitte, damit der Download klein bleibt.
 */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gear-Tracker",
  description:
    "Packlisten und Gewichte für Ultralight-Trekking – lokal im Browser.",
  applicationName: "Gear-Tracker",
  manifest: `${BASE_PATH}/manifest.json`,
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.svg`, type: "image/svg+xml" },
      { url: `${BASE_PATH}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: `${BASE_PATH}/apple-touch-icon.png`, sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Gear-Tracker",
    // Die Statusleiste liegt dadurch über der App-Fläche; oben wird per
    // safe-area-inset-top freigehalten, damit nichts darunter rutscht.
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: THEME_COLORS,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Ohne das bleibt bei black-translucent unter der Notch ein weisser Balken
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      className={`${inter.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline, damit der Splash schon beim ersten Paint aussieht wie
            gedacht – das Tailwind-Stylesheet ist ein eigener Request. */}
        <style dangerouslySetInnerHTML={{ __html: splashCriticalCss }} />
        {/* Meldet dem CSS, dass JavaScript lebt: der Splash wartet dann auf
            den geladenen Store statt auf eine feste Uhr. Inline, weil ein
            eigener Request genau dann fehlschlagen kann, wenn es zählt. */}
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            // Läuft vor der Hydration, damit Dark Mode nicht aufblitzt.
            // Der Schlüssel kommt aus der Konstante, damit er nicht driftet.
            __html: `(function(){try{var d=JSON.parse(localStorage.getItem(${JSON.stringify(
              STORAGE_KEY,
            )})||"{}");if(d.theme==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
        {/* Einmal im Dokument: die Stempelkanten werden von jedem
            StampButton über ihre ID referenziert. */}
        <InkDefs />
        <AppStoreProvider>
          {/* Innerhalb des Providers, weil der Splash weiss, wann die App
              wirklich bereit ist. Als position:fixed-Ebene hängt seine
              Darstellung nicht an dieser Stelle im Baum. */}
          <SplashScreen />
          {/* Oben unter der Notch freihalten (status-bar-style ist
              black-translucent), unten Platz für die Bottom-Navigation */}
          <div
            className="splash-reveal mx-auto min-h-screen w-full max-w-3xl px-4 pb-36 sm:px-5"
            // Die Reissnägel ragen über die Kartenkante hinaus – ohne den
            // zusätzlichen Platz schneidet der Bildschirmrand sie oben ab.
            style={{
              paddingTop:
                "max(2.25rem, calc(env(safe-area-inset-top) + 1.25rem))",
            }}
          >
            <StorageWarning />
            <PageTransition>{children}</PageTransition>
          </div>
          <div className="splash-fade">
            <BottomNav />
          </div>
        </AppStoreProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
