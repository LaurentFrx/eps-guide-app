import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type V3HeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function V3Header({ title, subtitle, action, className }: V3HeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-[color:var(--v3-text)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs text-[color:var(--v3-text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
