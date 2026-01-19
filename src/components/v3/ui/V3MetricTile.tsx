import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type V3Tone = "power" | "endurance" | "volume" | "neutral";

type V3MetricTileProps = {
  label: string;
  value: string | number;
  tone?: V3Tone;
  className?: string;
};

const toneRingStyle: Record<V3Tone, CSSProperties> = {
  power: { borderColor: "rgba(255, 77, 77, 0.4)" },
  endurance: { borderColor: "rgba(45, 156, 219, 0.4)" },
  volume: { borderColor: "rgba(39, 174, 96, 0.4)" },
  neutral: { borderColor: "var(--v3-border)" },
};

export function V3MetricTile({
  label,
  value,
  tone = "neutral",
  className,
}: V3MetricTileProps) {
  return (
    <div
      className={cn("v3-card flex flex-col gap-2 border px-4 py-3", className)}
      style={toneRingStyle[tone]}
    >
      <span className="text-xs uppercase tracking-widest text-[color:var(--v3-text-muted)]">
        {label}
      </span>
      <span className="text-lg font-semibold text-[color:var(--v3-text)]">
        {value}
      </span>
    </div>
  );
}
