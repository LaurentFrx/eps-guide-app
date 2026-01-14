"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  Dumbbell,
  Home,
  Library,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/musculation/accueil",
    label: "Accueil",
    icon: Home,
    exact: true,
  },
  { href: "/musculation/entrainement", label: "S'entraîner", icon: Dumbbell },
  { href: "/musculation/connaissances", label: "Connaissances", icon: BookOpen },
  { href: "/musculation/evaluation", label: "Évaluation", icon: ClipboardList },
  { href: "/musculation/bibliotheque", label: "Bibliothèque", icon: Library },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/favorites", label: "Favoris", icon: Star },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-none mx-auto w-full max-w-lg px-4">
        <nav className="pointer-events-auto">
          <div className="ui-surface ui-bottomnav flex items-center justify-between gap-1 rounded-full px-2 py-2 shadow-lg">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : "false"}
                  className={cn(
                    "ui-navitem flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                    isActive ? "is-active" : "hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className={isActive ? "max-w-full truncate" : "sr-only"}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
