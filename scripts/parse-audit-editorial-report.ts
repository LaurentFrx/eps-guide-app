#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";
import {
  normalizeLineEndings,
  stripTrailingWhitespace,
  splitParagraphs,
} from "./editorial-utils";

export type AuditSectionKey =
  | "materiel"
  | "consignes"
  | "dosage"
  | "securite"
  | "contre"
  | "description"
  | "objectifs"
  | "justifications"
  | "benefices"
  | "progression"
  | "regression"
  | "muscles"
  | "anatomie";

export type AuditSection = {
  key: AuditSectionKey;
  label: string;
  content: string;
  segment: string;
  start: number;
  end: number;
};

export type AuditEditorialEntry = {
  code: string;
  block: string;
  blockForFields: string;
  sections: AuditSection[];
  paragraphs: string[];
  source: "explicit" | "summary";
};

export type AuditParseResult = {
  raw: string;
  lines: string[];
  codeLineMap: Map<string, number>;
  entries: Record<string, AuditEditorialEntry>;
};

const ROOT = process.cwd();
const INPUT_PATHS = [
  path.join(ROOT, "docs", "editorial", "audit-editorial.report.md"),
  path.join(ROOT, "audit-editorial.report.md"),
];

const BLOCK_CODE_RE =
  /^\s*\d*\s*(?:#+\s*)?(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/gm;
const CODE_TOKEN_RE = /\bS[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2}\b/g;
const RANGE_RE =
  /\b(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\s*(?:a|\u00E0|-|to)\s*(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/gi;
const GLOBAL_SUFFIX_RE = /(?:^|\n)(Conclusion|Sources)\s*:/g;

const LABEL_PATTERNS: Array<{ key: AuditSectionKey; label: string }> = [
  { key: "materiel", label: "materiel" },
  { key: "materiel", label: "materiels" },
  { key: "consignes", label: "consignes" },
  { key: "consignes", label: "consignes cles" },
  { key: "consignes", label: "consignes pedagogiques" },
  { key: "dosage", label: "dosage recommande" },
  { key: "dosage", label: "dosage" },
  { key: "securite", label: "securite" },
  { key: "contre", label: "contre indications" },
  { key: "contre", label: "contre indications et adaptations" },
  { key: "description", label: "description anatomique" },
  { key: "description", label: "description" },
  { key: "objectifs", label: "objectifs fonctionnels" },
  { key: "objectifs", label: "objectifs" },
  { key: "justifications", label: "justifications biomecaniques" },
  { key: "justifications", label: "justifications" },
  { key: "benefices", label: "benefices averes" },
  { key: "benefices", label: "benefices" },
  { key: "progression", label: "progressions regressions" },
  { key: "progression", label: "progressions / regressions" },
  { key: "progression", label: "progressions" },
  { key: "regression", label: "regressions" },
  { key: "progression", label: "progression" },
  { key: "regression", label: "regression" },
  { key: "muscles", label: "muscles" },
  { key: "anatomie", label: "anatomie" },
];

const LABEL_PATTERN_LOOKUP = new Map(
  LABEL_PATTERNS.map((entry) => [entry.label, entry.key])
);

const LABEL_PATTERN_REGEX = new RegExp(
  `\\b(${LABEL_PATTERNS.map((entry) => entry.label)
    .sort((a, b) => b.length - a.length)
    .map((label) => label.replace(/\s+/g, "\\s+"))
    .join("|")})\\b\\s*:`,
  "gi"
);

const normalizeCodeToken = (value: string) =>
  value.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-");

const normalizeLabelToken = (value: string) =>
  value.replace(/\s+/g, " ").trim().toLowerCase();

const normalizeForLabelSearch = (value: string) => {
  let normalized = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let index = 0;

  for (const char of value) {
    const start = index;
    const length = char.length;
    index += length;

    let out = char
      .replace(/[\u0153\u0152]/g, "oe")
      .replace(/[\u00E6\u00C6]/g, "ae")
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

const buildLineOffsets = (value: string) => {
  const offsets = [0];
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === "\n") offsets.push(i + 1);
  }
  return offsets;
};

const findLineIndex = (offsets: number[], index: number) => {
  let low = 0;
  let high = offsets.length - 1;
  let result = 0;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (offsets[mid] <= index) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
};

const sliceForFields = (block: string): string => {
  let cutIndex = block.length;
  let match: RegExpExecArray | null;
  while ((match = GLOBAL_SUFFIX_RE.exec(block)) !== null) {
    if (match.index < cutIndex) {
      cutIndex = match.index;
    }
  }
  return block.slice(0, cutIndex);
};

const parseSections = (block: string): AuditSection[] => {
  const matches: Array<{
    key: AuditSectionKey;
    label: string;
    labelStart: number;
    contentStart: number;
    labelStartNorm: number;
  }> = [];

  const { normalized, startMap, endMap } = normalizeForLabelSearch(block);
  let match: RegExpExecArray | null;
  while ((match = LABEL_PATTERN_REGEX.exec(normalized)) !== null) {
    const labelRaw = normalizeLabelToken(match[1]);
    const key = LABEL_PATTERN_LOOKUP.get(labelRaw);
    if (!key) continue;
    const labelStartNorm = match.index;
    const contentStartNorm = match.index + match[0].length;
    const labelStart = startMap[labelStartNorm];
    const contentStart = endMap[contentStartNorm - 1];
    if (labelStart == null || contentStart == null) continue;
    matches.push({
      key,
      label: match[1],
      labelStart,
      contentStart,
      labelStartNorm,
    });
  }

  matches.sort((a, b) => a.labelStartNorm - b.labelStartNorm);

  const sections: AuditSection[] = [];
  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const end = next ? next.labelStart : block.length;
    const content = block.slice(current.contentStart, end);
    const segment = block.slice(current.labelStart, end);
    sections.push({
      key: current.key,
      label: current.label,
      content,
      segment,
      start: current.labelStart,
      end,
    });
  }

  return sections;
};

export async function parseAuditEditorialReport(
  filePath: string
): Promise<AuditParseResult> {
  const rawInput = await fs.readFile(filePath, "utf8");
  const raw = stripTrailingWhitespace(normalizeLineEndings(rawInput));
  const lines = raw.split("\n");
  const lineOffsets = buildLineOffsets(raw);

  const matches: Array<{ code: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = BLOCK_CODE_RE.exec(raw)) !== null) {
    matches.push({ code: match[1], index: match.index });
  }

  const codeLineMap = new Map<string, number>();
  const entries: Record<string, AuditEditorialEntry> = {};

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index;
    const end = next ? next.index : raw.length;
    const rawCode = normalizeCodeToken(current.code);
    const code = normalizeExerciseCode(rawCode);
    if (!isValidExerciseCode(code)) continue;
    if (entries[code]) continue;
    codeLineMap.set(code, findLineIndex(lineOffsets, current.index));
    const block = raw.slice(start, end);
    const blockForFields = sliceForFields(block);
    const sections = parseSections(blockForFields);
    const paragraphs = splitParagraphs(block);
    entries[code] = {
      code,
      block,
      blockForFields,
      sections,
      paragraphs,
      source: "explicit",
    };
  }

  for (const line of lines) {
    const rangeMatches = Array.from(line.matchAll(RANGE_RE));
    const codeMatches = line.match(CODE_TOKEN_RE) ?? [];

    if (codeMatches.length < 2 && rangeMatches.length === 0) continue;

    const codes = new Set<string>();
    for (const code of codeMatches) {
      const normalized = normalizeExerciseCode(normalizeCodeToken(code));
      if (isValidExerciseCode(normalized)) {
        codes.add(normalized);
      }
    }

    for (const range of rangeMatches) {
      const start = normalizeExerciseCode(normalizeCodeToken(range[1]));
      const end = normalizeExerciseCode(normalizeCodeToken(range[2]));
      if (!isValidExerciseCode(start) || !isValidExerciseCode(end)) continue;
      const session = start.slice(0, 2);
      if (session !== end.slice(0, 2)) continue;
      const startNum = Number(start.slice(3));
      const endNum = Number(end.slice(3));
      if (!Number.isFinite(startNum) || !Number.isFinite(endNum)) continue;
      const min = Math.min(startNum, endNum);
      const max = Math.max(startNum, endNum);
      for (let i = min; i <= max; i += 1) {
        codes.add(normalizeExerciseCode(`${session}-${String(i).padStart(2, "0")}`));
      }
    }

    for (const code of codes) {
      if (entries[code]) continue;
      const block = line;
      const blockForFields = sliceForFields(block);
      const sections = parseSections(blockForFields);
      const paragraphs = splitParagraphs(block);
      entries[code] = {
        code,
        block,
        blockForFields,
        sections,
        paragraphs,
        source: "summary",
      };
    }
  }

  return { raw, lines, codeLineMap, entries };
}

async function main() {
  const inputPath = await (async () => {
    for (const candidate of INPUT_PATHS) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }
    throw new Error("audit-editorial.report.md not found.");
  })();

  const result = await parseAuditEditorialReport(inputPath);
  const output = {
    codes: Object.keys(result.entries).sort(),
    entries: result.entries,
  };

  const outputPath = path.join(
    ROOT,
    "reports",
    "audit-editorial.parsed.json"
  );
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `Parsed audit editorial codes (${output.codes.length}). Output: ${outputPath}`
  );
}

if (process.argv[1] && process.argv[1].endsWith("parse-audit-editorial-report.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
