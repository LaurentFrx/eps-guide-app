"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  label?: string;
  fallbackHref?: string;
  className?: string;
};

const isSafeFrom = (value: string | null) =>
  value && value.startsWith("/") ? value : null;

const resolveFallback = (pathname: string, fallbackHref?: string) => {
  if (fallbackHref) return fallbackHref;
  if (pathname.startsWith("/exercises/detail/")) {
    const code = pathname.split("/")[3] ?? "";
    const session = code.split("-")[0];
    if (session) return `/exercises/${session}`;
    return "/exercises";
  }
  if (pathname.startsWith("/exercises/")) return "/exercises";
  if (pathname.startsWith("/musculation/") && pathname !== "/musculation/accueil") {
    return "/musculation/accueil";
  }
  return "/";
};

export function BackLink({ label = "Retour", fallbackHref, className }: BackLinkProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const from = isSafeFrom(searchParams?.get("from") ?? null);
  const href = from ?? resolveFallback(pathname, fallbackHref);

  return (
    <Link href={href} className={cn("ui-link text-sm font-medium", className)}>
      {label}
    </Link>
  );
}
