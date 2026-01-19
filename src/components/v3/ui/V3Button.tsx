"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type V3ButtonTone = "power" | "endurance" | "volume" | "neutral";

type V3ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  tone?: V3ButtonTone;
};

const toneClasses: Record<V3ButtonTone, string> = {
  power: "bg-[color:var(--v3-accent-power)] text-white",
  endurance: "bg-[color:var(--v3-accent-endurance)] text-white",
  volume: "bg-[color:var(--v3-accent-volume)] text-white",
  neutral: "bg-[color:var(--v3-text)] text-[#0b1220]",
};

export function V3Button({
  asChild,
  variant = "primary",
  tone = "endurance",
  className,
  ...props
}: V3ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--v3-radius-btn)] px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--v3-border)] disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && toneClasses[tone],
        variant === "secondary" &&
          "v3-surface text-[color:var(--v3-text)]",
        variant === "ghost" &&
          "bg-transparent text-[color:var(--v3-text-muted)] hover:text-[color:var(--v3-text)]",
        className
      )}
      {...props}
    />
  );
}
