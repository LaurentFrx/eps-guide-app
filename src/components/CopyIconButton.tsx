"use client";

import { useEffect, useRef, useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyIconButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
};

const COPY_RESET_MS = 1200;

export function CopyIconButton({
  text,
  label = "Copier",
  copiedLabel = "Copié !",
  ariaLabel,
  className,
  size = "sm",
  disabled,
}: CopyIconButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const canCopy = Boolean(text.trim()) && !disabled;
  const tooltipText = copied ? copiedLabel : label;
  const buttonSize = size === "sm" ? "icon-sm" : "icon";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setCopied(false);
      }, COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="group relative inline-flex">
      <Button
        type="button"
        variant="ghost"
        size={buttonSize}
        onClick={handleCopy}
        disabled={!canCopy}
        aria-label={ariaLabel ?? label}
        title={tooltipText}
        className={cn(
          "text-white/70 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40",
          className
        )}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {tooltipText}
      </span>
    </div>
  );
}
