"use client";

export function ProgressBar({
  packed,
  total,
  tone = "default",
}: {
  packed: number;
  total: number;
  /** "onDark" für hellen Text auf dunklem Banner-Hintergrund */
  tone?: "default" | "onDark";
}) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
  const onDark = tone === "onDark";

  return (
    <div>
      <div
        className={`mb-1 flex justify-between text-sm ${
          onDark ? "text-white/85" : "text-earth-600 dark:text-earth-300"
        }`}
      >
        <span>
          {packed} von {total} gepackt
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className={`h-2 overflow-hidden rounded-full ${
          onDark ? "bg-black/25" : "bg-forest-100 dark:bg-forest-800"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            onDark ? "" : "bg-ember-500"
          }`}
          style={{
            width: `${pct}%`,
            // Saison-Akzent kommt als CSS-Variable vom Banner; inline statt
            // als Tailwind-Arbitrary-Value, weil var()-Fallbacks mit Komma
            // beim Purge nicht zuverlässig erzeugt werden.
            ...(onDark
              ? { backgroundColor: "var(--season-accent, #fb923c)" }
              : {}),
          }}
        />
      </div>
    </div>
  );
}
