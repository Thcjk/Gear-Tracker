/**
 * Flatlay-Objekte der sieben Kategorien.
 *
 * Von oben abgelegtes Gepäck, flächig koloriert mit Ink-Kontur – wie ein
 * aufgeklebtes Foto im Journal. Alle sieben teilen sich Rahmen,
 * Strichstärke und Farbvorrat, damit sie nebeneinander nicht wie
 * gesammelte Fundstücke wirken.
 *
 * Die Objekte ersetzen den Kategorietext nicht: sie tragen aria-hidden,
 * solange kein title übergeben wird.
 */
import type { Category } from "@/types";

const INK = "#263241";
const RUST = "#C1502E";
const OLIVE = "#74804B";
const MUSTARD = "#E3A73E";
const DENIM = "#4A6079";
const PAPER = "#F3ECDC";

/** Laufende Nummer neben dem Objekt – die Ordnung des Journals. */
export const CATEGORY_NUMBER: Record<Category, string> = {
  shelter: "01",
  "sleep-system": "02",
  backpack: "03",
  kitchen: "04",
  clothing: "05",
  electronics: "06",
  "hygiene-misc": "07",
};

const SHAPES: Record<Category, JSX.Element> = {
  /* Zelt von der Seite, mit Abspannung */
  shelter: (
    <>
      <path d="M8 42 L24 10 L40 42 Z" fill={OLIVE} />
      <path d="M24 18 L30 42 L19 42 Z" fill={PAPER} />
      <path d="M8 42 L24 10 L40 42 Z" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M24 12 L24 42" stroke={INK} strokeWidth="2.5" />
      <path d="M4 42 L44 42" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 10 L7 38 M24 10 L41 38" stroke={INK} strokeWidth="2" opacity="0.5" />
    </>
  ),
  /* Zusammengerollter Schlafsack mit Gurt */
  "sleep-system": (
    <>
      <rect x="6" y="15" width="36" height="22" rx="11" fill={DENIM} stroke={INK} strokeWidth="3" />
      <path d="M15 18 Q10 26 15 34" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.7" />
      <rect x="26" y="13" width="7" height="26" rx="2" fill={MUSTARD} stroke={INK} strokeWidth="2.5" />
    </>
  ),
  /* Rucksack von vorne */
  backpack: (
    <>
      <path d="M13 18 Q13 9 24 9 Q35 9 35 18 L36 38 Q36 42 31 42 L17 42 Q12 42 12 38 Z" fill={RUST} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M12 22 Q24 26 36 21" stroke={INK} strokeWidth="2.5" fill="none" />
      <rect x="18" y="28" width="12" height="9" rx="2" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <path d="M20 9 Q24 4 28 9" stroke={INK} strokeWidth="2.5" fill="none" />
    </>
  ),
  /* Kochtopf mit Bügel */
  kitchen: (
    <>
      <path d="M11 19 Q24 11 37 19" fill="none" stroke={INK} strokeWidth="2.5" />
      <path d="M8 19 L40 19 L36 39 Q24 44 12 39 Z" fill={OLIVE} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 26 Q24 30 34 26" stroke={INK} strokeWidth="2" opacity="0.5" fill="none" />
    </>
  ),
  /* T-Shirt, flach ausgelegt */
  clothing: (
    <>
      <path d="M17 11 L31 11 L41 17 L36 24 L33 21 L33 41 L15 41 L15 21 L12 24 L7 17 Z" fill={MUSTARD} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M19 11 Q24 16 29 11" fill="none" stroke={INK} strokeWidth="2.5" />
    </>
  ),
  /* Stirnlampe mit Band */
  electronics: (
    <>
      <path d="M8 24 Q24 14 40 24" fill="none" stroke={INK} strokeWidth="3" />
      <rect x="16" y="21" width="16" height="14" rx="3" fill={DENIM} stroke={INK} strokeWidth="3" />
      <circle cx="24" cy="28" r="3.6" fill={MUSTARD} stroke={INK} strokeWidth="2" />
      <path d="M8 24 Q6 32 10 38 M40 24 Q42 32 38 38" fill="none" stroke={INK} strokeWidth="2.5" opacity="0.6" />
    </>
  ),
  /* Kulturbeutel mit Reissverschluss und Henkel */
  "hygiene-misc": (
    <>
      <path d="M18 18 Q18 11 24 11 Q30 11 30 18" fill="none" stroke={INK} strokeWidth="2.5" />
      <path d="M9 18 L39 18 Q41 18 41 21 L40 39 Q40 42 36 42 L12 42 Q8 42 8 39 L7 21 Q7 18 9 18 Z" fill={RUST} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M7 24 L41 24" stroke={INK} strokeWidth="2.5" />
      <path d="M30 21 L30 28" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

export function FlatlayObject({
  category,
  className = "h-11 w-11",
  title,
}: {
  category: Category;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className || undefined}
      fill="none"
      strokeLinecap="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {SHAPES[category]}
    </svg>
  );
}
