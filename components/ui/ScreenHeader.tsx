import type { ReactNode } from "react";

/**
 * Wiederkehrender Kopf jeder Hauptseite: Titel links, optionale Aktion
 * rechts – wie in nativen Apps. Ersetzt den früheren globalen Web-Header
 * im Layout, der auf jedem Screen dasselbe wiederholt hat.
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
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-[1.75rem] font-extrabold leading-tight tracking-tight text-clay-900 dark:text-clay-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-clay-700 dark:text-clay-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
