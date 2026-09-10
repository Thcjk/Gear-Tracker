import type { CSSProperties, ReactNode } from "react";

/**
 * Die Kartenfläche der App im Neumorphism-Stil: dieselbe Farbe wie der
 * Seitenhintergrund, die Plastik kommt allein aus dem Doppelschatten.
 * Padding und Zusätze kommen über className.
 */
export const SURFACE_CLASSES =
  "rounded-card bg-clay-50 shadow-neu dark:bg-clay-800";

export function SurfaceCard({
  as: Tag = "div",
  className = "",
  style,
  role,
  children,
}: {
  as?: "div" | "article" | "section";
  className?: string;
  style?: CSSProperties;
  role?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`${SURFACE_CLASSES} ${className}`} style={style} role={role}>
      {children}
    </Tag>
  );
}

/**
 * Hinweisfläche für leere Listen – identisches Aussehen an allen Stellen.
 *
 * Mit illustration steht eine Sketch-Zeichnung darüber. Sie ist Schmuck
 * und trägt keine Information, die nicht auch im Text steht; deshalb
 * bleibt sie für Screenreader unsichtbar (die Zeichnungen setzen selbst
 * aria-hidden, solange kein title übergeben wird).
 */
export function EmptyState({
  children,
  illustration,
}: {
  children: ReactNode;
  illustration?: ReactNode;
}) {
  if (!illustration) {
    return (
      <SurfaceCard className="p-6 text-sm text-clay-700 dark:text-clay-300">
        {children}
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard className="flex flex-col items-center gap-4 p-8 text-center text-sm text-clay-700 dark:text-clay-300">
      <span className="text-accent opacity-80">{illustration}</span>
      <span className="max-w-xs">{children}</span>
    </SurfaceCard>
  );
}
