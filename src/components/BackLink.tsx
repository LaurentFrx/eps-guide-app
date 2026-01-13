"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href?: string;
  label?: string;
  fallbackHref?: string;
  className?: string;
  children?: ReactNode;
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

function BackLinkInner({
  label = "Retour",
  fallbackHref,
  className,
  children,
}: BackLinkProps) {
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const from = isSafeFrom(searchParams?.get("from") ?? null);
  const href = from ?? resolveFallback(pathname, fallbackHref);

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("ui-link text-sm font-medium", className)}
    >
      {children ?? label}
    </Link>
  );
}

function BackLinkFallback({
  label = "Retour",
  fallbackHref = "/",
  className,
  children,
}: BackLinkProps) {
  return (
    <Link
      href={fallbackHref}
      aria-label={label}
      className={cn("ui-link text-sm font-medium", className)}
    >
      {children ?? label}
    </Link>
  );
}

export function BackLink(props: BackLinkProps) {
  if (props.href) {
    return (
      <Link
        href={props.href}
        aria-label={props.label ?? "Retour"}
        className={cn("ui-link text-sm font-medium", props.className)}
      >
        {props.children ?? props.label ?? "Retour"}
      </Link>
    );
  }

  return (
    <Suspense fallback={<BackLinkFallback {...props} />}>
      <BackLinkInner {...props} />
    </Suspense>
  );
}
