"use client";

import { useState } from "react";
import { CheckCheck, Dumbbell, Feather, TrendingDown } from "lucide-react";
import { formatWeight } from "@/lib/categories";
import type { WeightSnapshot } from "@/lib/weightHistory";

/** Bis hierhin gilt die Liste als leicht. */
const LIGHT_LIMIT = 5000;
/** Ab hier wird es sportlich. */
const HEAVY_LIMIT = 15000;

const HEAVY_QUIPS = [
  "Herzlichen Glückwunsch, dein Rücken hasst dich!",
  "15 kg+? Das nennt man jetzt Expedition, nicht Ultralight.",
  "Dein Rucksack wiegt mehr als so mancher Trainingsplan.",
];

type Badge = {
  id: string;
  label: string;
  Icon: typeof Feather;
  className: string;
};

export function AchievementBadges({
  totalWeight,
  packed,
  total,
  reference,
}: {
  totalWeight: number;
  packed: number;
  total: number;
  reference: WeightSnapshot | null;
}) {
  /**
   * Einmal pro Aufruf des Dashboards gezogen, nicht bei jedem Render –
   * sonst wechselt der Spruch beim Abhaken jedes Häkchens. Die Badges
   * erscheinen erst nach dem Laden aus dem LocalStorage, also rein
   * client-seitig; der Zufall kann hier keine Hydration-Differenz
   * auslösen.
   */
  const [heavyQuip] = useState(
    () => HEAVY_QUIPS[Math.floor(Math.random() * HEAVY_QUIPS.length)],
  );

  const badges: Badge[] = [];

  // Bewusst als eine Verzweigung: leicht und schwer schliessen sich aus,
  // und das soll man dem Code ansehen statt es aus zwei Schwellwerten
  // ableiten zu müssen.
  if (totalWeight > 0 && totalWeight < LIGHT_LIMIT) {
    badges.push({
      id: "sub-5kg",
      label: "Unter 5 kg Base Weight!",
      Icon: Feather,
      className:
        "text-accent",
    });
  } else if (totalWeight >= HEAVY_LIMIT) {
    badges.push({
      id: "over-15kg",
      label: heavyQuip,
      Icon: Dumbbell,
      // Warnender Ton statt Grün oder Orange – der Spruch ist ironisch,
      // die Farbe soll das mittragen.
      className: "text-red-700 dark:text-red-300",
    });
  }

  if (reference && totalWeight > 0 && totalWeight < reference.weightGrams) {
    badges.push({
      id: "lighter",
      label: `${formatWeight(
        reference.weightGrams - totalWeight,
      )} leichter als „${reference.name}“`,
      Icon: TrendingDown,
      className:
        "text-ocean-800 dark:text-ocean-300",
    });
  }

  if (total > 0 && packed === total) {
    badges.push({
      id: "all-packed",
      label: "Alles gepackt – los geht's!",
      Icon: CheckCheck,
      className:
        "text-clay-700 dark:text-clay-200",
    });
  }

  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {badges.map(({ id, label, Icon, className }) => (
        <li key={id}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-clay-200 px-3.5 py-2 text-xs font-semibold shadow-neu-sm dark:bg-clay-800 ${className}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
