"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

export interface NoteOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Auswahlfeld als aufgefächerter Zettelstapel.
 *
 * Beim Öffnen fallen die Zettel nacheinander heraus und legen sich leicht
 * schief übereinander. Die Staffelung und die Winkel stecken in CSS
 * (--i pro Zeile); eine Animationsbibliothek wäre dafür rund 50 kB
 * Mehrgewicht auf einer App, deren ganzer Zweck Gewichtssparen ist – und
 * für ein Aufklappen, das der Compositor ohnehin allein erledigt.
 *
 * Bedienung wie bei einem echten Auswahlfeld: der Knopf ist eine
 * combobox, die Liste eine listbox, die aktive Zeile wird über
 * aria-activedescendant angesagt statt über wanderndem Fokus. Pfeile,
 * Pos1/Ende, Enter, Escape und Tippen auf den Anfangsbuchstaben tun das,
 * was sie im Betriebssystem auch tun.
 */
export function NoteDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "Wählen…",
  className = "",
  ariaLabel,
}: {
  /** Beschriftung in Handschrift auf der Karte. Ohne sie greift ariaLabel. */
  label?: ReactNode;
  value: T | "";
  options: NoteOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId().replace(/:/g, "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  // Schliessen, sobald irgendwo daneben getippt wird. pointerdown und
  // nicht click: sonst bliebe die Liste bis zum Loslassen stehen und
  // fängt dabei den Klick ab, der eigentlich woanders hinsollte.
  useEffect(() => {
    if (!open) return;
    function onDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Die aktive Zeile muss sichtbar sein – bei einer langen Library steht
  // sie sonst ausserhalb des Ausschnitts, während sie angesagt wird.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${id}-opt-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  function openWith(index: number) {
    setActive(Math.max(0, index));
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openWith(selectedIndex);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setOpen(false);
        return;
      case "Tab":
        // Tab darf weiterwandern; die Liste geht dabei zu.
        setOpen(false);
        return;
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        event.preventDefault();
        setActive(0);
        return;
      case "End":
        event.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        return;
      default:
        break;
    }

    // Tippen auf den Anfangsbuchstaben. Mehrere Zeichen kurz
    // hintereinander suchen nach dem ganzen Präfix.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      const now = Date.now();
      typed.current.text =
        now - typed.current.at > 800
          ? event.key.toLowerCase()
          : typed.current.text + event.key.toLowerCase();
      typed.current.at = now;
      const hit = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(typed.current.text),
      );
      if (hit >= 0) setActive(hit);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={ariaLabel}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openWith(selectedIndex))}
        onKeyDown={onKeyDown}
        className="note-card w-full text-left"
      >
        {label && (
          <span className="note-card__label handwritten">{label}</span>
        )}
        <span className="note-card__value flex items-center justify-between gap-2">
          <span className="min-w-0 truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-paper-600 transition-transform duration-200 dark:text-paper-400 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </span>
        <span aria-hidden className="note-card__fold" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
          className="note-stack"
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-opt-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={index === active || undefined}
              // onPointerDown statt onClick: der Fokus soll gar nicht
              // erst vom Knopf wegwandern.
              onPointerDown={(event) => {
                event.preventDefault();
                choose(index);
              }}
              onPointerEnter={() => setActive(index)}
              className="note-stack__item"
              style={
                {
                  "--i": index,
                  "--fan": `${(((index * 37) % 7) - 3) * 0.6}deg`,
                } as React.CSSProperties
              }
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
