"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const HEADER_TITLES: Array<{
  match: (pathname: string) => boolean;
  title: string;
}> = [
  { match: (pathname) => pathname === "/" || pathname.startsWith("/accueil"), title: "Accueil" },
  { match: (pathname) => pathname.startsWith("/search"), title: "Exercices" },
  { match: (pathname) => pathname.startsWith("/guide"), title: "Guide" },
  { match: (pathname) => pathname.startsWith("/favorites"), title: "Favoris" },
  { match: (pathname) => pathname.startsWith("/exercises"), title: "Sessions" },
  { match: (pathname) => pathname.startsWith("/sessions"), title: "Sessions" },
];

const getHeaderTitle = (pathname: string) => {
  const found = HEADER_TITLES.find((item) => item.match(pathname));
  return found?.title ?? "Guide";
};

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const title = getHeaderTitle(pathname);

  return (
    <div className={cn("relative z-10", className)}>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b1020]/80 px-5 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 overflow-hidden rounded-2xl bg-white/10">
              <Image
                src="/branding/logo-eps.png"
                alt="Guide musculation"
                fill
                sizes="40px"
                className="object-contain p-1.5"
              />
            </span>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">
                Guide musculation
              </p>
              <p className="text-base font-semibold text-white">{title}</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="eps-app__content px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+120px)]">
        {children}
      </main>
    </div>
  );
}
