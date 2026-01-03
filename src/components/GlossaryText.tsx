"use client";

import { useMemo, type ReactNode } from "react";
import { glossary } from "@/lib/glossary/glossary";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type GlossaryEntry = {
  title: string;
  body: string;
};

type GlossaryTextProps = {
  text?: string;
  className?: string;
};

const WORD_CHAR_RE = /[A-Za-z0-9\u00c0-\u00ff]/;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isWordChar(value?: string): boolean {
  if (!value) return false;
  return WORD_CHAR_RE.test(value);
}

export function GlossaryText({ text, className }: GlossaryTextProps) {
  const trimmed = text?.trim();
  const { regex, lookup } = useMemo(() => {
    const entries = Object.entries(glossary);
    const terms = entries
      .map(([term]) => term)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegExp);
    const regexValue = new RegExp(terms.join("|"), "gi");
    const lookupValue = new Map(
      entries.map(([term, entry]) => [term.toLowerCase(), entry as GlossaryEntry])
    );
    return { regex: regexValue, lookup: lookupValue };
  }, []);

  if (!trimmed) return null;

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={cn("space-y-3 text-sm text-slate-700", className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 16)}-${index}`} className="leading-relaxed">
          {renderParagraph(paragraph, regex, lookup)}
        </p>
      ))}
    </div>
  );
}

function renderParagraph(
  paragraph: string,
  regex: RegExp,
  lookup: Map<string, GlossaryEntry>
) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of paragraph.matchAll(regex)) {
    const matched = match[0];
    const index = match.index ?? 0;
    const before = paragraph[index - 1];
    const after = paragraph[index + matched.length];

    if (isWordChar(before) || isWordChar(after)) {
      continue;
    }

    if (index > lastIndex) {
      nodes.push(paragraph.slice(lastIndex, index));
    }

    const entry = lookup.get(matched.toLowerCase());
    if (entry) {
      nodes.push(
        <Popover key={`${matched}-${index}`}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 border-b border-dotted border-slate-400 text-slate-900 transition hover:text-slate-600"
            >
              {matched}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-72 rounded-xl border border-slate-200 bg-white p-4 text-slate-700 shadow-lg"
          >
            <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {entry.body}
            </p>
          </PopoverContent>
        </Popover>
      );
    } else {
      nodes.push(matched);
    }

    lastIndex = index + matched.length;
  }

  if (lastIndex < paragraph.length) {
    nodes.push(paragraph.slice(lastIndex));
  }

  return nodes.length ? nodes : paragraph;
}
