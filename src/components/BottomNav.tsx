"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Dumbbell, Timer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/exos", label: "Exos", icon: Dumbbell },
  { href: "/seances", label: "Séances", icon: Timer },
  { href: "/apprendre", label: "Apprendre", icon: BookOpen },
  { href: "/progres", label: "Progrès", icon: TrendingUp },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-none mx-auto w-full max-w-lg px-4">
        <nav className="pointer-events-auto" aria-label="Navigation principale">
          <div className="ui-surface ui-bottomnav flex items-center justify-between gap-1 rounded-full px-2 py-2 shadow-lg">
            {navItems.map((item) => {
              const isActive =
                item.href === "/exos"
                  ? pathname === "/" || pathname?.startsWith(item.href)
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
                    "ui-navitem flex min-h-11 min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium transition",
                    isActive ? "is-active" : "hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};