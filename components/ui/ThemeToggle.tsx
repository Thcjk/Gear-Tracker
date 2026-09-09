"use client";

import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function ThemeToggle() {
  const { data, setTheme } = useAppStore();
  const isDark = data.theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-2xl bg-forest-100 px-4 py-2 text-sm font-medium text-forest-800 transition hover:bg-forest-200 dark:bg-forest-800 dark:text-forest-100 dark:hover:bg-forest-700"
      aria-label={isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
