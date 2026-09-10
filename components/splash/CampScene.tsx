import { Campfire, Fir, Tent } from "@/components/sketch/parts";
import { Ground, SketchFrame, type SketchProps } from "@/components/sketch/Sketch";

const ID = "sk-camp";

/**
 * Lagerplatz im Wald – das Motiv des Startbildschirms.
 *
 * Aufbau wie in einer Kohleskizze: eine grosse dunkle Masse (der Baum) als
 * Anker, daneben zwei leichtere Umrisse, und darunter ein breiter Wischer,
 * der alles auf den Boden stellt. Der zweite Baum steht weiter hinten,
 * kleiner und blasser.
 *
 * Farbe kommt über currentColor. Die Szene steht auch im Splash, und dort
 * ist noch kein Stylesheet geladen – var(--accent) wäre in der ersten
 * Sekunde schlicht ungültig.
 */
export function CampScene({ className = "h-40 w-56" }: SketchProps) {
  return (
    <SketchFrame viewBox="0 0 300 200" filterId={ID} className={className}>
      <Ground filterId={ID} y={170} x1={20} x2={284} opacity={0.5} />

      {/* Hinterer Baum: kleiner, blasser, halb hinter dem vorderen */}
      <Fir x={207} y={167} scale={0.5} opacity={0.4} />

      {/* Hauptbaum – die dunkle Masse, an der die Szene hängt */}
      <Fir x={150} y={169} scale={1.02} />

      <Tent x={88} y={168} scale={0.86} />
      <Campfire x={247} y={168} scale={0.95} />
    </SketchFrame>
  );
}
