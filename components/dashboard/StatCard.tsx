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
      className="animate-rise p-3.5"
      style={{ animationDelay: staggerDelay(index, 80) }}
    >
      <p className="text-[0.625rem] font-bold uppercase leading-tight tracking-wider text-clay-700 dark:text-clay-400">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-extrabold leading-tight tracking-tight tabular-nums text-clay-900 dark:text-clay-50 sm:text-2xl">
        {shown}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-clay-700 dark:text-clay-400">{hint}</p>
      )}
    </SurfaceCard>
  );
}
