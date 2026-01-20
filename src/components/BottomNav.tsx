"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Accueil",
    icon: Home,
    exact: true,
  },
  { href: "/search", label: "Exercices", icon: Search },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/favorites", label: "Favoris", icon: Star },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-none mx-auto w-full max-w-lg px-4">
        <nav className="pointer-events-auto">
          <div className="ui-surface ui-bottomnav rounded-[26px] px-2 py-2">
            <div className="grid grid-cols-4 gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === "/" || pathname === item.href
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
                      "ui-navitem ui-pressable relative flex min-w-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                      isActive ? "is-active" : "hover:text-white"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="max-w-full truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
