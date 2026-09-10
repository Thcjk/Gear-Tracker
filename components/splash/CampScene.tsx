/**
 * Lagerplatz im Wald, als lockere Bleistiftskizze.
 *
 * Der handgezeichnete Eindruck entsteht nicht durch eine Bibliothek,
 * sondern durch die Pfade selbst: keine Linie ist ganz gerade, jede trägt
 * ein bis zwei Kurvenpunkte mit minimalem Versatz. Ein perfekter Vektor
 * sieht nach Piktogramm aus, das hier soll nach Notizbuch aussehen.
 *
 * Farbe kommt über currentColor und nicht über eine CSS-Variable: die
 * Szene steht auch im Splash, und dort ist noch kein Stylesheet geladen –
 * var(--accent) wäre in der ersten Sekunde schlicht ungültig.
 */
export function CampScene({
  strokeColor = "currentColor",
  className = "h-40 w-56",
}: {
  strokeColor?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 300 200"
      className={className}
      fill="none"
      stroke={strokeColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Hinterer Baum, kleiner und blasser – gibt der Szene Tiefe */}
      <g opacity="0.45" strokeWidth="1">
        <path d="M206 62 Q200 79 197 86 Q201 84 204 85 Q198 101 194 108 Q199 106 203 107 L190 132 L222 132 L209 107 Q213 106 218 108 Q214 101 208 85 Q211 84 215 86 Q211 78 206 62 Z" />
        <path d="M206 132 Q205 141 206 150" />
      </g>

      {/* Vorderer Nadelbaum */}
      <g strokeWidth="1.4">
        <path d="M150 20 Q143 44 139 57 Q144 55 148 57 Q140 78 133 93 Q140 90 146 92 Q136 113 126 134 L174 134 Q164 113 154 92 Q160 90 167 93 Q160 78 152 57 Q156 55 161 57 Q157 44 150 20 Z" />
        <path d="M150 134 Q149 146 150 161" strokeWidth="1.6" />
      </g>

      {/* Zelt: Aussenkante, Firstlinie, Eingangsklappe, zwei Abspannungen */}
      <g strokeWidth="1.5">
        <path d="M50 164 Q75 133 98 100 Q122 133 147 164" />
      </g>
      <g strokeWidth="1" opacity="0.75">
        <path d="M98 100 Q99 133 99 163" />
        <path d="M72 164 Q86 136 98 112 Q111 137 124 164" />
      </g>
      <g strokeWidth="0.9" opacity="0.55">
        <path d="M98 101 Q80 124 36 160" />
        <path d="M98 101 Q117 124 160 160" />
      </g>

      {/* Lagerfeuer: erst die Flamme, dann die Scheite darunter */}
      <g strokeWidth="1.1">
        <path d="M212 161 Q208 141 223 122 Q220 139 230 146 Q239 153 234 161" />
        <path d="M220 160 Q217 149 226 138 Q225 149 230 154 Q233 158 229 160" opacity="0.7" />
      </g>
      <g strokeWidth="1.4">
        <path d="M203 162 Q224 166 247 162 Q242 170 236 170 Q224 172 213 170 Q208 170 203 162 Z" />
        <path d="M208 166 Q225 169 243 165" strokeWidth="0.9" opacity="0.55" />
      </g>

      {/* Boden – eine einzige, leicht schwankende Linie */}
      <path
        d="M16 167 Q60 170 104 166 Q150 162 196 167 Q242 171 284 166"
        strokeWidth="1.5"
      />

      {/* Ein paar Grasbüschel, damit der Boden nicht leer wirkt */}
      <g strokeWidth="0.9" opacity="0.55">
        <path d="M32 166 Q34 160 36 166 M36 166 Q39 159 41 165" />
        <path d="M262 165 Q264 159 266 165 M266 165 Q269 158 271 164" />
        <path d="M168 165 Q170 160 172 165" />
      </g>
    </svg>
  );
}
