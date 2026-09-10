/**
 * Weiche Farbfeld-Übergänge als Hintergrundebene.
 *
 * Mehrere überlagerte, unscharfe Farbflecken statt eines linearen
 * Verlaufs: der lineare hat sichtbare Bänder und eine erkennbare Richtung,
 * die Flecken gehen ineinander über, ohne dass ein Anfang und ein Ende
 * entsteht.
 *
 * Die Ebene ist reine Dekoration – aria-hidden, damit Screenreader sie
 * nicht ankündigen, und pointer-events:none, damit sie keine Klicks
 * abfängt, wenn sie über Inhalt liegt.
 *
 * Zur Leistung: blur(64px) auf drei grossen Flächen ist auf älteren
 * Telefonen spürbar. Deshalb bekommt jeder Fleck will-change:transform –
 * das schiebt die Unschärfe einmalig auf die GPU, statt sie bei jedem
 * Bildaufbau neu zu rechnen. Bei reduzierter Bewegung fällt die Unschärfe
 * ganz weg (siehe globals.css): dort zählt nicht die Optik, sondern dass
 * die Seite steht.
 */
interface GradientFieldProps {
  variant?: "cool" | "warm";
  /** 0…1 – der Splash trägt sie voll, ein Header deutlich schwächer. */
  opacity?: number;
  className?: string;
}

interface Blob {
  color: string;
  top: string;
  left: string;
  size: string;
}

/** Nectarine, Oceanic, Onyx – der Splash und alles Warme. */
const WARM: Blob[] = [
  { color: "#FFBD76", top: "10%", left: "20%", size: "60%" },
  { color: "#003F47", top: "40%", left: "60%", size: "55%" },
  { color: "#0A171D", top: "70%", left: "10%", size: "50%" },
];

/** Nectarine, helles Oceanic, Wheat – für helle Flächen. */
const COOL: Blob[] = [
  { color: "#FFBD76", top: "10%", left: "15%", size: "60%" },
  { color: "#A6CFD3", top: "45%", left: "55%", size: "55%" },
  { color: "#FFF6E9", top: "70%", left: "20%", size: "50%" },
];

export function GradientField({
  variant = "warm",
  opacity = 0.7,
  className = "",
}: GradientFieldProps) {
  const blobs = variant === "warm" ? WARM : COOL;

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative overflow-hidden ${className}`}
    >
      {blobs.map((blob) => (
        <div
          key={blob.color}
          className="gradient-blob absolute rounded-full blur-3xl"
          style={{
            backgroundColor: blob.color,
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
