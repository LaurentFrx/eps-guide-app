import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type V3BadgeTone = "power" | "endurance" | "volume" | "neutral";

type V3BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: V3BadgeTone;
};

const toneStyle: Record<V3BadgeTone, CSSProperties> = {
  power: {
    color: "var(--v3-accent-power)",
    borderColor: "rgba(255, 77, 77, 0.4)",
    backgroundColor: "rgba(255, 77, 77, 0.12)",
  },
  endurance: {
    color: "var(--v3-accent-endurance)",
    borderColor: "rgba(45, 156, 219, 0.45)",
    backgroundColor: "rgba(45, 156, 219, 0.12)",
  },
  volume: {
    color: "var(--v3-accent-volume)",
    borderColor: "rgba(39, 174, 96, 0.45)",
    backgroundColor: "rgba(39, 174, 96, 0.12)",
  },
  neutral: {
    color: "var(--v3-text)",
    borderColor: "var(--v3-border)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
};

export function V3Badge({ tone = "neutral", className, style, ...props }: V3BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        className
      )}
      style={{ ...toneStyle[tone], ...style }}
      {...props}
    />
  );
}
