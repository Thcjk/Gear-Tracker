/**
 * Das Emblem des Startbildschirms: konzentrische Höhenlinien mit einem
 * Berg-Gipfel in der Mitte.
 *
 * Bewusst Inline-SVG mit ausgeschriebenen fill- und stroke-Attributen und
 * ohne eine einzige Tailwind-Klasse. Der Splash steht vor dem ersten
 * Stylesheet – was hier über Klassen liefe, wäre in der ersten Sekunde
 * unsichtbar. Präsentationsattribute wirken dagegen sofort.
 *
 * Aus demselben Grund wird nichts nachgeladen: kein Bild, kein Icon-Font,
 * kein Pfad, der am basePath scheitern könnte.
 */
export function SplashEmblem() {
  return (
    <svg viewBox="0 0 200 200" className="splash__mark" aria-hidden>
      {/* Höhenlinien: nach aussen blasser, das gibt Tiefe */}
      <circle cx="100" cy="100" r="94" fill="none" stroke="#A0C9CB" strokeWidth="1.25" opacity="0.26" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#A0C9CB" strokeWidth="1.5" opacity="0.42" />
      <circle cx="100" cy="100" r="66" fill="none" stroke="#A0C9CB" strokeWidth="1.5" opacity="0.62" />
      <circle cx="100" cy="100" r="52" fill="none" stroke="#F5F4ED" strokeWidth="1.5" opacity="0.85" />

      {/* Massiv aus zwei Gipfeln, der höhere rechts */}
      <path d="M62 128 L90 78 L106 104 L120 68 L146 128 Z" fill="#FF6037" />
      {/* Sonnenseite des Hauptgipfels – ohne sie wirkt die Fläche flach */}
      <path d="M120 68 L146 128 L129 128 Z" fill="#FF8A66" />
      {/* Firn auf dem Hauptgipfel */}
      <path d="M120 68 L128 86 L124 83 L119 89 L114 81 Z" fill="#F5F4ED" />

      {/* Grundlinie, greift die Höhenlinien wieder auf */}
      <rect x="62" y="128" width="84" height="3.5" rx="1.75" fill="#F5F4ED" opacity="0.9" />
    </svg>
  );
}
