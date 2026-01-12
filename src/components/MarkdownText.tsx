import { cn } from "@/lib/utils";

type MarkdownTextProps = {
  text?: string;
  className?: string;
};

type MarkdownBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const BULLET_RE =
  /^\s*[-*\u0007\u00B7\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25E6]\s+/;

const toBlocks = (text: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  const lines = text.split(/\r?\n/);
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n").trim() });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems.slice() });
      listItems = [];
    }
  };

  lines.forEach((line) => {
    if (!line.trim()) {
      flushParagraph();
      flushList();
      return;
    }
    if (BULLET_RE.test(line)) {
      flushParagraph();
      listItems.push(line.replace(BULLET_RE, "").trim());
      return;
    }
    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  return blocks;
};

export function MarkdownText({ text, className }: MarkdownTextProps) {
  if (!text) return null;

  const blocks = toBlocks(text);

  return (
    <div className={cn("break-words text-sm text-white/75", className)}>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className="space-y-2 list-disc pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`} className="whitespace-pre-wrap">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={`para-${index}`} className="whitespace-pre-wrap">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
