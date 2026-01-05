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

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "docs", "editorial", "master.fr.md");
const BLOCK_CODE_RE = /^(?:#+\s*)?(S[1-5]-\d{2})\b/gm;

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

export async function loadMasterEditorial(): Promise<MasterEditorialByCode> {
  const raw = await fs.readFile(MASTER_PATH, "utf8");
  const matches: Array<{ code: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = BLOCK_CODE_RE.exec(raw)) !== null) {
    matches.push({ code: match[1], index: match.index });
  }

  if (!matches.length) return {};

  const blocks = new Map<string, string>();
  const duplicates: string[] = [];

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index;
    const end = next ? next.index : raw.length;
    const code = normalizeExerciseCode(current.code);
    if (!isValidExerciseCode(code)) continue;
    if (blocks.has(code)) {
      duplicates.push(code);
      continue;
    }
    blocks.set(code, raw.slice(start, end));
  }

  if (duplicates.length) {
    throw new Error(`Duplicate master editorial blocks: ${duplicates.join(", ")}`);
  }

  const output: MasterEditorialByCode = {};
  for (const [code, block] of blocks.entries()) {
    const entry = parseBlock(block);
    if (Object.keys(entry).length) {
      output[code] = entry;
    }
  }

  return output;
}
