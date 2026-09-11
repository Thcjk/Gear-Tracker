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
          onDark ? "text-white/85" : "text-paper-700 dark:text-paper-400"
        }`}
      >
        <span>
          {packed} von {total} gepackt
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className={`h-2.5 overflow-hidden rounded-full ${
          onDark ? "bg-black/25" : "bg-paper-200 shadow-neu-in-sm dark:bg-paper-900"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all ${
            // var(--accent) dreht sich mit dem Theme: hell Oceanic auf
            // Wheat (10.9:1), dunkel Nectarine auf der Karte (9.9:1).
            // Eine feste Akzentfarbe würde in einem der beiden verschwinden.
            onDark ? "" : "bg-accent"
          }`}
          style={{
            width: `${pct}%`,
            // Saison-Akzent kommt als CSS-Variable vom Banner; inline statt
            // als Tailwind-Arbitrary-Value, weil var()-Fallbacks mit Komma
            // beim Purge nicht zuverlässig erzeugt werden.
            ...(onDark
              ? { backgroundColor: "var(--season-accent, #E3A73E)" }
              : {}),
          }}
        />
      </div>
    </div>
  );
}
