/**
 * Verzögerung für das gestaffelte Einblenden von Listen.
 * Nach `cap` Elementen bleibt der Versatz stehen, damit lange Listen
 * nicht sekundenlang nachladen.
 *
 * Der Versatz ist bewusst knapp: bei 60 ms über zehn Karten stand die
 * letzte erst nach einer guten Sekunde, und beim Aufklappen einer
 * Kategorie wirkte das, als würde die Library noch laden.
 */
export function staggerDelay(index: number, step = 30, cap = 5): string {
  return `${Math.min(index, cap) * step}ms`;
}
