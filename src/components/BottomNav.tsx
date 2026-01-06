"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Search, Settings, Star } from "lucide-react";
import BuildStamp from "@/components/build-stamp";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/favorites", label: "Favoris", icon: Star },
  { href: "/settings", label: "Reglages", icon: Settings },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-lg px-4 pointer-events-none">
        <div className="flex justify-center pb-2">
          <BuildStamp className="text-[11px] text-white/60" />
        </div>
        <nav className="pointer-events-auto">
          <div className="ui-surface ui-bottomnav flex items-center justify-between gap-2 rounded-full px-4 py-2 shadow-lg">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/" ||
                    pathname?.startsWith("/sessions") ||
                    pathname?.startsWith("/exercises")
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
