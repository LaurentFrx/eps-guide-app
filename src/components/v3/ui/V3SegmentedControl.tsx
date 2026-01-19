"use client";

import { cn } from "@/lib/utils";

type SegmentOption = {
  value: string;
  label: string;
};

type V3SegmentedControlProps = {
  value: string;
  options: SegmentOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function V3SegmentedControl({
  value,
  options,
  onChange,
  className,
}: V3SegmentedControlProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "v3-surface inline-flex w-full items-center gap-1 rounded-[var(--v3-radius-btn)] p-1",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-9 flex-1 rounded-[10px] px-3 py-2 text-xs font-semibold transition",
              active
                ? "bg-[color:var(--v3-card)] text-[color:var(--v3-text)]"
                : "text-[color:var(--v3-text-muted)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
