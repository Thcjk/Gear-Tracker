import { SketchFrame, type SketchProps } from "./Sketch";

/** Lagerfeuer mit Funken – Abschluss einer Tour. */
export function CampfireSketch({ className = "h-28 w-28", title }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 140 140" className={className} title={title}>
      <g strokeWidth="1.4">
        {/* Flamme, zweischalig */}
        <path d="M52 100 Q44 66 70 30 Q65 62 84 74 Q101 87 92 100" />
        <path d="M66 99 Q60 78 75 58 Q73 79 83 86 Q90 93 84 99" strokeWidth="1" opacity="0.7" />
        {/* Scheite, gekreuzt */}
        <path d="M34 108 Q70 118 108 106" />
        <path d="M36 116 Q70 106 106 118" />
      </g>
      <g strokeWidth="0.9" opacity="0.5">
        {/* Funken */}
        <path d="M96 44 Q99 41 101 44" />
        <path d="M40 56 Q43 53 45 56" />
        <path d="M104 66 Q107 63 109 66" />
      </g>
    </SketchFrame>
  );
}
