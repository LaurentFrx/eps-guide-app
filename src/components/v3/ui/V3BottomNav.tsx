"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Home,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/accueil", label: "Accueil", icon: Home },
  { href: "/seances", label: "Séances", icon: CalendarDays },
  { href: "/carnet", label: "Carnet", icon: BookOpen },
  { href: "/apprendre", label: "Apprendre", icon: GraduationCap },
  { href: "/coach", label: "Coach", icon: MessageSquare },
  { href: "/profil", label: "Profil", icon: User },
];

export function V3BottomNav() {
  const pathname = usePathname();

  return (
    <div className="v3-bottom-nav fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <nav className="mx-auto w-full max-w-lg px-4">
        <div className="v3-surface grid grid-cols-6 gap-1 rounded-[20px] px-2 py-2">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium transition",
                  active
                    ? "text-[color:var(--v3-accent-endurance)] font-semibold"
                    : "text-[color:var(--v3-text-muted)]"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
