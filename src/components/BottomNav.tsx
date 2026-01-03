"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/favorites", label: "Favoris", icon: Star },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 z-50 w-[min(420px,92vw)] -translate-x-1/2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-between gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-lg shadow-slate-200/70 backdrop-blur-xl">
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
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition",
                isActive
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
