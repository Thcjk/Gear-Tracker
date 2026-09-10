import type { CSSProperties, ReactNode } from "react";

/**
 * Die weisse Kartenfläche der App: abgerundet, weicher Schatten, im Dark
 * Mode dunkelgrün. Stand vorher wortgleich in einem guten Dutzend
 * Komponenten. Padding und Zusätze kommen über className, damit die
 * Aufrufer optisch exakt das behalten, was sie vorher hatten.
 */
export const SURFACE_CLASSES =
  "rounded-card bg-white shadow-soft dark:bg-forest-900 dark:shadow-soft-dark";

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
    <SurfaceCard className="p-6 text-sm text-earth-600 dark:text-earth-300">
      {children}
    </SurfaceCard>
  );
}
