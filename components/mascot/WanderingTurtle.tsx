/**
 * Kleine Schildkröte, die gelegentlich durchs Bild läuft.
 *
 * Reine Deko: kein Bezug zum Gewicht, keine Interaktion, kein Text. Sie
 * soll auffallen, wenn man hinschaut, und nicht stören, wenn man arbeitet
 * – deshalb läuft sie ein paar Sekunden und lässt sich dann eine halbe
 * Minute nicht blicken.
 *
 * Bewusst ohne framer-motion: die Bibliothek wiegt mehr als alles, was
 * hier animiert wird, und für "läuft von links nach rechts" reicht eine
 * CSS-Keyframe. Animiert werden nur transform und opacity, beides legt
 * der Browser auf den Compositor – es gibt kein Layout und kein Neuzeichnen
 * je Bild.
 *
 * Die Pause steckt in der Kurve und nicht in einer Wiederholungs-
 * verzögerung: die Überquerung belegt die ersten 25 % des Zyklus, danach
 * steht die Figur unsichtbar am rechten Rand. Eine Animation, die nie
 * aufhört zu laufen, ist für den Compositor billiger als eine, die ständig
 * neu gestartet wird.
 *
 * Das Elternelement braucht position:relative – sonst richtet sich die
 * Figur am nächsten positionierten Vorfahren aus und läuft quer über die
 * halbe Seite.
 *
 * Zum Aufbau: die Prozente von translateX beziehen sich auf die eigene
 * Breite des Elements, nicht auf die des Elternteils. Die animierte Hülle
 * ist deshalb so breit wie das Elternteil und trägt die Figur an ihrem
 * linken Rand – nur so ist ±104 % eine volle Überquerung.
 */
export function WanderingTurtle({
  /** Länge eines vollständigen Zyklus inklusive Pause, in Sekunden. */
  cycle = 32,
  /** Versatz, damit auf einem Bildschirm nie zwei gleichzeitig laufen. */
  delay = 0,
  size = 22,
  className = "",
}: {
  cycle?: number;
  delay?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`animate-wander pointer-events-none absolute left-0 block w-full ${className}`}
      style={{
        height: size,
        /**
         * Grunddeckkraft 0, nicht 1.
         *
         * Während der Startverzögerung wendet der Browser noch keinen
         * Keyframe an – ohne diesen Wert stünden alle Figuren bis zu
         * ihrem Einsatz sichtbar am linken Rand, und auf einer Seite mit
         * mehreren wären es dann drei auf einmal statt einer.
         */
        opacity: 0,
        // Die Figur sitzt mit den Füssen auf der Kante, an der sie hängt.
        top: -size + 2,
        ["--wander-cycle" as string]: `${cycle}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <span
        className="animate-plod block"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 44 30"
          className="h-full w-full text-ink/35 dark:text-paper/35"
          fill="currentColor"
        >
          {/* Panzer */}
          <path d="M6 24 Q8 8 22 7 Q36 6 38 23 Z" />
          {/* Kopf */}
          <path d="M38 20 Q44 19 44 14 Q44 10 40 11 Q36 12 36 17 Z" />
          {/* Beine – vorne und hinten leicht versetzt, das reicht als
              Andeutung von Schritt */}
          <path d="M11 23 L11 29 L15 29 L15 23 Z" />
          <path d="M30 23 L30 30 L34 30 L34 23 Z" />
          {/* Schwanz */}
          <path d="M6 22 L1 20 L5 24 Z" />
        </svg>
      </span>
    </span>
  );
}
