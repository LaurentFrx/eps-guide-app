import fs from "fs/promises";
import path from "path";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";

export type MasterEditorialEntry = {
  description?: string;
  muscles?: string;
  objectifs?: string;
  justifications?: string;
  benefices?: string;
  contreIndications?: string;
  progression?: string;
  consignes?: string;
  dosage?: string;
};

export type MasterEditorialByCode = Record<string, MasterEditorialEntry>;

export type EditorialParseResult = {
  entries: MasterEditorialByCode;
  lines: string[];
  codeLineMap: Map<string, number>;
};

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "docs", "editorial", "master.fr.md");
const BLOCK_CODE_RE =
  /^\s*\d*\s*(?:#+\s*)?(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/gm;

const LABEL_MAP = new Map<string, keyof MasterEditorialEntry>([
  ["description", "description"],
  ["description anatomique", "description"],
  ["anatomy", "description"],
  ["muscles", "muscles"],
  ["objectif", "objectifs"],
  ["objectifs", "objectifs"],
  ["objective", "objectifs"],
  ["objectifs fonctionnels", "objectifs"],
  ["justification", "justifications"],
  ["justifications", "justifications"],
  ["justifications biomecaniques", "justifications"],
  ["benefices", "benefices"],
  ["benefices averes", "benefices"],
  ["contre indications", "contreIndications"],
  ["contre indications et adaptations", "contreIndications"],
  ["contre indications adaptations", "contreIndications"],
  ["contreindications", "contreIndications"],
  ["securite", "contreIndications"],
  ["safety", "contreIndications"],
  ["progression", "progression"],
  ["progressions", "progression"],
  ["progressions regressions", "progression"],
  ["progression regressions", "progression"],
  ["progression regression", "progression"],
  ["progressions regression", "progression"],
  ["progress", "progression"],
  ["regress", "progression"],
  ["regression", "progression"],
  ["regressions", "progression"],
  ["consignes", "consignes"],
  ["consignes cles", "consignes"],
  ["consignes pedagogiques", "consignes"],
  ["key points", "consignes"],
  ["key_points", "consignes"],
  ["dosage", "dosage"],
  ["dosage recommande", "dosage"],
]);

const normalizeLabel = (value: string) =>
  value
    .replace(/[\u0153\u0152]/g, "oe")
    .replace(/[\u00E6\u00C6]/g, "ae")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const labelLookup = new Map(
  Array.from(LABEL_MAP.entries()).map(([label, key]) => [normalizeLabel(label), key])
);

const normalizeCodeToken = (value: string) =>
  value.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-");

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

const logCodeContext = (
  lines: string[],
  lineIndex: number,
  reason: string,
  fileLabel: string
) => {
  const start = Math.max(0, lineIndex - 1);
  const end = Math.min(lines.length, lineIndex + 2);
  const snippet = lines
    .slice(start, end)
    .map((line, idx) => `${start + idx + 1}: ${line}`)
    .join("\n");
  console.warn(`${fileLabel}: parse warning (${reason})`);
  console.warn(snippet);
};

const parseBlock = (block: string): MasterEditorialEntry => {
  const lines = block.split(/\r?\n/);
  const entry: MasterEditorialEntry = {};
  let currentKey: keyof MasterEditorialEntry | null = null;
  let buffer: string[] = [];

  const commit = () => {
    if (!currentKey) return;
    const value = buffer.join("\n").trim();
    if (!value) return;
    if (entry[currentKey]) {
      entry[currentKey] = `${entry[currentKey]}\n${value}`;
    } else {
      entry[currentKey] = value;
    }
  };

  for (const line of lines) {
    const match = line.match(/^([^:]+):(.*)$/);
    if (match) {
      const label = normalizeLabel(match[1]);
      const key = labelLookup.get(label);
      if (key) {
        commit();
        currentKey = key;
        buffer = [];
        const rest = match[2];
        if (rest.length) buffer.push(rest.trimStart());
        continue;
      }
    }

    if (currentKey) buffer.push(line);
  }

  commit();
  return entry;
};

export async function parseEditorialFile(
  filePath: string
): Promise<EditorialParseResult> {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const lineOffsets = buildLineOffsets(raw);
  const matches: Array<{ code: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = BLOCK_CODE_RE.exec(raw)) !== null) {
    matches.push({ code: match[1], index: match.index });
  }

  if (!matches.length) {
    return { entries: {}, lines, codeLineMap: new Map() };
  }

  const blocks = new Map<string, string>();
  const duplicates: string[] = [];
  const invalidCodes: Array<{ code: string; lineIndex: number }> = [];
  const codeLineMap = new Map<string, number>();
  const fileLabel = path.basename(filePath);

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index;
    const end = next ? next.index : raw.length;
    const rawCode = normalizeCodeToken(current.code);
    const code = normalizeExerciseCode(rawCode);
    if (!isValidExerciseCode(code)) {
      const lineIndex = findLineIndex(lineOffsets, current.index);
      invalidCodes.push({ code: rawCode, lineIndex });
      continue;
    }
    if (blocks.has(code)) {
      duplicates.push(code);
      continue;
    }
    codeLineMap.set(code, findLineIndex(lineOffsets, current.index));
    blocks.set(code, raw.slice(start, end));
  }

  invalidCodes.forEach(({ code, lineIndex }) => {
    logCodeContext(lines, lineIndex, `invalid code: ${code}`, fileLabel);
  });

  if (duplicates.length) {
    duplicates.forEach((code) => {
      const matchIndex = matches.find((entry) => normalizeCodeToken(entry.code) === code)
        ?.index;
      if (matchIndex == null) return;
      const lineIndex = findLineIndex(lineOffsets, matchIndex);
      logCodeContext(lines, lineIndex, `duplicate code: ${code}`, fileLabel);
    });
    throw new Error(`Duplicate editorial blocks in ${fileLabel}: ${duplicates.join(", ")}`);
  }

  const output: MasterEditorialByCode = {};
  for (const [code, block] of blocks.entries()) {
    const entry = parseBlock(block);
    if (Object.keys(entry).length) {
      output[code] = entry;
    }
  }

  return { entries: output, lines, codeLineMap };
}

export async function loadMasterEditorial(): Promise<MasterEditorialByCode> {
  const result = await parseEditorialFile(MASTER_PATH);
  return result.entries;
}
