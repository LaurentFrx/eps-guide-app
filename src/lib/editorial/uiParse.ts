export type LabelSpec = {
  key: string;
  title: string;
  labels: string[];
};

export type InlineSection = {
  key: string;
  title: string;
  content: string;
};

export type DisplayBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const BULLET_RE = /(^|\n)\s*[-*\u0007\u00B7\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25E6]\s+/g;
const SENTENCE_RE = /[.!?;]\s+/g;

const PLACEHOLDER_TOKENS = new Set([
  "contenu a completer",
  "omission",
  "similaire",
  "identique",
  "identiques",
  "suite des exercices",
  "le",
]);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceLigatures = (value: string) =>
  value
    .replace(/[\u0153\u0152]/g, "oe")
    .replace(/[\u00E6\u00C6]/g, "ae");

const normalizeLabel = (value: string) =>
  replaceLigatures(value)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeForCompare = (value: string) =>
  replaceLigatures(value)
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeForSearch = (value: string) => {
  let normalized = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let index = 0;

  for (const char of value) {
    const start = index;
    const length = char.length;
    index += length;

    let out = replaceLigatures(char)
      .normalize("NFKD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    out = out.replace(/[^a-z0-9:\s]/g, " ");

    if (!out) continue;
    for (const outChar of out) {
      normalized += outChar;
      startMap.push(start);
      endMap.push(start + length);
    }
  }

  return { normalized, startMap, endMap };
};

export const isPlaceholderText = (value?: string) => {
  if (!value) return false;
  return PLACEHOLDER_TOKENS.has(normalizeForCompare(value));
};

export const toDisplayBlocks = (
  text: string,
  mode: "paragraph" | "smartList"
): DisplayBlock[] => {
  if (!text.trim()) return [];

  if (mode === "paragraph") {
    const parts = text.split(/\n{2,}/);
    return parts
      .filter((part) => part.trim())
      .map((part) => ({ type: "paragraph", text: part }));
  }

  const bulletItems = extractBulletItems(text);
  if (bulletItems.length) {
    return [{ type: "list", items: bulletItems }];
  }

  const sentenceItems = extractSentenceItems(text);
  if (sentenceItems.length > 1) {
    return [{ type: "list", items: sentenceItems }];
  }

  return [{ type: "paragraph", text }];
};

export const splitByInlineLabels = (
  text: string,
  labelSpecs: LabelSpec[]
): InlineSection[] => {
  if (!text.trim()) return [];

  const { normalized, startMap, endMap } = normalizeForSearch(text);
  const matches: Array<{
    key: string;
    title: string;
    labelStart: number;
    contentStart: number;
    normIndex: number;
  }> = [];

  for (const spec of labelSpecs) {
    for (const label of spec.labels) {
      const normalizedLabel = normalizeLabel(label);
      if (!normalizedLabel) continue;
      const pattern = normalizedLabel
        .split(/\s+/g)
        .map(escapeRegExp)
        .join("\\s+");
      const regex = new RegExp(`\\b${pattern}\\b\\s*:`, "g");
      let match: RegExpExecArray | null;

      while ((match = regex.exec(normalized)) !== null) {
        const normIndex = match.index ?? 0;
        const endNorm = normIndex + match[0].length;
        const labelStart = startMap[normIndex];
        const contentStart = endMap[endNorm - 1];
        if (labelStart == null || contentStart == null) continue;
        matches.push({
          key: spec.key,
          title: spec.title,
          labelStart,
          contentStart,
          normIndex,
        });
      }
    }
  }

  matches.sort((a, b) => a.normIndex - b.normIndex);

  const sections: InlineSection[] = [];
  const seenKeys = new Set<string>();

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    if (seenKeys.has(current.key)) continue;
    seenKeys.add(current.key);
    const next = matches.slice(i + 1).find((entry) => !seenKeys.has(entry.key));
    const end = next ? next.labelStart : text.length;
    const contentRaw = text.slice(current.contentStart, end);
    if (!contentRaw.trim()) continue;
    sections.push({
      key: current.key,
      title: current.title,
      content: contentRaw,
    });
  }

  return sections;
};

const extractBulletItems = (text: string) => {
  const matches = Array.from(text.matchAll(BULLET_RE));
  if (!matches.length) return [];

  const items: string[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const prefixLength = match[1]?.length ?? 0;
    const start = (match.index ?? 0) + prefixLength;
    const end = matches[i + 1]?.index ?? text.length;
    const item = text.slice(start, end);
    if (item.trim()) items.push(item);
  }
  return items;
};

const extractSentenceItems = (text: string) => {
  const items: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SENTENCE_RE.exec(text)) !== null) {
    const end = match.index + match[0].length;
    const item = text.slice(lastIndex, end);
    if (item.trim()) items.push(item);
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    const item = text.slice(lastIndex);
    if (item.trim()) items.push(item);
  }

  return items;
};
