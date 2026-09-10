"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, Library, ListChecks, Settings } from "lucide-react";

export const TABS = [
  { href: "/library", label: "Library", icon: Library },
  { href: "/lists", label: "Listen", icon: ListChecks },
  { href: "/compare", label: "Vergleich", icon: GitCompareArrows },
  { href: "/settings", label: "Einstellungen", icon: Settings },
] as const;

/** Index des Tabs, zu dem ein Pfad gehört – auch für Unterseiten wie /lists/detail. */
export function tabIndexForPath(pathname: string): number {
  const index = TABS.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
  );
  return index === -1 ? 0 : index;
}

export function BottomNav() {
  const pathname = usePathname();
  const activeIndex = tabIndexForPath(pathname);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-clay-200 px-4 pt-2 dark:bg-clay-950"
      // Home-Indicator freihalten, auf Geräten ohne Notch bleibt 0.75rem
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-3xl gap-1 rounded-card bg-clay-200 p-2 shadow-neu dark:bg-clay-950">
        {TABS.map(({ href, label, icon: Icon }, index) => {
          const active = index === activeIndex;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-control px-1 py-2.5 text-[0.6875rem] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-clay-200 text-ember-600 shadow-neu-in-sm dark:bg-clay-950 dark:text-ember-400"
                    : "text-clay-600 active:shadow-neu-in-sm dark:text-clay-400"
                }`}
              >
                <Icon className="h-[1.375rem] w-[1.375rem]" strokeWidth={active ? 2.4 : 1.9} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
