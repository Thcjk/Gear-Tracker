"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";

export function ThemeToggle() {
  const { data, setTheme } = useAppStore();
  const isDark = data.theme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Light" : "Dark"}
    </Button>
  );
}
