import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type V3CardProps = HTMLAttributes<HTMLDivElement>;

export function V3Card({ className, ...props }: V3CardProps) {
  return <div className={cn("v3-card p-4", className)} {...props} />;
}
