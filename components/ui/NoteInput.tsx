"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

/**
 * Eingabefelder als Karteikarten.
 *
 * Die Beschriftung steht in Handschrift oben auf der Karte, der Wert
 * darunter in der Grotesk – so, wie man eine Karteikarte beschriftet: das
 * Etikett von Hand, der Inhalt ordentlich. Die obere rechte Ecke ist
 * umgeknickt; darunter liegt die Rückseite des Papiers.
 *
 * Der Knick entsteht mit clip-path. Das schneidet auch Schatten ab –
 * hier kein Problem, weil das Feld einen eingelassenen Schatten trägt
 * (der bleibt innerhalb der Form) und keinen Schlagschatten. Ein
 * Eingabefeld steht nicht ab, es liegt in der Karte.
 *
 * Die Karte ist ein <label>: der Klick irgendwo darauf landet im Feld,
 * ohne dass irgendwo eine ID gepflegt werden muss.
 */
function Fold() {
  return <span aria-hidden className="note-card__fold" />;
}

export function NoteInput({
  label,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  /** Steht klein unter dem Feld – für Einheiten und Beispiele. */
  hint?: ReactNode;
}) {
  return (
    <label className={`note-card ${className}`}>
      <span className="note-card__label handwritten">{label}</span>
      <input className="note-card__value" {...props} />
      {hint && <span className="note-card__hint">{hint}</span>}
      <Fold />
    </label>
  );
}

export function NoteTextarea({
  label,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: ReactNode }) {
  return (
    <label className={`note-card ${className}`}>
      <span className="note-card__label handwritten">{label}</span>
      <textarea className="note-card__value resize-none" {...props} />
      <Fold />
    </label>
  );
}
