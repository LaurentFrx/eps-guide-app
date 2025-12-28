import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export const GlassCard = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.4)] backdrop-blur-lg",
      className
    )}
    {...props}
  />
);
