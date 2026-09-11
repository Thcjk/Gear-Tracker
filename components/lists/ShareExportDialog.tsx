"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Share2, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { StampButton } from "@/components/ui/StampButton";
import { NoteInput } from "@/components/ui/NoteInput";
import { DialogOverlay } from "@/components/ui/DialogOverlay";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

/**
 * Fragt den Anzeigenamen ab, unter dem die Liste beim Empfänger auftaucht.
 * Der zuletzt genutzte Name ist vorbelegt – so bleibt er gemerkt und lässt
 * sich trotzdem jederzeit ändern.
 */
export function ShareExportDialog({
  initialName,
  onConfirm,
  onClose,
}: {
  initialName: string;
  onConfirm: (ownerName: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <DialogOverlay label="Für Vergleich exportieren" onClose={onClose}>
      <SurfaceCard className="animate-rise w-full max-w-md p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-200 text-accent shadow-neu-sm dark:bg-paper-900">
            <Share2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-paper-800 dark:text-paper-100">
              Wie sollen wir dich in diesem Export nennen?
            </h2>
            <p className="mt-1 text-sm text-paper-700 dark:text-paper-400">
              Der Name steht in der Datei und erscheint beim Empfänger über
              deiner Spalte.
            </p>
          </div>
          <IconButton variant="quiet" onClick={onClose} aria-label="Schliessen">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <NoteInput
            label="Dein Name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Max"
            maxLength={40}
          />
          <div className="flex gap-2">
            <StampButton stampSeed="exportieren" type="submit" disabled={!name.trim()}>
              <Share2 className="h-4 w-4" />
              Exportieren
            </StampButton>
            <Button type="button" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
      </SurfaceCard>
    </DialogOverlay>
  );
}
