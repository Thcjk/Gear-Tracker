import { Fir, Tent } from "@/components/sketch/parts";
import { Ground, SketchFrame, type SketchProps } from "./Sketch";

const ID = "sk-tent";

/** Aufgebautes Zelt mit einem Baum dahinter – leere Packliste. */
export function TentSketch({ className = "h-32 w-40", title }: SketchProps) {
  return (
    <SketchFrame
      viewBox="0 0 180 140"
      filterId={ID}
      className={className}
      title={title}
    >
      <Ground filterId={ID} y={118} x1={14} x2={168} opacity={0.5} />
      <Fir x={140} y={115} scale={0.6} opacity={0.4} />
      <Tent x={78} y={117} scale={1.05} />
    </SketchFrame>
  );
}
