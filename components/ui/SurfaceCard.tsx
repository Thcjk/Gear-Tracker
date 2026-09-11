import type { CSSProperties, ReactNode } from "react";
import { Pin } from "@/components/ui/Pin";
import { tiltFor } from "@/lib/pinning";

/**
 * Die Kartenfläche der App: ein Blatt Papier, das auf dem Kork-Brett
 * liegt. Der versetzte Schlagschatten lässt es leicht abstehen.
 * Padding und Zusätze kommen über className.
 */
export const SURFACE_CLASSES =
  "rounded-card bg-paper-100 shadow-neu dark:bg-paper-900";

export function SurfaceCard({
  as: Tag = "div",
  className = "",
  style,
  role,
  pinned,
  pinCorner = "right",
  children,
}: {
  as?: "div" | "article" | "section";
  className?: string;
  style?: CSSProperties;
  role?: string;
  /**
   * Kennung der Karte. Ist sie gesetzt, wird die Karte angeheftet: ein
   * Reissnagel an der Ecke und eine leichte, aus der Kennung berechnete
   * Drehung.
   *
   * Bewusst nicht überall: Dialoge und Formulare bleiben gerade. Ein
   * schiefes Eingabefeld ist kein Charme, sondern eine Zumutung.
   */
  pinned?: string;
  pinCorner?: "left" | "right" | "both";
  children: ReactNode;
}) {
  if (!pinned) {
    return (
      <Tag className={`${SURFACE_CLASSES} ${className}`} style={style} role={role}>
        {children}
      </Tag>
    );
  }

  const tilt = tiltFor(pinned);
  return (
    <Tag
      className={`${SURFACE_CLASSES} relative ${className}`}
      // Die Drehung endet nicht auf transform:none, sie bleibt stehen –
      // fixierte Kindelemente bekämen dadurch diese Karte als Bezugsrahmen.
      // Deshalb steht in angehefteten Karten kein Dialog.
      style={{ ...style, transform: `rotate(${tilt}deg)` }}
      role={role}
    >
      {(pinCorner === "left" || pinCorner === "both") && (
        <Pin seed={pinned} className="-top-2.5 left-4" />
      )}
      {(pinCorner === "right" || pinCorner === "both") && (
        <Pin seed={`${pinned}:r`} className="-top-2.5 right-4" />
      )}
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
}: {
  children: ReactNode;
  illustration?: ReactNode;
}) {
  if (!illustration) {
    return (
      <SurfaceCard className="p-6 text-sm text-paper-700 dark:text-paper-300">
        {children}
      </SurfaceCard>
    );
  }
  return (
    <SurfaceCard className="flex flex-col items-center gap-4 p-8 text-center text-sm text-paper-700 dark:text-paper-300">
      <span className="text-accent opacity-80">{illustration}</span>
      <span className="max-w-xs">{children}</span>
    </SurfaceCard>
  );
}
