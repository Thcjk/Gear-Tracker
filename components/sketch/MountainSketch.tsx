import { Fir } from "@/components/sketch/parts";
import { Ground, SketchFrame, type SketchProps } from "./Sketch";

const ID = "sk-mountain";

/**
 * Bergkette mit Baumreihe davor – Deko hinter dem Listen-Kopf.
 *
 * Die hintere Kette ist nur Umriss, die vordere eine gefüllte Masse: so
 * entsteht Tiefe, ohne dass die Zeichnung an dieser Stelle laut wird. Die
 * Firnfelder bleiben als ungefüllte Kerben im Umriss stehen.
 */
export function MountainSketch({ className = "h-32 w-full", title }: SketchProps) {
  return (
    <SketchFrame
      viewBox="0 0 320 130"
      filterId={ID}
      className={className}
      title={title}
    >
      <Ground filterId={ID} y={108} x1={8} x2={312} opacity={0.36} />

      {/* Hintere Kette: nur Kontur, blass */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.38"
      >
        <path d="M14 98 Q48 62 78 30 Q104 62 130 96" />
        <path d="M200 96 Q230 64 256 36 Q286 66 312 98" />
        <path d="M64 44 Q70 52 77 48 Q85 55 92 51" strokeWidth="1.4" />
      </g>

      {/* Vordere Kette: gefüllte Masse mit zwei Gipfeln */}
      <path
        fill="currentColor"
        stroke="none"
        opacity="0.85"
        d="M26 104 L74 50 L96 26 L112 40 L124 22 L146 58 L160 72 L178 46 L196 26 L216 52 L238 74 L262 92 L294 104 Z"
      />
      {/* Firn: helle Kerben, die den Umriss aufbrechen */}
      <g stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.35">
        <path d="M96 44 Q104 54 112 49 Q121 57 129 52" />
        <path d="M186 44 Q193 52 200 48 Q208 55 215 51" />
      </g>

      {/* Baumreihe davor, sie gibt der Kette einen Massstab */}
      <Fir x={40} y={106} scale={0.32} opacity={0.7} />
      <Fir x={62} y={107} scale={0.24} opacity={0.55} />
      <Fir x={258} y={106} scale={0.28} opacity={0.65} />
      <Fir x={278} y={107} scale={0.2} opacity={0.5} />
    </SketchFrame>
  );
}
