import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FlyerFrameProps = {
  children: ReactNode;
  className?: string;
};

export function FlyerFrame({ children, className }: FlyerFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_14px_50px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.28)]" />
    </div>
  );
}
