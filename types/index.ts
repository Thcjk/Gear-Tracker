import type { Destination } from "@/lib/weather";

export type Category =
  | "shelter"
  | "sleep-system"
  | "backpack"
  | "kitchen"
  | "clothing"
  | "electronics"
  | "hygiene-misc";

export interface GearItem {
  id: string;
  name: string;
  category: Category;
  weightGrams: number;
  price?: number;
  /**
   * Komforttemperatur in °C, nur für Schlafsysteme. Sie entscheidet, ob
   * ein Schlafsack zur geplanten Tour passt, und gehört damit neben das
   * Gewicht – nicht in die Notizen, wo sich nicht danach filtern lässt.
   */
  comfortTempC?: number;
  notes?: string;
  createdAt: string;
}

export interface PackingListItem {
  gearItemId: string;
  quantity: number;
  packed: boolean;
}

export interface PackingList {
  id: string;
  name: string;
  items: PackingListItem[];
  /**
   * Wohin die Tour geht. Optional und rein für die Wetteranzeige da –
   * ohne Zielort verlässt für diese Liste kein Byte das Gerät.
   */
  destination?: Destination;
  createdAt: string;
  updatedAt: string;
}

/* ---------------------------------------------------------------- *
 * Tourbuch
 *
 * Nach der Tour beantwortet: Was war zu schwer, was hat gefehlt, was
 * blieb im Rucksack. Die Auswertung hängt an der Packliste, mit der
 * gelaufen wurde – nur so lässt sich beim nächsten Mal nachsehen, was
 * das letzte Mal ergeben hat.
 * ---------------------------------------------------------------- */

/** Bewusst die Klartext-Werte: sie stehen so auch in der Oberfläche. */
export type WeightFeeling = "zu schwer" | "genau richtig" | "zu leicht";

export interface TourGeneralAnswers {
  weightFeeling: WeightFeeling;
  whatWorked?: string;
  whatWasMissing?: string;
  whatToLeaveOut?: string;
  notes?: string;
}

/** Ein Urteil über ein einzelnes mitgenommenes Item. */
export interface TourItemReview {
  gearItemId: string;
  used: boolean;
  note?: string;
}

export interface TourReview {
  id: string;
  packingListId: string;
  completedAt: string;
  generalAnswers: TourGeneralAnswers;
  itemReviews: TourItemReview[];
}

/** Gear-Item ohne die vom Store vergebenen Felder – Basis für Formulare. */
export type GearDraft = Omit<GearItem, "id" | "createdAt">;

/** Eine Zeile der Kategorie-Auswertung, gemeinsam genutzt von Berechnung und Chart. */
export interface CategoryWeightRow {
  category: Category;
  label: string;
  weightGrams: number;
  color: string;
}

/**
 * Ein Vergleichsteilnehmer, losgelöst von der Herkunft: eine eigene
 * Packliste oder eine importierte Datei. Die Berechnung interessiert nur
 * noch Kategorie, Gewicht, Menge und Preis je Eintrag.
 */
export interface ComparisonSourceItem {
  category: Category;
  weightGrams: number;
  quantity: number;
  price?: number;
}

export interface ComparisonEntry {
  key: string;
  title: string;
  /** Nur bei importierten Listen gesetzt. */
  owner?: string;
  imported: boolean;
  items: ComparisonSourceItem[];
}

/** Eine Zeile des Packlisten-Vergleichs. */
export interface ComparisonRow {
  entry: ComparisonEntry;
  weightGrams: number;
  price: number;
  itemCount: number;
  weightDiff: number;
  priceDiff: number;
  isLightest: boolean;
  isCheapest: boolean;
}

/** Eine Kategoriezeile der Gegenüberstellung: ein Gewicht je Teilnehmer. */
export interface CategoryComparisonRow {
  category: Category;
  label: string;
  color: string;
  weights: number[];
}

/* ---------------------------------------------------------------- *
 * Austauschformat: eine Packliste, die eine andere Person als Datei
 * bekommt. Items sind vollständig aufgelöst – Referenzen auf GearItems
 * wären beim Empfänger wertlos, seine Library kennt sie nicht.
 * ---------------------------------------------------------------- */

export interface SharedListItem {
  name: string;
  category: Category;
  weightGrams: number;
  quantity: number;
  price?: number;
  comfortTempC?: number;
}

export interface SharedPackingList {
  /** Kennung des Formats, damit fremde JSON-Dateien früh auffallen. */
  format: "gear-tracker-share";
  version: 1;
  ownerName: string;
  listName: string;
  exportedAt: string;
  items: SharedListItem[];
  totalWeightGrams: number;
  totalPrice: number;
}

export type SortKey = "name" | "weightGrams" | "price";
export type ThemeMode = "light" | "dark";

export interface AppData {
  gearItems: GearItem[];
  packingLists: PackingList[];
  /** Abgeschlossene Touren, neueste zuerst geschrieben. */
  tourReviews: TourReview[];
  theme: ThemeMode;
}
