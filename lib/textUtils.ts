/**
 * Kürzen auf ganze Wörter.
 *
 * CSS-Ellipsen schneiden auf Zeichenebene: aus "Zpacks Duplex Zelt" wird
 * "Zpacks Dup…". Das sieht nach kaputtem Text aus und sagt weniger als
 * die ersten paar ganzen Wörter. Deshalb wird dort, wo der Platz wirklich
 * knapp ist, auf Wortgrenzen gekürzt.
 *
 * Nur dort. Wo Raum ist – Formulare, Detailansichten – steht der volle
 * Name, und der Umbruch erledigt den Rest.
 */

/**
 * Gibt die ersten maxWords Wörter zurück, gefolgt von einem Auslassungs-
 * zeichen. Ist der Text kürzer, kommt er unverändert zurück.
 */
export function truncateToWords(text: string, maxWords: number = 4): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

/** true, wenn truncateToWords etwas weglassen würde. */
export function isTruncated(text: string, maxWords: number = 4): boolean {
  return text.trim().split(/\s+/).length > maxWords;
}
