import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export const GlassCard = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ui-card p-4",
      className
    )}
    {...props}
  />
);
