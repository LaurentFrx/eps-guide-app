import { cn } from "@/lib/utils";

type V3Tone = "power" | "endurance" | "volume" | "neutral";

type V3ProgressBarProps = {
  value: number;
  max: number;
  tone?: V3Tone;
  label?: string;
  className?: string;
};

const toneColor: Record<V3Tone, string> = {
  power: "var(--v3-accent-power)",
  endurance: "var(--v3-accent-endurance)",
  volume: "var(--v3-accent-volume)",
  neutral: "var(--v3-text)",
};

export function V3ProgressBar({
  value,
  max,
  tone = "neutral",
  label,
  className,
}: V3ProgressBarProps) {
  const safeMax = max <= 0 ? 1 : max;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-[color:var(--v3-text-muted)]">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      ) : null}
      <div className="v3-surface h-2 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: toneColor[tone] }}
        />
      </div>
    </div>
  );
}
