/**
 * Verzögerung für das gestaffelte Einblenden von Listen.
 * Nach `cap` Elementen bleibt der Versatz stehen, damit lange Listen
 * nicht sekundenlang nachladen.
 */
export function staggerDelay(index: number, step = 60, cap = 10): string {
  return `${Math.min(index, cap) * step}ms`;
}
