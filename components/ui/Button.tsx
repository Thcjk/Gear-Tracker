"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Buttons im Neumorphism-Stil.
 *
 * "raised" liegt auf derselben Fläche wie der Hintergrund und wird nur
 * durch den Doppelschatten plastisch; beim Tippen kippt der Schatten nach
 * innen, der Button wirkt eingedrückt. "accent" trägt Orange bzw. Grün als
 * Fläche – bewusst sparsam, nur für die primäre Aktion eines Screens.
 */
type Variant = "raised" | "accent" | "forest" | "quiet" | "danger";

const VARIANTS: Record<Variant, string> = {
  raised:
    "bg-clay-200 text-clay-800 shadow-neu-sm active:shadow-neu-in-sm dark:bg-clay-950 dark:text-clay-100",
  accent:
    "bg-ember-500 text-white shadow-neu-accent active:shadow-neu-in-sm active:bg-ember-600",
  forest:
    "bg-forest-600 text-white shadow-neu-accent active:shadow-neu-in-sm active:bg-forest-700",
  quiet:
    "bg-transparent text-clay-700 hover:text-clay-900 dark:text-clay-300 dark:hover:text-clay-50",
  danger:
    "bg-clay-200 text-red-700 shadow-neu-sm active:shadow-neu-in-sm dark:bg-clay-950 dark:text-red-300",
};

export function Button({
  variant = "raised",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Quadratischer Icon-Button, sonst identisch. */
export function IconButton({
  variant = "raised",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-control transition-all duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
