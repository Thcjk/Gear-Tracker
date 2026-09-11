"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { playCheckSound, setSoundEnabled, soundEnabled } from "@/lib/sounds";

/**
 * Schalter für die Geräusche.
 *
 * Der Zustand wird erst nach der Hydration gelesen: LocalStorage gibt es
 * beim Server-Rendering nicht, und ein Schalter, der zuerst "aus" zeigt
 * und dann umspringt, sähe nach Fehler aus. Bis dahin steht er auf dem
 * Standardwert, und das ist derselbe wie ohne gespeicherte Einstellung.
 *
 * Beim Einschalten kommt sofort der Ton, den man damit bekommt – ein
 * Schalter für etwas Hörbares muss hörbar sein.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => setOn(soundEnabled()), []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={() => {
          const next = !on;
          setSoundEnabled(next);
          setOn(next);
          if (next) playCheckSound();
        }}
        aria-pressed={on}
      >
        {on ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
        {on ? "Töne an" : "Töne aus"}
      </Button>
      <p className="min-w-0 flex-1 text-sm text-paper-700 dark:text-paper-400">
        Ein kurzes Klacken beim Abhaken und ein Dreiklang, wenn eine
        Auszeichnung dazukommt. Standardmässig aus.
      </p>
    </div>
  );
}
