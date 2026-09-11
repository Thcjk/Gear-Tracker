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
 * Mindestens so lange bleiben Szene und Schriftzug stehen – auch wenn die
 * App längst bereit ist. Ist sie es nach dieser Zeit noch nicht, wird nicht
 * künstlich verlängert: der Splash geht, sobald der Store gelesen ist.
 */
export const SPLASH_MIN_VISIBLE_MS = 3000;
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

/**
 * Dieselbe Körnung wie am body. Sie steht hier ein zweites Mal, weil der
 * Splash vor dem Stylesheet steht – ohne sie würde beim Ausblenden eine
 * glatte Fläche in eine körnige übergehen, und genau das sieht man.
 */
const CORK_NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23c)' opacity='0.5'/%3E%3C/svg%3E";

/**
 * Der Splash folgt dem Theme. Die Klasse .dark setzt das Anti-Flash-Skript
 * im <body> noch vor dem ersten Paint, also greifen beide Varianten
 * sofort – ohne sie stünde in einem der Modi heller Text auf hellem Grund.
 */
const LIGHT_BG = "#B8895F"; /* Cork – das Brett */
const LIGHT_CARD = "#F3ECDC"; /* Paper */
const LIGHT_INK = "#263241"; /* Ink */
const LIGHT_LINE = "#A8401F"; /* Rust 600 */
const DARK_BG = "#3A2E22"; /* Cork Night */
const DARK_CARD = "#1B2430"; /* Ink Night */
const DARK_INK = "#F3ECDC"; /* Paper */
const DARK_LINE = "#E3A73E"; /* Mustard */

export const splashCriticalCss = `
.splash{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;
align-items:center;justify-content:center;background-color:${LIGHT_BG};
background-image:url("${CORK_NOISE}");background-blend-mode:overlay;
color:${LIGHT_LINE};pointer-events:none;
animation:splash-out ${SPLASH_FADE_MS}ms ease-out ${SPLASH_MIN_VISIBLE_MS}ms both}
@keyframes splash-out{
from{opacity:1;visibility:visible}
to{opacity:0;visibility:hidden}}
html.dark .splash{background-color:${DARK_BG};background-blend-mode:soft-light;\ncolor:${DARK_LINE}}

/* Das aufgesteckte Blatt. Leicht schief, wie jede andere Karte auch. */
.splash__stage{position:relative;display:flex;flex-direction:column;
align-items:center;padding:1.75rem 2.5rem 1.5rem;border-radius:1.5rem;
background:${LIGHT_CARD};box-shadow:2px 5px 14px rgba(38,50,65,.3);
transform:rotate(-1.25deg);
animation:splash-mark 720ms ${EASE_OUT} both}
html.dark .splash__stage{background:${DARK_CARD};
box-shadow:2px 5px 14px rgba(0,0,0,.55)}
@keyframes splash-mark{
from{opacity:0;transform:rotate(-1.25deg) scale(.9)}
to{opacity:1;transform:rotate(-1.25deg) scale(1)}}

/* Der Reissnagel oben in der Mitte des Blattes */
.splash__pin{position:absolute;top:-.6rem;left:50%;margin-left:-.55rem;
width:1.1rem;height:1.1rem;border-radius:50% 50% 45% 45%;
background:#C1502E;box-shadow:0 2px 3px rgba(38,50,65,.5)}

.splash__mark{display:block;width:11rem;height:11.5rem}
.splash__mark svg{width:100%;height:100%}

.splash__title{margin:.75rem 0 0;font-size:1.75rem;line-height:1.15;
font-weight:800;letter-spacing:-.02em;color:${LIGHT_INK}}
html.dark .splash__title{color:${DARK_INK}}

.splash__compass{position:absolute;right:8%;top:12%;width:5rem;height:5rem;
opacity:.4;animation:splash-fade 900ms ease-out 260ms both}

/* Unten links, oberhalb der Home-Anzeige des Geräts */
/* Die Tagline steht auf einem eigenen Zettel. Paper auf Kork erreicht
   nur 2.6:1 – als freier Text auf dem Brett wäre sie schlecht lesbar. */
.splash__tagline{position:absolute;z-index:1;left:1.25rem;
bottom:calc(2rem + env(safe-area-inset-bottom));margin:0;
padding:.15rem .8rem .3rem;border-radius:.7rem;
background:${LIGHT_CARD};color:${LIGHT_INK};
font-size:1.15rem;transform:rotate(-1.5deg);
box-shadow:1px 3px 8px rgba(38,50,65,.28);
animation:splash-fade 720ms ease-out 320ms both}
html.dark .splash__tagline{background:${DARK_CARD};color:${DARK_INK};
box-shadow:1px 3px 8px rgba(0,0,0,.5)}

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
html[data-splash="leaving"] .splash__stage{animation:splash-stage-out ${SPLASH_FADE_MS}ms ease-in forwards}
@keyframes splash-stage-out{to{opacity:0;transform:rotate(-1.25deg) scale(1.04)}}
html[data-splash="leaving"] .splash-reveal{animation:splash-reveal ${SPLASH_REVEAL_MS}ms ease-out both}
html[data-splash="leaving"] .splash-fade{animation:splash-fade ${SPLASH_REVEAL_MS}ms ease-out both}

html[data-splash="done"] .splash-reveal,
html[data-splash="done"] .splash-fade{animation:none;opacity:1}

/* Reduzierte Bewegung: der Splash bleibt (er ist Teil des Starts), aber
   ohne Skalieren. Reine Deckkraft-Übergänge gelten als unkritisch. */
@media (prefers-reduced-motion:reduce){
.splash__stage{animation-name:splash-fade}
html[data-splash="leaving"] .splash__stage{animation:splash-fade-out ${SPLASH_FADE_MS}ms ease-in forwards}
@keyframes splash-fade-out{to{opacity:0}}
.splash-reveal,html[data-splash="leaving"] .splash-reveal{animation-name:splash-fade}}
`;

/**
 * Läuft als Inline-Skript im <head>, also vor dem ersten Paint und ohne
 * eigenen Request. Es meldet nur "JavaScript lebt" und stellt die Notbremse.
 */
export const splashBootScript = `(function(){var d=document.documentElement;
d.setAttribute("data-splash","hold");
setTimeout(function(){if(d.getAttribute("data-splash")==="hold"){d.setAttribute("data-splash","leaving");}},${SPLASH_MAX_WAIT_MS});})();`;
