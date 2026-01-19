"use client";

import type { ComponentType } from "react";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";

type V3EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ComponentType<{ className?: string }>;
};

export function V3EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: V3EmptyStateProps) {
  return (
    <V3Card className="flex flex-col items-center gap-3 text-center">
      {Icon ? <Icon className="h-6 w-6 text-[color:var(--v3-text-muted)]" /> : null}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">{title}</p>
        <p className="text-xs text-[color:var(--v3-text-muted)]">{description}</p>
      </div>
      {actionLabel ? (
        <V3Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </V3Button>
      ) : null}
    </V3Card>
  );
}
