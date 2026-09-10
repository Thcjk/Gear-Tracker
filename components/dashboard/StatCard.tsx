"use client";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
      <p className="text-sm font-medium text-earth-500 dark:text-earth-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-50">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-earth-500 dark:text-earth-400">{hint}</p>
      )}
    </div>
  );
}
