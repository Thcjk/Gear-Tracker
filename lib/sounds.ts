/**
 * Kleine Geräusche, aus dem Browser erzeugt statt aus Dateien geladen.
 *
 * Zwei Gründe: eine mp3 pro Ton wären zwei zusätzliche Requests für
 * zusammen ein paar hundert Millisekunden Ton, und sie würden genau dann
 * fehlen, wenn die App offline auf dem Berg läuft. Die Web Audio API
 * rechnet beides in ein paar Zeilen aus.
 *
 * Standardmässig aus. Eine App, die beim ersten Antippen im Zug oder im
 * Laden Töne von sich gibt, ohne dass jemand danach gefragt hat, ist
 * keine gute App – der Schalter dafür steht in den Einstellungen.
 */

export const SOUND_KEY = "gear-tracker-sound";

type Ctor = typeof AudioContext;

/**
 * Der Kontext wird erst beim ersten Ton angelegt, nicht beim Laden des
 * Moduls: vor der ersten Geste des Benutzers startet ihn der Browser
 * ohnehin nicht, und ein schlafender Kontext kostet trotzdem Strom.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctx: Ctor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    ctx = new Ctx();
  } catch {
    // Safari im Lockdown-Modus und manche eingebettete Browser werfen hier.
    return null;
  }
  return ctx;
}

/* ------------------------------------------------------------------ *
 * Der Schalter
 *
 * Er liegt bewusst NICHT in den App-Daten: eine Tonvorliebe gehört zum
 * Gerät, nicht zur Ausrüstung. In den Daten würde sie in jedem Backup
 * mitreisen und beim Einspielen auf einem anderen Gerät dessen
 * Einstellung überschreiben.
 * ------------------------------------------------------------------ */

let enabled: boolean | null = null;

export function soundEnabled(): boolean {
  if (enabled !== null) return enabled;
  if (typeof window === "undefined") return false;
  try {
    enabled = window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    // Privater Modus ohne Speicher: dann eben stumm.
    enabled = false;
  }
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  try {
    window.localStorage.setItem(SOUND_KEY, next ? "on" : "off");
  } catch {
    /* Ohne Speicher gilt die Einstellung nur für diese Sitzung. */
  }
}

/* ------------------------------------------------------------------ *
 * Die Töne
 * ------------------------------------------------------------------ */

/**
 * Ein Ton mit weicher Hüllkurve.
 *
 * Ohne An- und Abstieg klickt jeder Ton am Anfang und am Ende – das ist
 * der Sprung von Null auf Vollausschlag, den der Lautsprecher als Knacken
 * wiedergibt. Der Abfall läuft exponentiell und endet bei einem sehr
 * kleinen Wert statt bei Null, weil exponentialRampToValueAtTime mit
 * Null nicht rechnen kann.
 */
function blip(
  context: AudioContext,
  {
    from,
    to,
    at,
    length,
    peak,
    type = "triangle",
  }: {
    from: number;
    to?: number;
    at: number;
    length: number;
    peak: number;
    type?: OscillatorType;
  },
) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(to, at + length);
  }
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(context.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

function play(build: (context: AudioContext, now: number) => void) {
  if (!soundEnabled()) return;
  const context = audio();
  if (!context) return;
  // Nach dem Zurückkehren aus dem Hintergrund steht der Kontext still.
  if (context.state === "suspended") void context.resume();
  try {
    build(context, context.currentTime);
  } catch {
    /* Ein fehlgeschlagener Ton darf nie die Aktion daneben mitreissen. */
  }
}

/**
 * Abhaken: ein kurzes, trockenes Klacken – der Stempel, der aufs Papier
 * kommt. Zwei Anteile, ein tiefer Aufschlag und ein hoher Anschlag, sonst
 * klingt es nach Piepton statt nach Holz.
 */
export function playCheckSound() {
  play((context, now) => {
    blip(context, {
      from: 320,
      to: 180,
      at: now,
      length: 0.07,
      peak: 0.1,
      type: "triangle",
    });
    blip(context, {
      from: 1400,
      to: 900,
      at: now + 0.005,
      length: 0.045,
      peak: 0.05,
      type: "square",
    });
  });
}

/**
 * Auszeichnung: drei Töne aufwärts. Kurz genug, dass es nicht nach
 * Spielautomat klingt.
 */
export function playBadgeSound() {
  play((context, now) => {
    [
      [1046.5, 0],
      [1318.5, 0.08],
      [1568.0, 0.16],
    ].forEach(([freq, offset]) => {
      blip(context, {
        from: freq,
        at: now + offset,
        length: 0.22,
        peak: 0.07,
        type: "triangle",
      });
    });
  });
}
