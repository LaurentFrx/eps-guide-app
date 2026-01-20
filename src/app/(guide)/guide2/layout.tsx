"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/guide2", label: "Accueil" },
  { href: "/guide2/exercices", label: "Exercices" },
  { href: "/guide2/entrainement", label: "S’entraîner" },
  { href: "/guide2/evaluation", label: "Évaluation" },
];

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 px-4 pt-4 pb-24">{children}</div>
      <nav className="sticky bottom-0 w-full border-t bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 text-sm">
          {navItems.map((item) => {
            const isActive =
              item.href === "/guide2"
                ? pathname === item.href
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-3 text-center ${
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
