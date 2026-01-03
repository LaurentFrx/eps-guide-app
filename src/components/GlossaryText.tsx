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

const WORD_CHAR_RE = /[A-Za-z0-9]/;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeForMatch = (value: string) =>
  value
    .replace(/[œŒ]/g, "oe")
    .replace(/[æÆ]/g, "ae")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

const normalizeTermKey = (value: string) =>
  normalizeForMatch(value).replace(/\s+/g, " ").trim();

function isWordChar(value?: string): boolean {
  if (!value) return false;
  return WORD_CHAR_RE.test(value);
}

export function GlossaryText({ text, className }: GlossaryTextProps) {
  const trimmed = text?.trim();
  const { regex, lookup } = useMemo(() => {
    const entries = Object.entries(glossary);
    const normalizedEntries = entries.map(([term, entry]) => ({
      key: normalizeTermKey(term),
      entry: entry as GlossaryEntry,
    }));
    const terms = normalizedEntries
      .map(({ key }) => key)
      .sort((a, b) => b.length - a.length)
      .map((key) =>
        key
          .split(/\s+/g)
          .map((chunk) => escapeRegExp(chunk))
          .join("\\s+")
      );
    const regexValue = terms.length ? new RegExp(terms.join("|"), "giu") : null;
    const lookupValue = new Map(
      normalizedEntries.map(({ key, entry }) => [key, entry])
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
          {regex ? renderParagraph(paragraph, regex, lookup) : paragraph}
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
  const { normalized, startMap, endMap } = normalizeWithMap(paragraph);
  let lastIndex = 0;

  for (const match of normalized.matchAll(regex)) {
    const matched = match[0];
    const index = match.index ?? 0;
    const endIndex = index + matched.length;
    const before = normalized[index - 1];
    const after = normalized[endIndex];

    if (isWordChar(before) || isWordChar(after)) {
      continue;
    }

    const startOriginal = startMap[index];
    const endOriginal = endMap[endIndex - 1];
    if (startOriginal == null || endOriginal == null) {
      continue;
    }

    if (startOriginal > lastIndex) {
      nodes.push(paragraph.slice(lastIndex, startOriginal));
    }

    const entry = lookup.get(normalizeTermKey(matched));
    if (entry) {
      nodes.push(
        <Popover key={`${matched}-${startOriginal}`}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 border-b border-dotted border-slate-400 text-slate-900 transition hover:text-slate-600"
            >
              {paragraph.slice(startOriginal, endOriginal)}
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
      nodes.push(paragraph.slice(startOriginal, endOriginal));
    }

    lastIndex = endOriginal;
  }

  if (lastIndex < paragraph.length) {
    nodes.push(paragraph.slice(lastIndex));
  }

  return nodes.length ? nodes : paragraph;
}

function normalizeWithMap(value: string) {
  let normalized = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let index = 0;

  for (const char of value) {
    const start = index;
    const length = char.length;
    index += length;

    const decomposed = char
      .replace(/[œŒ]/g, "oe")
      .replace(/[æÆ]/g, "ae")
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    if (!decomposed) continue;

    for (const outChar of decomposed) {
      normalized += outChar.toLowerCase();
      startMap.push(start);
      endMap.push(start + length);
    }
  }

  return { normalized, startMap, endMap };
}
