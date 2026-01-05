#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";
import { loadMasterEditorial } from "./parse-master-editorial";

type EditorialEntry = {
  materielMd: string;
  consignesMd: string;
  dosageMd: string;
  securiteMd: string;
  detailMd: string;
  fullMdRaw: string;
};

type EditorialByCode = Record<string, EditorialEntry>;
type MasterExtraEntry = {
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

type LabelKey =
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

const ROOT = process.cwd();
const INPUT_PATHS = [
  path.join(ROOT, "audit-editorial.report.md"),
  path.join(ROOT, "docs", "editorial", "audit-editorial.report.md"),
];
const OUTPUT_PATH = path.join(ROOT, "src", "lib", "editorial.generated.ts");
const FALLBACK_REPORT_PATH = path.join(
  ROOT,
  "docs",
  "editorial",
  "audit-editorial.fallbacks.json"
);

const BLOCK_CODE_RE = /^(?:#+\s*)?(S[1-5]-\d{2})\b/gm;
const CODE_TOKEN_RE = /\bS[1-5]-\d{2}\b/g;
const RANGE_RE = /\b(S[1-5]-\d{2})\s*(?:a|à|–|-|to)\s*(S[1-5]-\d{2})\b/gi;
const SESSION_RE = /^Session\s+([1-5])\b[^\n]*\((\d+)\s+exercices?\)/gim;
const GLOBAL_SUFFIX_RE = /(?:^|\n)(Conclusion|Sources)\s*:/g;
const LABEL_PATTERNS: Array<{ key: LabelKey; label: string }> = [
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

function normalizeLabelToken(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeForLabelSearch(value: string) {
  let normalized = "";
  const startMap: number[] = [];
  const endMap: number[] = [];
  let index = 0;

  for (const char of value) {
    const start = index;
    const length = char.length;
    index += length;

    let out = char
      .replace(/[œŒ]/g, "oe")
      .replace(/[æÆ]/g, "ae")
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
}

function sliceForFields(block: string): string {
  let cutIndex = block.length;
  let match: RegExpExecArray | null;
  while ((match = GLOBAL_SUFFIX_RE.exec(block)) !== null) {
    if (match.index < cutIndex) {
      cutIndex = match.index;
    }
  }
  return block.slice(0, cutIndex);
}

function parseSections(block: string) {
  const matches: Array<{
    key: LabelKey;
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
    matches.push({ key, labelStart, contentStart, labelStartNorm });
  }

  const sections = new Map<LabelKey, { content: string; segment: string }>();

  matches.sort((a, b) => a.labelStartNorm - b.labelStartNorm);

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const end = next ? next.labelStart : block.length;
    const content = block.slice(current.contentStart, end);
    const segment = block.slice(current.labelStart, end);
    if (!sections.has(current.key)) {
      sections.set(current.key, { content, segment });
    }
  }

  return sections;
}

function extractImplicitSection(
  block: string,
  startPattern: RegExp,
  endPattern?: RegExp
): string | null {
  const startMatch = block.match(startPattern);
  if (!startMatch || startMatch.index == null) return null;
  const start = startMatch.index;
  let end = block.length;

  if (endPattern) {
    const rest = block.slice(start + startMatch[0].length);
    const endMatch = rest.match(endPattern);
    if (endMatch && endMatch.index != null) {
      end = start + startMatch[0].length + endMatch.index;
    }
  }

  return block.slice(start, end);
}

function scoreSummaryLine(line: string): number {
  let score = line.length;
  if (/\bconsignes\b/i.test(line)) score += 1000;
  if (/\bdosage\b/i.test(line)) score += 1000;
  if (/\bsecurite\b/i.test(line)) score += 250;
  if (/\bcontre\b/i.test(line)) score += 250;
  return score;
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
    throw new Error("audit-editorial.report.md not found in expected locations.");
  })();

  const raw = await fs.readFile(inputPath, "utf8");

  const expectedCodes = new Set<string>();
  const sessionCounts = new Map<string, number>();
  let sessionMatch: RegExpExecArray | null;
  while ((sessionMatch = SESSION_RE.exec(raw)) !== null) {
    const session = `S${sessionMatch[1]}`;
    const count = Number(sessionMatch[2]);
    if (!Number.isFinite(count) || count <= 0) continue;
    sessionCounts.set(session, count);
  }

  if (!sessionCounts.size) {
    throw new Error("No session headers found in audit-editorial.report.md.");
  }

  for (const [session, count] of sessionCounts.entries()) {
    for (let i = 1; i <= count; i += 1) {
      expectedCodes.add(
        normalizeExerciseCode(`${session}-${String(i).padStart(2, "0")}`)
      );
    }
  }

  if (expectedCodes.size !== 70) {
    throw new Error(`Expected 70 codes from session headers, got ${expectedCodes.size}.`);
  }

  const matches: Array<{ code: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = BLOCK_CODE_RE.exec(raw)) !== null) {
    matches.push({ code: match[1], index: match.index });
  }

  if (!matches.length) {
    throw new Error("No exercise codes found in audit-editorial.report.md.");
  }

  const blocks = new Map<string, string>();
  const blockSources = new Map<string, "explicit" | "summary">();
  const duplicates: string[] = [];

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const start = current.index;
    const end = next ? next.index : raw.length;
    const block = raw.slice(start, end);
    const normalized = normalizeExerciseCode(current.code);
    if (!isValidExerciseCode(normalized)) {
      continue;
    }
    if (blocks.has(normalized)) {
      duplicates.push(normalized);
      continue;
    }
    blocks.set(normalized, block);
    blockSources.set(normalized, "explicit");
  }

  if (duplicates.length) {
    throw new Error(`Duplicate editorial blocks found: ${duplicates.join(", ")}`);
  }

  const lines = raw.split("\n");
  for (const line of lines) {
    const rangeMatches = Array.from(line.matchAll(RANGE_RE));
    const codeMatches = line.match(CODE_TOKEN_RE) ?? [];

    if (codeMatches.length < 2 && rangeMatches.length === 0) continue;

    const codes = new Set<string>();
    for (const code of codeMatches) {
      const normalized = normalizeExerciseCode(code);
      if (isValidExerciseCode(normalized)) {
        codes.add(normalized);
      }
    }

    for (const range of rangeMatches) {
      const start = normalizeExerciseCode(range[1]);
      const end = normalizeExerciseCode(range[2]);
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
      const existing = blocks.get(code);
      const existingSource = blockSources.get(code);
      if (!existing) {
        blocks.set(code, line);
        blockSources.set(code, "summary");
        continue;
      }
      if (existingSource === "explicit") continue;

      const existingScore = scoreSummaryLine(existing);
      const newScore = scoreSummaryLine(line);
      if (newScore > existingScore) {
        blocks.set(code, line);
        blockSources.set(code, "summary");
      }
    }
  }

  const extraCodes = Array.from(blocks.keys()).filter(
    (code) => !expectedCodes.has(code)
  );
  if (extraCodes.length) {
    throw new Error(`Unexpected codes in editorial source: ${extraCodes.join(", ")}`);
  }

  const missingCodes = Array.from(expectedCodes).filter(
    (code) => !blocks.has(code)
  );
  if (missingCodes.length) {
    throw new Error(`Missing editorial blocks for: ${missingCodes.join(", ")}`);
  }

  const editorialByCode: EditorialByCode = {};
  const masterExtraByCode: Record<string, MasterExtraEntry> = {};
  const fallbackEntries: Array<{ code: string; fields: string[]; reason: string }> =
    [];

  const expectedList = Array.from(expectedCodes).sort((a, b) => {
    const sa = Number(a.slice(1, 2));
    const sb = Number(b.slice(1, 2));
    if (sa !== sb) return sa - sb;
    return Number(a.slice(3)) - Number(b.slice(3));
  });

  const masterEditorial = await loadMasterEditorial();
  const masterCodes = new Set(Object.keys(masterEditorial));
  const sortedMasterCodes = Array.from(masterCodes).sort((a, b) => {
    const sa = Number(a.slice(1, 2));
    const sb = Number(b.slice(1, 2));
    if (sa !== sb) return sa - sb;
    return Number(a.slice(3)) - Number(b.slice(3));
  });
  if (!masterCodes.size) {
    console.warn("No master editorial blocks found in master.fr.md.");
  } else if (masterCodes.size < expectedCodes.size) {
    const missing = expectedList.filter((code) => !masterCodes.has(code));
    if (missing.length) {
      console.warn(
        `Master editorial missing codes (${missing.length}): ${missing.join(", ")}`
      );
    }
  }
  if (sortedMasterCodes.length) {
    console.log(
      `Parsed master editorial codes (${sortedMasterCodes.length}): ${sortedMasterCodes.join(
        ", "
      )}`
    );
  } else {
    console.log("Parsed master editorial codes (0)");
  }

  for (const code of expectedList) {
    const block = blocks.get(code);
    if (!block) continue;
    const blockForFields = sliceForFields(block);
    const sections = parseSections(blockForFields);
    const materiel = sections.get("materiel")?.content ?? "Aucun";
    let consignes =
      sections.get("consignes")?.content ??
      extractImplicitSection(blockForFields, /\bconsignes\b/i, /\bdosage\b/i) ??
      "";
    let dosage =
      sections.get("dosage")?.content ??
      extractImplicitSection(blockForFields, /\bdosage\b/i) ??
      "";
    let securite =
      sections.get("securite")?.content ??
      sections.get("contre")?.content ??
      "Aucun";
    const masterEntry = masterEditorial[code];
    if (masterEntry?.consignes) {
      consignes = masterEntry.consignes;
    }
    if (masterEntry?.dosage) {
      dosage = masterEntry.dosage;
    }
    if (masterEntry?.contreIndications) {
      const masterSecurite = masterEntry.contreIndications;
      if (masterSecurite.trim()) {
        securite = masterSecurite;
      }
    }
    if (masterEntry) {
      const extra: MasterExtraEntry = {};
      if (masterEntry.description?.trim()) extra.description = masterEntry.description;
      if (masterEntry.muscles?.trim()) extra.muscles = masterEntry.muscles;
      if (masterEntry.objectifs?.trim()) extra.objectifs = masterEntry.objectifs;
      if (masterEntry.justifications?.trim())
        extra.justifications = masterEntry.justifications;
      if (masterEntry.benefices?.trim()) extra.benefices = masterEntry.benefices;
      if (masterEntry.contreIndications?.trim())
        extra.contreIndications = masterEntry.contreIndications;
      if (masterEntry.progression?.trim()) extra.progression = masterEntry.progression;
      if (masterEntry.consignes?.trim()) extra.consignes = masterEntry.consignes;
      if (masterEntry.dosage?.trim()) extra.dosage = masterEntry.dosage;
      if (Object.keys(extra).length) {
        masterExtraByCode[code] = extra;
      }
    }

    const fallbackFields: string[] = [];
    if (!consignes) {
      consignes = blockForFields;
      fallbackFields.push("consignes");
    }
    if (!dosage) {
      dosage = blockForFields;
      fallbackFields.push("dosage");
    }
    if (securite === "Aucun") {
      fallbackFields.push("securite");
    }
    if (fallbackFields.length) {
      fallbackEntries.push({
        code,
        fields: fallbackFields,
        reason: "label absent",
      });
    }

    editorialByCode[code] = {
      materielMd: materiel,
      consignesMd: consignes,
      dosageMd: dosage,
      securiteMd: securite,
      detailMd: blockForFields,
      fullMdRaw: block,
    };
  }

  const codeCount = Object.keys(editorialByCode).length;
  if (codeCount !== expectedCodes.size) {
    throw new Error(`Expected ${expectedCodes.size} codes, got ${codeCount}.`);
  }

  const fallbackOutput = fallbackEntries
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((entry) => ({
      code: entry.code,
      fields: entry.fields.slice().sort(),
      reason: entry.reason,
    }));

  await fs.mkdir(path.dirname(FALLBACK_REPORT_PATH), { recursive: true });
  await fs.writeFile(
    FALLBACK_REPORT_PATH,
    JSON.stringify(fallbackOutput, null, 2),
    "utf8"
  );

  if (fallbackOutput.length) {
    console.warn(
      `Editorial fallback used for: ${fallbackOutput
        .map((entry) => `${entry.code} (${entry.fields.join(", ")})`)
        .join(", ")}`
    );
  }

  const sample = editorialByCode["S5-10"];
  if (!sample) {
    throw new Error("Missing S5-10 in editorialByCode.");
  }

  const serialized = JSON.stringify(editorialByCode, null, 2);
  const masterSerialized = JSON.stringify(masterExtraByCode, null, 2);
  const output =
    `/* This file is auto-generated by scripts/gen-editorial.ts. Do not edit manually. */\n` +
    `export type EditorialByCode = Record<string, {\n` +
    `  materielMd: string;\n` +
    `  consignesMd: string;\n` +
    `  dosageMd: string;\n` +
    `  securiteMd: string;\n` +
    `  detailMd: string;\n` +
    `  fullMdRaw: string;\n` +
    `}>;\n\n` +
    `export const editorialByCode: EditorialByCode = ${serialized};\n\n` +
    `export type MasterEditorialByCode = Record<string, {\n` +
    `  description?: string;\n` +
    `  muscles?: string;\n` +
    `  objectifs?: string;\n` +
    `  justifications?: string;\n` +
    `  benefices?: string;\n` +
    `  contreIndications?: string;\n` +
    `  progression?: string;\n` +
    `  consignes?: string;\n` +
    `  dosage?: string;\n` +
    `}>;\n\n` +
    `export const masterEditorialByCode: MasterEditorialByCode = ${masterSerialized};\n`;

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, output, "utf8");

  console.log(`Parsed editorial codes: ${codeCount}`);
  console.log(
    `S5-10 lengths: consignes=${sample.consignesMd.length}, dosage=${sample.dosageMd.length}, securite=${sample.securiteMd.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
