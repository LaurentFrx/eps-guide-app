import { APP_VERSION_LABEL } from "@/lib/appVersion";
import { cn } from "@/lib/utils";

type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] z-40 flex justify-center px-4 pointer-events-none",
        className
      )}
    >
      <span className="pointer-events-none text-[11px] font-medium tracking-wide tabular-nums text-white/60 md:text-xs">
        {APP_VERSION_LABEL}
      </span>
    </div>
  );
}
