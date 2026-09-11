import type { ReactNode } from "react";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

/**
 * Wiederkehrender Kopf jeder Hauptseite: Titel links, optionale Aktion
 * rechts – wie in nativen Apps.
 *
 * Der Kopf steht auf Papier und nicht direkt auf dem Brett. Das ist nicht
 * nur Optik: Ink auf Kork erreicht 4.2:1, für den kleinen Untertitel sind
 * das zu wenig. Auf Papier sind es 8.5:1.
 */
export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard
      as="section"
      pinned={`header:${title}`}
      pinCount={2}
      tone="kraft"
      className="mb-6 flex items-center justify-between gap-4 px-5 py-4"
    >
      <div className="min-w-0">
        <h1 className="truncate text-[1.75rem] font-extrabold leading-tight tracking-tight text-paper-800 dark:text-paper-100">
          {title}
        </h1>
        {subtitle && (
          <p className="handwritten mt-0.5 text-base text-paper-700 dark:text-paper-300">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </SurfaceCard>
  );
}
