"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/musculation/accueil", label: "Accueil" },
  { href: "/musculation/exercices", label: "Exercices" },
  { href: "/musculation/etirements", label: "Etirements" },
  { href: "/musculation/connaissances", label: "Revisions" },
  { href: "/musculation/evaluation", label: "Evaluation" },
];

export function BottomTabsMuscu() {
  const pathname = usePathname();

  return (
    <div className="sticky bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="pt-3">
        <nav
          aria-label="Navigation musculation"
          className="ui-surface flex items-center justify-between gap-2 rounded-2xl px-3 py-2 shadow-lg"
        >
          {tabs.map((tab) => {
            const isActive = pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                data-active={isActive ? "true" : "false"}
                className={cn(
                  "ui-navitem flex-1 text-center text-[11px] font-medium transition",
                  isActive ? "is-active" : "hover:text-white"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
