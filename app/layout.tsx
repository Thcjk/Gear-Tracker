import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/nav/BottomNav";
import { AppStoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultralight Gear-Tracker",
  description:
    "Packlisten und Gewichte für Ultralight-Trekking – lokal im Browser.",
};

export const viewport: Viewport = {
  themeColor: "#1a4533",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <AppStoreProvider>
          <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6">
            <header className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-600 dark:text-ember-400">
                Outdoor Pack Lab
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-forest-900 dark:text-forest-50">
                Ultralight Gear-Tracker
              </h1>
            </header>
            {children}
          </div>
          <BottomNav />
        </AppStoreProvider>
      </body>
    </html>
  );
}
