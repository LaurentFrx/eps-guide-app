"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { isPlaceholderText, toDisplayBlocks } from "@/lib/editorial/uiParse";

type EditorialCardProps = {
  title: string;
  content: string;
  copyLabel?: string;
  displayMode?: "paragraph" | "smartList";
  className?: string;
};

const COPY_RESET_MS = 1800;

export function EditorialCard({
  title,
  content,
  copyLabel,
  displayMode = "paragraph",
  className,
}: EditorialCardProps) {
  const [copied, setCopied] = useState(false);
  const hasContent =
    Boolean(content.trim()) && !isPlaceholderText(content);
  const blocks = useMemo(
    () => (hasContent ? toDisplayBlocks(content, displayMode) : []),
    [content, displayMode, hasContent]
  );

  const handleCopy = async () => {
    if (!hasContent) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <GlassCard className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-widest text-white/60">{title}</p>
        <div className="flex items-center gap-2">
          {copyLabel ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!hasContent}
              onClick={handleCopy}
              className="ui-chip"
            >
              {copied ? "Copié" : copyLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {hasContent ? (
        <div className="max-w-prose space-y-3 text-sm leading-relaxed text-white/75">
          {blocks.map((block, index) => {
            if (block.type === "paragraph") {
              return (
                <p key={`p-${index}`} className="whitespace-pre-wrap">
                  {block.text}
                </p>
              );
            }
            const hasExplicitBullet = block.items.some((item) =>
              /^\s*[-\u2022]/.test(item)
            );
            return (
              <ul
                key={`l-${index}`}
                className={cn(
                  "space-y-2",
                  hasExplicitBullet ? "list-none pl-0" : "list-disc pl-5"
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`i-${index}-${itemIndex}`} className="whitespace-pre-wrap">
                    {item}
                  </li>
                ))}
              </ul>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/60">Aucun contenu.</p>
      )}
    </GlassCard>
  );
}
