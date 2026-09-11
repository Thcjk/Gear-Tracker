/**
 * Eine Datei zum Herunterladen anbieten.
 *
 * Stand vorher dreimal fast gleich im Projekt – in den Einstellungen, in
 * der Backup-Sektion und im Teilen-Export – und überall mit demselben
 * Fehler: revokeObjectURL lief unmittelbar nach dem Klick. Der Browser
 * startet den Download aber asynchron; wird die URL im selben Tick wieder
 * freigegeben, bricht er in Safari und Firefox gelegentlich ab.
 *
 * Die Freigabe passiert deshalb einen Tick später. Ganz weglassen wäre
 * keine Lösung: jede nicht freigegebene Blob-URL hält ihre Daten bis zum
 * Neuladen im Speicher.
 */
export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  // Im DOM, weil Firefox einen Klick auf ein loses Element ignoriert.
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Dasselbe für Text, den es noch nicht als Blob gibt. */
export function downloadText(
  fileName: string,
  text: string,
  type = "application/json",
): void {
  downloadBlob(fileName, new Blob([text], { type }));
}
