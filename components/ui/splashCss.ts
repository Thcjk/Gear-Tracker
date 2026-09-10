/**
 * Gestaltung und Timing des Start-Splashs.
 *
 * Bewusst kein Tailwind und kein "use client": die Regeln werden vom
 * Server-Layout als <style> in den <head> geschrieben. Das Tailwind-
 * Stylesheet ist ein eigener Request – bis es da ist, wäre der Splash sonst
 * unformatiert und man sähe auf dem Handy einen leeren Bildschirm statt des
 * Logos. Diese Regeln kommen mit dem HTML und greifen ab dem ersten Paint.
 */

/**
 * Mindestzeit, die der Splash sichtbar bleibt – gemessen **ab
 * Navigationsstart**, nicht ab Hydration. Dauert das Laden länger, ist die
 * Zeit längst abgelaufen und der Splash verschwindet, sobald die App steht.
 */
export const SPLASH_MIN_VISIBLE_MS = 700;
export const SPLASH_FADE_MS = 280;

/**
 * Logo und Schriftzug gehen vor dem Hintergrund weg. Blenden alle gleich
 * schnell aus, schwebt das Logo für einen Moment über der schon sichtbaren
 * App – das sieht nach Fehler aus statt nach Übergang.
 */
const MARK_FADE_MS = 140;

export const splashCriticalCss = `
.splash{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;
align-items:center;justify-content:center;background:#16392b;
opacity:1;transition:opacity ${SPLASH_FADE_MS}ms ease-out}
.splash[data-state="fading"]{opacity:0}
.splash__mark{width:6rem;height:6rem;
filter:drop-shadow(0 12px 30px rgba(0,0,0,.45));
animation:splash-in 520ms cubic-bezier(.22,1,.36,1) both}
.splash__label{margin:1.25rem 0 0;font-size:.875rem;font-weight:600;
letter-spacing:.25em;text-transform:uppercase;color:#b8dcc6;
animation:splash-in 520ms cubic-bezier(.22,1,.36,1) both;animation-delay:120ms}
.splash[data-state="fading"] .splash__mark,
.splash[data-state="fading"] .splash__label{
animation:none;opacity:0;transition:opacity ${MARK_FADE_MS}ms ease-out}
@keyframes splash-in{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){
.splash{transition:none}
.splash__mark,.splash__label{animation:none}
.splash[data-state="fading"] .splash__mark,
.splash[data-state="fading"] .splash__label{transition:none}}
`;
