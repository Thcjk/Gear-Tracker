"use client";

export function ProgressBar({
  packed,
  total,
}: {
  packed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm text-earth-600 dark:text-earth-300">
        <span>
          {packed} von {total} gepackt
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-forest-100 dark:bg-forest-800">
        <div
          className="h-full rounded-full bg-ember-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
