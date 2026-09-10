/**
 * Gestaltung und Timing des Start-Splashs.
 *
 * Bewusst kein Tailwind und kein "use client": die Regeln werden vom
 * Server-Layout als <style> in den <head> geschrieben. Das Tailwind-
 * Stylesheet ist ein eigener Request – bis es da ist, wäre der Splash sonst
 * unformatiert und man sähe auf dem Handy einen leeren Bildschirm statt des
 * Logos. Diese Regeln kommen mit dem HTML und greifen ab dem ersten Paint.
 *
 * Gesteuert wird über data-splash am <html>-Element. Drei Zustände, und
 * jeder deckt einen Ausfall des jeweils vorherigen ab:
 *
 *   (kein Attribut) – JavaScript ist aus oder das Inline-Skript kam nicht
 *     dazu. Reine CSS-Animation: Splash steht SPLASH_MIN_VISIBLE_MS und
 *     löst sich dann selbst auf. Ohne diesen Pfad bliebe er ewig stehen.
 *   "hold" – das Inline-Skript im <head> lebt, die App lädt noch. Der
 *     Splash wartet, bis der Store gelesen ist.
 *   "leaving" / "done" – der Übergang läuft bzw. ist vorbei.
 *
 * Die Ausblend-Animation endet auf visibility:hidden, damit der Splash auch
 * dann keine Klicks mehr abfängt, wenn React nie ankommt.
 */

/**
 * Mindestens so lange bleiben Logo und Schriftzug stehen – auch wenn die
 * App längst bereit ist. Ist sie es nach dieser Zeit noch nicht, wird nicht
 * künstlich verlängert: der Splash geht, sobald der Store gelesen ist.
 */
export const SPLASH_MIN_VISIBLE_MS = 5000;
/** Weiches Überblenden von Splash zu App. */
export const SPLASH_FADE_MS = 420;
/** Einblenden des App-Inhalts, überlappt bewusst mit dem Ausblenden. */
export const SPLASH_REVEAL_MS = 560;
/**
 * Notbremse im Inline-Skript: bleibt das Haupt-Bundle aus (Netzfehler,
 * altes Gerät), löst sich der Splash trotzdem auf, statt die App hinter
 * einem grünen Bildschirm zu begraben.
 */
export const SPLASH_MAX_WAIT_MS = 12_000;
/** Zeit vom Start des Ausblendens bis der Knoten entfernt werden darf. */
export const SPLASH_TOTAL_MS = SPLASH_MIN_VISIBLE_MS + SPLASH_FADE_MS;

const EASE_OUT = "cubic-bezier(.22,1,.36,1)";

/** Black Kite – identisch mit Manifest und Statusleiste. */
const BASE = "#0A171D";

export const splashCriticalCss = `
.splash{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;
align-items:center;justify-content:center;background:${BASE};pointer-events:none;
animation:splash-out ${SPLASH_FADE_MS}ms ease-out ${SPLASH_MIN_VISIBLE_MS}ms both}
@keyframes splash-out{
from{opacity:1;visibility:visible}
to{opacity:0;visibility:hidden}}

/* Die Farbfeld-Ebene. Ihre Farben, Grössen und Positionen stehen als
   inline style am Element – nur Lage, Rundung und Unschärfe kommen sonst
   aus Tailwind, und das Stylesheet ist hier noch nicht da. */
.splash__field{position:absolute;inset:0;overflow:hidden}
.splash__field>.gradient-blob{position:absolute;border-radius:9999px;
filter:blur(64px)}

.splash__stage{position:relative;z-index:1;display:flex;
flex-direction:column;align-items:center}

.splash__mark{width:10rem;height:10rem;
filter:drop-shadow(0 14px 34px rgba(0,0,0,.5));
animation:splash-mark 720ms ${EASE_OUT} both}
@keyframes splash-mark{
from{opacity:0;transform:scale(.84)}
to{opacity:1;transform:scale(1)}}

.splash__title{margin:1.5rem 0 0;font-size:1.875rem;line-height:1.15;
font-weight:700;letter-spacing:-.02em;color:#FFF6E9;
animation:splash-mark 720ms ${EASE_OUT} 180ms both}

/* Unten links, oberhalb der Home-Anzeige des Geräts */
.splash__tagline{position:absolute;z-index:1;left:1.5rem;
bottom:calc(2rem + env(safe-area-inset-bottom));margin:0;
font-size:.875rem;letter-spacing:.01em;color:#FFBD76;
animation:splash-mark 720ms ${EASE_OUT} 320ms both}

/* Inhalt und Navigation kommen hinter dem Splash hervor. Der Schlusswert
   ist transform:none – ein bleibendes transform würde für fixierte
   Kindelemente (Dialoge) einen neuen Bezugsrahmen aufspannen. */
.splash-reveal{animation:splash-reveal ${SPLASH_REVEAL_MS}ms ease-out ${SPLASH_MIN_VISIBLE_MS}ms both}
@keyframes splash-reveal{
from{opacity:0;transform:scale(.985)}
to{opacity:1;transform:none}}
.splash-fade{animation:splash-fade ${SPLASH_REVEAL_MS}ms ease-out ${SPLASH_MIN_VISIBLE_MS}ms both}
@keyframes splash-fade{from{opacity:0}to{opacity:1}}

/* JavaScript hat übernommen: warten, bis der Store gelesen ist. */
html[data-splash="hold"] .splash{animation:none;opacity:1;visibility:visible}
html[data-splash="hold"] .splash-reveal,
html[data-splash="hold"] .splash-fade{animation:none;opacity:0}

html[data-splash="leaving"] .splash{animation:splash-out ${SPLASH_FADE_MS}ms ease-out forwards}
html[data-splash="leaving"] .splash__mark,
html[data-splash="leaving"] .splash__title,
html[data-splash="leaving"] .splash__tagline{animation:splash-mark-out ${SPLASH_FADE_MS}ms ease-in forwards}
@keyframes splash-mark-out{to{opacity:0;transform:scale(1.05)}}
html[data-splash="leaving"] .splash-reveal{animation:splash-reveal ${SPLASH_REVEAL_MS}ms ease-out both}
html[data-splash="leaving"] .splash-fade{animation:splash-fade ${SPLASH_REVEAL_MS}ms ease-out both}

html[data-splash="done"] .splash-reveal,
html[data-splash="done"] .splash-fade{animation:none;opacity:1}

/* Reduzierte Bewegung: der Splash bleibt (er ist Teil des Starts), aber
   ohne Skalieren. Reine Deckkraft-Übergänge gelten als unkritisch. */
@media (prefers-reduced-motion:reduce){
.splash__mark,.splash__title,.splash__tagline{animation-name:splash-fade}
html[data-splash="leaving"] .splash__mark,
html[data-splash="leaving"] .splash__title,
html[data-splash="leaving"] .splash__tagline{animation:splash-fade-out ${SPLASH_FADE_MS}ms ease-in forwards}
@keyframes splash-fade-out{to{opacity:0}}
.splash-reveal,html[data-splash="leaving"] .splash-reveal{animation-name:splash-fade}
.splash__field>.gradient-blob{filter:none}}
`;

/**
 * Läuft als Inline-Skript im <head>, also vor dem ersten Paint und ohne
 * eigenen Request. Es meldet nur "JavaScript lebt" und stellt die Notbremse.
 */
export const splashBootScript = `(function(){var d=document.documentElement;
d.setAttribute("data-splash","hold");
setTimeout(function(){if(d.getAttribute("data-splash")==="hold"){d.setAttribute("data-splash","leaving");}},${SPLASH_MAX_WAIT_MS});})();`;
