"use client";

/**
 * Fortschritt als Fussspur auf einem gestrichelten Weg.
 *
 * Ein Balken sagt "73 %". Eine Spur sagt, wie weit man auf dem Weg ist –
 * und das ist beim Packen dasselbe, nur anschaulicher.
 *
 * Bewusst keine grosse SVG-Fläche mit preserveAspectRatio="none": die
 * würde bei jeder Kartenbreite anders breitgezogen und die Abdrücke mit
 * ihr. Stattdessen liegen zwölf kleine, quadratische SVGs in einer Reihe
 * über einer gestrichelten Linie. Damit stimmt die Form auf jedem
 * Bildschirm, und die Spur passt sich der Breite von selbst an.
 *
 * Zwölf Schritte unabhängig von der Anzahl Items: die Spur ist eine
 * Anzeige, keine Zählung. Die genaue Zahl steht daneben.
 */
const STEPS = 12;

/**
 * Ein Abdruck: Ballen und drei Zehen – auf dieser Grösse trägt mehr
 * Detail nichts. Die Abweichungen pro Schritt sind aus dem Index
 * gerechnet, damit die Spur unregelmässig aussieht, aber bei jedem Render
 * gleich bleibt.
 */
function Footprint({ index, done }: { index: number; done: boolean }) {
  const left = index % 2 === 0;
  const lift = left ? -5 : 5;
  const wobble = (((index * 29) % 7) - 3) * 1.6;
  const tilt = (left ? -14 : 14) + wobble;

  return (
    <svg
      viewBox="0 0 14 18"
      aria-hidden
      className={`h-[18px] w-[14px] shrink-0 transition-all duration-300 ${
        done
          ? "text-accent opacity-100"
          : "text-paper-400 opacity-40 dark:text-paper-600"
      }`}
      style={{
        transform: `translateY(${lift}px) rotate(${tilt}deg) scale(${
          done ? 1 : 0.82
        })`,
      }}
      fill="currentColor"
    >
      <ellipse cx="7" cy="11.5" rx="3.6" ry="5" />
      <circle cx="3.8" cy="4.6" r="1.25" />
      <circle cx="7.2" cy="3.4" r="1.25" />
      <circle cx="10.4" cy="4.9" r="1.25" />
    </svg>
  );
}

export function FootprintProgress({
  packed,
  total,
}: {
  packed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((packed / total) * 100);
  /**
   * Aufrunden: der erste abgehakte Eintrag soll auch den ersten Abdruck
   * setzen. Bei 1 von 20 wäre 12 · 0.05 = 0.6 sonst abgerundet null, und
   * die Spur bliebe leer, obwohl schon etwas passiert ist.
   */
  const done = total === 0 ? 0 : Math.ceil((packed / total) * STEPS);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={packed}
      aria-valuetext={`${packed} von ${total} gepackt`}
    >
      <div className="flex justify-between text-sm text-paper-700 dark:text-paper-400">
        <span>
          {packed} von {total} gepackt
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>

      <div className="relative mt-1 h-8">
        {/* Der Weg. Er liegt hinter den Abdrücken und endet an beiden
            Rändern, damit die Spur nicht aus dem Nichts kommt. */}
        <span
          aria-hidden
          className="absolute inset-x-1 top-1/2 border-t-2 border-dashed border-paper-300 dark:border-paper-700"
        />
        <div className="relative flex h-full items-center justify-between">
          {Array.from({ length: STEPS }, (_, index) => (
            <Footprint key={index} index={index} done={index < done} />
          ))}
        </div>
      </div>
    </div>
  );
}
