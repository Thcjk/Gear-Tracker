import type { CSSProperties, ReactNode } from "react";

/**
 * Die Kartenfläche der App im Neumorphism-Stil: dieselbe Farbe wie der
 * Seitenhintergrund, die Plastik kommt allein aus dem Doppelschatten.
 * Padding und Zusätze kommen über className.
 */
export const SURFACE_CLASSES =
  "rounded-card bg-clay-200 shadow-neu dark:bg-clay-950";

export function SurfaceCard({
  as: Tag = "div",
  className = "",
  style,
  children,
}: {
  as?: "div" | "article" | "section";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <Tag className={`${SURFACE_CLASSES} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

/** Hinweisfläche für leere Listen – identisches Aussehen an allen vier Stellen. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <SurfaceCard className="p-6 text-sm text-clay-700 dark:text-clay-300">
      {children}
    </SurfaceCard>
  );
}
