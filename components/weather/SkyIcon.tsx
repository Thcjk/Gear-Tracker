import type { SkyKind } from "@/lib/weather";

/**
 * Wetterbilder im Stil der übrigen Zeichnungen: Strich statt Fläche,
 * runde Enden, sichtbar von Hand und nicht aus einem Icon-Set.
 *
 * Sieben Bilder für gut zwei Dutzend WMO-Codes. Mehr liesse sich auf
 * dieser Grösse nicht unterscheiden – und für die Frage, ob die
 * Regenjacke mitmuss, sind sieben genug.
 *
 * Sonne und Wolke sind bewusst leicht unrund. Ein exakter Kreis über
 * einer exakten Wolkenlinie sieht aus wie ein Piktogramm aus der
 * Wetter-App, nicht wie etwas, das jemand an den Rand gekritzelt hat.
 */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Die Wolke – von mehreren Bildern geteilt. */
function Cloud({ y = 0 }: { y?: number }) {
  return (
    <path
      d={`M7.5 ${18 + y} Q4.2 ${17.6 + y} 4.4 ${14.4 + y} Q4.7 ${11.4 + y} 8 ${
        11.6 + y
      } Q8.6 ${7.2 + y} 12.8 ${7.4 + y} Q16.8 ${7.5 + y} 17.4 ${11.2 + y} Q20.6 ${
        10.9 + y
      } 20.8 ${14.3 + y} Q21 ${17.7 + y} 17.6 ${18 + y} Z`}
      {...STROKE}
    />
  );
}

function Rays() {
  return (
    <g {...STROKE}>
      <path d="M12 2.6 L12 5" />
      <path d="M19 5.2 L17.4 6.9" />
      <path d="M21.6 12.2 L19.2 12.1" />
      <path d="M5 5 L6.7 6.8" />
      <path d="M2.5 12 L4.9 12.1" />
    </g>
  );
}

export function SkyIcon({
  kind,
  className = "h-7 w-7",
  label,
}: {
  kind: SkyKind;
  className?: string;
  /** Gesetzt macht das Bild für Screenreader sichtbar, sonst ist es Deko. */
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label && <title>{label}</title>}

      {kind === "sun" && (
        <>
          <Rays />
          {/* Kein perfekter Kreis: zwei Bögen, die sich nicht ganz treffen. */}
          <path
            d="M12 7.4 Q16.6 7.6 16.7 12.1 Q16.8 16.7 12 16.6 Q7.3 16.5 7.4 12 Q7.5 7.5 12 7.4 Z"
            {...STROKE}
          />
        </>
      )}

      {kind === "partly" && (
        <>
          <g {...STROKE}>
            <path d="M15.4 3 L15.4 5" />
            <path d="M20.4 5.4 L19.2 6.7" />
            <path d="M22 10.6 L20.2 10.6" />
          </g>
          <path
            d="M15.4 6.4 Q18.8 6.6 18.9 9.9 Q18.9 12 17.4 12.9"
            {...STROKE}
          />
          <Cloud y={1.6} />
        </>
      )}

      {kind === "cloud" && (
        <>
          <Cloud y={-1} />
          {/* Zweite, tiefere Wolkenlage: bedeckt ist mehr als eine Wolke. */}
          <path d="M8.4 20.2 Q13 21.2 17.2 20.2" {...STROKE} />
        </>
      )}

      {kind === "fog" && (
        <>
          <Cloud y={-2.4} />
          <g {...STROKE}>
            <path d="M5.4 18.4 Q12 17.4 18.6 18.4" />
            <path d="M7 21.2 Q12 20.4 17 21.2" />
          </g>
        </>
      )}

      {kind === "rain" && (
        <>
          <Cloud y={-2.6} />
          <g {...STROKE}>
            <path d="M8.6 17.4 L7.4 20.8" />
            <path d="M12.4 17.6 L11.2 21.4" />
            <path d="M16.2 17.4 L15 20.6" />
          </g>
        </>
      )}

      {kind === "snow" && (
        <>
          <Cloud y={-2.6} />
          <g {...STROKE}>
            <path d="M8.4 18 L8.4 20.8 M7.2 18.8 L9.6 20 M9.6 18.8 L7.2 20" />
            <path d="M15.4 18.4 L15.4 21.2 M14.2 19.2 L16.6 20.4 M16.6 19.2 L14.2 20.4" />
          </g>
        </>
      )}

      {kind === "thunder" && (
        <>
          <Cloud y={-3} />
          <path d="M13.4 16.2 L10 20.2 L12.6 20.2 L10.8 23.2" {...STROKE} />
          <path d="M17 17.2 L16 19.8" {...STROKE} />
        </>
      )}
    </svg>
  );
}
