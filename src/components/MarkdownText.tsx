import { cn } from "@/lib/utils";

type MarkdownTextProps = {
  text?: string;
  className?: string;
};

export function MarkdownText({ text, className }: MarkdownTextProps) {
  if (!text) return null;

  return (
    <div className={cn("whitespace-pre-wrap break-words text-sm text-white/75", className)}>
      {text}
    </div>
  );
}
