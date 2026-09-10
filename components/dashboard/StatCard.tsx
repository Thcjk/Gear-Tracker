"use client";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useCountUp } from "@/lib/useCountUp";
import { staggerDelay } from "@/lib/stagger";

export function StatCard({
  label,
  value,
  hint,
  countTo,
  format,
  duration = 1000,
  index = 0,
}: {
  label: string;
  /** Statischer Anzeigewert – wird ignoriert, wenn countTo gesetzt ist. */
  value?: string;
  hint?: string;
  /** Zielwert für die Hochzähl-Animation beim ersten Rendern. */
  countTo?: number;
  /** Formatierung des animierten Zwischenwerts (z. B. formatWeight). */
  format?: (value: number) => string;
  duration?: number;
  index?: number;
}) {
  const animated = useCountUp(countTo ?? 0, countTo === undefined ? 0 : duration);
  const shown =
    countTo === undefined
      ? value ?? ""
      : (format ?? ((n: number) => String(Math.round(n))))(animated);

  return (
    <SurfaceCard
      className="animate-rise p-4"
      style={{ animationDelay: staggerDelay(index, 80) }}
    >
      <p className="text-sm font-medium text-earth-500 dark:text-earth-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-forest-900 dark:text-forest-50">
        {shown}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-earth-500 dark:text-earth-400">{hint}</p>
      )}
    </SurfaceCard>
  );
}
