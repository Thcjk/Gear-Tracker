/**
 * Gestaltung und Timing des Start-Splashs.
 *
 * Bewusst kein Tailwind und kein "use client": die Regeln werden vom
 * Server-Layout als <style> in den <head> geschrieben. Das Tailwind-
 * Stylesheet ist ein eigener Request – bis es da ist, wäre der Splash sonst
 * unformatiert und man sähe auf dem Handy einen leeren Bildschirm statt des
 * Logos. Diese Regeln kommen mit dem HTML und greifen ab dem ersten Paint.
 *
 * Auch das Ausblenden läuft über CSS, nicht über JavaScript. Hinge es an
 * der Hydration, bliebe der Splash bei langsamer Verbindung sekundenlang
 * stehen – und ohne geladenes JavaScript für immer, samt abgefangener
 * Klicks. Die Animation endet deshalb auf visibility:hidden. React räumt
 * den Knoten anschliessend nur noch weg.
 */

/** Zeit, die Logo und Schriftzug voll sichtbar bleiben. */
export const SPLASH_MIN_VISIBLE_MS = 700;
export const SPLASH_FADE_MS = 280;
/** Gesamtlaufzeit der Animation – React entfernt den Knoten danach. */
export const SPLASH_TOTAL_MS = SPLASH_MIN_VISIBLE_MS + SPLASH_FADE_MS;

/** Anteil der Gesamtlaufzeit, ab dem ausgeblendet wird. */
const FADE_START = (SPLASH_MIN_VISIBLE_MS / SPLASH_TOTAL_MS) * 100;
/** Ende der Einblend-Animation von Logo bzw. Schriftzug (520 bzw. 120+520 ms). */
const MARK_IN_END = (520 / SPLASH_TOTAL_MS) * 100;
const LABEL_IN_START = (120 / SPLASH_TOTAL_MS) * 100;
const LABEL_IN_END = (640 / SPLASH_TOTAL_MS) * 100;
/**
 * Logo und Schriftzug sind vor dem Hintergrund weg. Blenden alle gleich
 * schnell aus, schwebt das Logo für einen Moment über der schon sichtbaren
 * App – das sieht nach Fehler aus statt nach Übergang.
 */
const CONTENT_OUT_END = FADE_START + (100 - FADE_START) * 0.5;

const EASE_IN = "cubic-bezier(.22,1,.36,1)";

export const splashCriticalCss = `
.splash{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;
align-items:center;justify-content:center;background:#16392b;pointer-events:none;
animation:splash-out ${SPLASH_TOTAL_MS}ms ease-out forwards}
@keyframes splash-out{
0%,${FADE_START.toFixed(2)}%{opacity:1;visibility:visible}
100%{opacity:0;visibility:hidden}}
.splash__mark{width:6rem;height:6rem;
filter:drop-shadow(0 12px 30px rgba(0,0,0,.45));
animation:splash-mark ${SPLASH_TOTAL_MS}ms both}
@keyframes splash-mark{
0%{opacity:0;transform:scale(.86);animation-timing-function:${EASE_IN}}
${MARK_IN_END.toFixed(2)}%,${FADE_START.toFixed(2)}%{opacity:1;transform:scale(1)}
${CONTENT_OUT_END.toFixed(2)}%,100%{opacity:0}}
.splash__label{margin:1.25rem 0 0;font-size:.875rem;font-weight:600;
letter-spacing:.25em;text-transform:uppercase;color:#b8dcc6;
animation:splash-label ${SPLASH_TOTAL_MS}ms both}
@keyframes splash-label{
0%,${LABEL_IN_START.toFixed(2)}%{opacity:0;transform:scale(.86);animation-timing-function:${EASE_IN}}
${LABEL_IN_END.toFixed(2)}%,${FADE_START.toFixed(2)}%{opacity:1;transform:scale(1)}
${CONTENT_OUT_END.toFixed(2)}%,100%{opacity:0}}
@media (prefers-reduced-motion:reduce){
.splash{animation:none;opacity:0;visibility:hidden}
.splash__mark,.splash__label{animation:none}}
`;
