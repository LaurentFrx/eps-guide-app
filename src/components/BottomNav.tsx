"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const V2_BASE = "/v2";

const navItems = [
  { href: V2_BASE, label: "Accueil", icon: Home },
  { href: `${V2_BASE}/search`, label: "Recherche", icon: Search },
  { href: `${V2_BASE}/guide`, label: "Guide", icon: BookOpen },
  { href: `${V2_BASE}/favorites`, label: "Favoris", icon: Star },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-lg px-4 pointer-events-none">
        <nav className="pointer-events-auto">
          <div className="ui-surface ui-bottomnav flex items-center justify-between gap-2 rounded-full px-4 py-2 shadow-lg">
            {navItems.map((item) => {
              const isActive =
                item.href === V2_BASE
                  ? pathname === V2_BASE ||
                    pathname?.startsWith(`${V2_BASE}/sessions`) ||
                    pathname?.startsWith(`${V2_BASE}/exercises`)
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  data-active={isActive ? "true" : "false"}
                  className={cn(
                    "ui-navitem flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition",
                    isActive ? "is-active" : "hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
