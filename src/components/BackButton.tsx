"use client";

import { ChevronLeft } from "lucide-react";
import { BackLink } from "@/components/BackLink";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export const BackButton = ({
  fallbackHref = "/exercises",
  label = "Retour",
  className,
}: BackButtonProps) => {
  return (
    <BackLink
      fallbackHref={fallbackHref}
      label={label}
      className={cn(
        "ui-surface inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:bg-white/15",
        className
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{label}</span>
    </BackLink>
  );
};
