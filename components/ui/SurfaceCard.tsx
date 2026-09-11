import type { CSSProperties, ReactNode } from "react";
import { PinDecoration } from "@/components/ui/PinDecoration";
import { cornerRadiusFor, pinsFor, tiltFor } from "@/lib/pinning";

/**
 * Die Kartenfläche der App: ein Blatt Papier, das auf dem Kork-Brett
 * liegt.
 *
 * Die Grundfarbe kommt aus .sheet (globals.css) und nicht mehr aus einer
 * Tailwind-Klasse – so kann jede Papiersorte ihren eigenen Ton setzen,
 * ohne dass jede Aufrufstelle zwei Klassen für hell und dunkel schreiben
 * muss. Padding und Zusätze kommen weiterhin über className.
 */
export const SURFACE_CLASSES = "sheet rounded-card shadow-sheet";

/**
 * Die Papiersorte. Der Unterschied ist bewusst klein: ein Stapel aus
 * einer Schublade, kein Farbleitsystem. Wer die Sorte nicht bemerkt, soll
 * trotzdem merken, dass nicht alles dasselbe Blatt ist.
 */
export type SheetTone = "note" | "card" | "postit" | "kraft";

const TONE_CLASS: Record<SheetTone, string> = {
  note: "",
  card: "sheet-card",
  postit: "sheet-postit",
  kraft: "sheet-kraft",
};

export function SurfaceCard({
  as: Tag = "div",
  className = "",
  style,
  role,
  pinned,
  pinCount,
  tone = "note",
  torn = false,
  children,
}: {
  as?: "div" | "article" | "section";
  className?: string;
  style?: CSSProperties;
  role?: string;
  /**
   * Kennung der Karte. Ist sie gesetzt, wird die Karte angeheftet: eine
   * oder zwei Nadeln an der Oberkante, eine leichte Drehung und vier
   * ungleiche Eckenradien – alles aus der Kennung berechnet, damit
   * dieselbe Karte nach einem Reload gleich aussieht.
   *
   * Bewusst nicht überall: Dialoge und Formulare bleiben gerade. Ein
   * schiefes Eingabefeld ist kein Charme, sondern eine Zumutung.
   */
  pinned?: string;
  /** Erzwingt die Anzahl Nadeln – sonst entscheidet die Kennung. */
  pinCount?: 1 | 2;
  tone?: SheetTone;
  /** Untere Kante abgerissen statt geschnitten. */
  torn?: boolean;
  children: ReactNode;
}) {
  const toneClass = TONE_CLASS[tone];
  const tornClass = torn ? "sheet-torn" : "";

  /**
   * Die Rissebenen liegen hinter dem Inhalt (z-index −1/−2) und tragen
   * die Form; die Karte selbst ist dann durchsichtig. Zwei Ebenen, weil
   * clip-path auch den Schlagschatten abschneiden würde.
   */
  const tornLayers = torn ? (
    <>
      <span aria-hidden className="sheet-layer sheet-shadow" />
      <span aria-hidden className="sheet-layer sheet-face" />
    </>
  ) : null;

  if (!pinned) {
    return (
      <Tag
        className={`${SURFACE_CLASSES} ${toneClass} ${tornClass} ${className}`}
        style={style}
        role={role}
      >
        {tornLayers}
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={`${SURFACE_CLASSES} ${toneClass} ${tornClass} relative ${className}`}
      // Die Drehung endet nicht auf transform:none, sie bleibt stehen –
      // fixierte Kindelemente bekämen dadurch diese Karte als Bezugsrahmen.
      // Deshalb steht in angehefteten Karten kein Dialog.
      style={{
        ...style,
        borderRadius: cornerRadiusFor(pinned),
        transform: `rotate(${tiltFor(pinned)}deg)`,
      }}
      role={role}
    >
      {tornLayers}
      {pinsFor(pinned, pinCount).map((placement) => (
        <PinDecoration key={placement.key} placement={placement} />
      ))}
      {children}
    </Tag>
  );
}

/**
 * Hinweisfläche für leere Listen – identisches Aussehen an allen Stellen.
 *
 * Mit illustration steht eine Sketch-Zeichnung darüber. Sie ist Schmuck
 * und trägt keine Information, die nicht auch im Text steht; deshalb
 * bleibt sie für Screenreader unsichtbar (die Zeichnungen setzen selbst
 * aria-hidden, solange kein title übergeben wird).
 */
export function EmptyState({
  children,
  illustration,
  seed = "leer",
}: {
  children: ReactNode;
  illustration?: ReactNode;
  /** Bestimmt Nadel, Drehung und Ecken – je Bildschirm ein eigener Wert. */
  seed?: string;
}) {
  if (!illustration) {
    return (
      <SurfaceCard
        pinned={seed}
        tone="postit"
        torn
        className="p-6 text-sm text-paper-700 dark:text-paper-300"
      >
        {children}
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard
      pinned={seed}
      tone="postit"
      torn
      className="flex flex-col items-center gap-4 p-8 pb-10 text-center text-sm text-paper-700 dark:text-paper-300"
    >
      <span className="text-accent opacity-80">{illustration}</span>
      <span className="handwritten max-w-xs text-base leading-snug">{children}</span>
    </SurfaceCard>
  );
}
