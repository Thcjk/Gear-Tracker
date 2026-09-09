"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, Library, ListChecks, Settings } from "lucide-react";

const tabs = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/lists", label: "Listen", icon: ListChecks },
  { href: "/compare", label: "Vergleich", icon: GitCompareArrows },
  { href: "/settings", label: "Einstellungen", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-200/70 bg-white/90 backdrop-blur-md dark:border-forest-800 dark:bg-forest-950/90">
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/library" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-ember-100 text-ember-700 dark:bg-ember-950 dark:text-ember-300"
                    : "text-earth-600 hover:bg-forest-50 dark:text-earth-300 dark:hover:bg-forest-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
