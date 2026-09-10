"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Buttons im Neumorphism-Stil.
 *
 * "raised" liegt auf derselben Fläche wie der Hintergrund und wird nur
 * durch den Doppelschatten plastisch; beim Tippen kippt der Schatten nach
 * innen, der Button wirkt eingedrückt. "accent" trägt Toxic Orange, "cool"
 * Aqua Mist – bewusst sparsam, nur für die primäre Aktion eines Screens.
 *
 * Beide farbigen Flächen tragen Black Kite als Schrift, nicht Weiss: auf
 * Toxic Orange erreicht Weiss nur 3.0:1, Black Kite dagegen 5.2:1.
 */
type Variant = "raised" | "accent" | "cool" | "quiet" | "danger";

const VARIANTS: Record<Variant, string> = {
  raised:
    "bg-clay-200 text-clay-800 shadow-neu-sm active:shadow-neu-in-sm dark:bg-clay-800 dark:text-clay-100",
  accent:
    "bg-accent text-on-accent shadow-neu-accent active:shadow-neu-in-sm active:opacity-90",
  cool:
    "bg-accent-warm text-onyx shadow-neu-accent active:shadow-neu-in-sm active:opacity-90 dark:bg-clay-800 dark:text-nectarine dark:shadow-neu-sm",
  quiet:
    "bg-transparent text-clay-700 hover:text-clay-900 dark:text-clay-300 dark:hover:text-clay-50",
  danger:
    "bg-clay-200 text-red-700 shadow-neu-sm active:shadow-neu-in-sm dark:bg-clay-800 dark:text-red-300",
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
