"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/guide", label: "Accueil" },
  { href: "/guide/exercices", label: "Exercices" },
  { href: "/guide/entrainement", label: "S’entraîner" },
  { href: "/guide/evaluation", label: "Évaluation" },
];

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 px-4 pt-4 pb-24">{children}</div>
      <nav className="sticky bottom-0 w-full border-t bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-md grid grid-cols-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-3 text-center text-sm ${
                  isActive ? "font-semibold underline" : "opacity-70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}