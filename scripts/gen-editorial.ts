#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { normalizeExerciseCode } from "../src/lib/exerciseCode";
import {
  parseEditorialFile,
  type EditorialParseResult,
} from "./parse-master-editorial";
import {
  parseAuditEditorialReport,
  type AuditEditorialEntry,
} from "./parse-audit-editorial-report";
import {
  normalizeTypography,
  normalizeForCompare,
  splitParagraphs,
  stripReferralPhrases,
} from "./editorial-utils";

type EditorialEntry = {
  materielMd: string;
  consignesMd: string;
  dosageMd: string;
  securiteMd: string;
  detailMd: string;
  fullMdRaw: string;
  complementsMd: string;
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

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "docs", "editorial", "master.fr.md");
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

const SESSION_RE = /^Session\s+([1-5])\b[^\n]*\((\d+)\s+exercices?\)/gim;

const sortCodes = (codes: string[]) =>
  codes.slice().sort((a, b) => {
    const sa = Number(a.slice(1, 2));
    const sb = Number(b.slice(1, 2));
    if (sa !== sb) return sa - sb;
    return Number(a.slice(3)) - Number(b.slice(3));
  });

const logParseContext = (
  parseResult: EditorialParseResult,
  code: string,
  reason: string,
  label: string
) => {
  const lineIndex = parseResult.codeLineMap.get(code);
  if (lineIndex == null) return;
  const start = Math.max(0, lineIndex - 1);
  const end = Math.min(parseResult.lines.length, lineIndex + 2);
  const snippet = parseResult.lines
    .slice(start, end)
    .map((line, idx) => `${start + idx + 1}: ${line}`)
    .join("\n");
  console.warn(`${label}: ${reason} (${code})`);
  console.warn(snippet);
};

const logAuditContext = (
  lines: string[],
  codeLineMap: Map<string, number>,
  code: string,
  reason: string,
  label: string
) => {
  const lineIndex = codeLineMap.get(code);
  if (lineIndex == null) return;
  const start = Math.max(0, lineIndex - 1);
  const end = Math.min(lines.length, lineIndex + 2);
  const snippet = lines
    .slice(start, end)
    .map((line, idx) => `${start + idx + 1}: ${line}`)
    .join("\n");
  console.warn(`${label}: ${reason} (${code})`);
  console.warn(snippet);
};

const sanitizeEditorialText = (value: string) =>
  normalizeTypography(stripReferralPhrases(value));

const toComparable = (value: string) =>
  normalizeForCompare(sanitizeEditorialText(value));

const replaceSegmentContent = (
  segment: string,
  originalContent: string,
  content: string
) => {
  if (!segment || !originalContent) return content;
  const prefix = segment.slice(0, segment.length - originalContent.length);
  return `${prefix}${content}`;
};

const buildUnmappedText = (
  block: string,
  sections: AuditEditorialEntry["sections"]
) => {
  if (!sections.length) return block;
  const ranges = sections
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
    } else if (range.end > last.end) {
      last.end = range.end;
    }
  }

  const parts: string[] = [];
  let cursor = 0;
  for (const range of merged) {
    if (cursor < range.start) {
      parts.push(block.slice(cursor, range.start));
    }
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < block.length) {
    parts.push(block.slice(cursor));
  }
  return parts.join("\n");
};

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

  const auditParse = await parseAuditEditorialReport(inputPath);
  const raw = auditParse.raw;

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

  const auditEntries = auditParse.entries;
  const blocks = new Map<string, AuditEditorialEntry>(
    Object.entries(auditEntries).map(([code, entry]) => [code, entry])
  );

  const extraCodes = Object.keys(auditEntries).filter(
    (code) => !expectedCodes.has(code)
  );
  if (extraCodes.length) {
    extraCodes.forEach((code) => {
      logAuditContext(
        auditParse.lines,
        auditParse.codeLineMap,
        code,
        "code not in expected list",
        path.basename(inputPath)
      );
    });
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
  const fallbackEntriesBefore: Array<{ code: string; fields: string[]; reason: string }> =
    [];
  const fallbackEntries: Array<{ code: string; fields: string[]; reason: string }> =
    [];

  const expectedList = Array.from(expectedCodes).sort((a, b) => {
    const sa = Number(a.slice(1, 2));
    const sb = Number(b.slice(1, 2));
    if (sa !== sb) return sa - sb;
    return Number(a.slice(3)) - Number(b.slice(3));
  });

  const detailOrder: Array<{
    key: string;
    label: string;
    masterKey?: keyof MasterExtraEntry;
    aliases?: string[];
  }> = [
    { key: "description", label: "Description anatomique", masterKey: "description" },
    { key: "anatomie", label: "Anatomie" },
    { key: "muscles", label: "Muscles", masterKey: "muscles" },
    { key: "objectifs", label: "Objectifs fonctionnels", masterKey: "objectifs" },
    { key: "justifications", label: "Justifications biomécaniques", masterKey: "justifications" },
    { key: "benefices", label: "Bénéfices avérés", masterKey: "benefices" },
    {
      key: "contre",
      label: "Contre-indications et adaptations",
      masterKey: "contreIndications",
      aliases: ["securite"],
    },
    {
      key: "progression",
      label: "Progressions / régressions",
      masterKey: "progression",
      aliases: ["regression"],
    },
    { key: "consignes", label: "Consignes pédagogiques", masterKey: "consignes" },
    { key: "dosage", label: "Dosage recommandé", masterKey: "dosage" },
  ];

  const masterParse = await parseEditorialFile(MASTER_PATH);
  const masterEditorial = masterParse.entries;
  const masterCodes = new Set(Object.keys(masterEditorial));
  const sortedMasterCodes = sortCodes(Array.from(masterCodes));
  const sortedAuditCodes = sortCodes(Object.keys(auditEntries));
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
  if (sortedAuditCodes.length) {
    console.log(
      `Parsed audit editorial codes (${sortedAuditCodes.length}): ${sortedAuditCodes.join(
        ", "
      )}`
    );
  } else {
    console.log("Parsed audit editorial codes (0)");
  }
  const extraMasterCodes = sortedMasterCodes.filter(
    (code) => !expectedCodes.has(code)
  );
  if (extraMasterCodes.length) {
    extraMasterCodes.forEach((code) => {
      logParseContext(
        masterParse,
        code,
        "code not in expected list",
        path.basename(MASTER_PATH)
      );
    });
  }

  for (const code of expectedList) {
    const entry = blocks.get(code);
    if (!entry) continue;

    const sectionsByKey = new Map<string, AuditEditorialEntry["sections"][0][]>();
    entry.sections.forEach((section) => {
      const existing = sectionsByKey.get(section.key);
      if (existing) {
        existing.push(section);
      } else {
        sectionsByKey.set(section.key, [section]);
      }
    });

    const getSection = (keys: string[]) =>
      keys.map((key) => sectionsByKey.get(key)?.[0]).find(Boolean);

    const getSections = (keys: string[]) => {
      const keySet = new Set(keys);
      return entry.sections.filter((section) => keySet.has(section.key));
    };

    const materielSection = getSection(["materiel"]);
    const consignesSection = getSection(["consignes"]);
    const dosageSection = getSection(["dosage"]);
    const securiteSection = getSection(["securite", "contre"]);

    const materiel = materielSection?.content ?? "Aucun";
    let consignes =
      consignesSection?.content ??
      extractImplicitSection(
        entry.blockForFields,
        /\bconsignes\b/i,
        /\bdosage\b/i
      ) ??
      "";
    let dosage =
      dosageSection?.content ??
      extractImplicitSection(entry.blockForFields, /\bdosage\b/i) ??
      "";
    let securite = securiteSection?.content ?? "Aucun";

    const fallbackFieldsBefore: string[] = [];
    if (!consignes) fallbackFieldsBefore.push("consignes");
    if (!dosage) fallbackFieldsBefore.push("dosage");
    if (securite === "Aucun") fallbackFieldsBefore.push("securite");
    if (fallbackFieldsBefore.length) {
      fallbackEntriesBefore.push({
        code,
        fields: fallbackFieldsBefore,
        reason: "label absent",
      });
    }

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
      consignes = entry.blockForFields;
      fallbackFields.push("consignes");
    }
    if (!dosage) {
      dosage = entry.blockForFields;
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

    const detailSegments: string[] = [];
    for (const section of detailOrder) {
      const auditSections = getSections([
        section.key,
        ...(section.aliases ?? []),
      ]);
      if (auditSections.length) {
        for (const auditSection of auditSections) {
          if (!auditSection.content.trim()) continue;
          detailSegments.push(
            replaceSegmentContent(
              auditSection.segment,
              auditSection.content,
              auditSection.content
            )
          );
        }
        continue;
      }

      const masterContent =
        section.masterKey && masterEntry?.[section.masterKey]
          ? masterEntry[section.masterKey] ?? ""
          : "";
      if (!masterContent.trim()) continue;
      detailSegments.push(`${section.label} : ${masterContent}`);
    }

    const detailMd = sanitizeEditorialText(detailSegments.join("\n\n"));

    const usedText = [materiel, consignes, dosage, securite, detailMd]
      .filter(Boolean)
      .join("\n\n");
    const usedSet = new Set(
      splitParagraphs(usedText).map((part) => toComparable(part))
    );

    const unmappedText = buildUnmappedText(entry.block, entry.sections);
    const complementPieces = splitParagraphs(unmappedText);
    const complementSet = new Set<string>();
    const complements = complementPieces
      .filter((piece) => {
        const key = toComparable(piece);
        if (!key) return false;
        if (usedSet.has(key)) return false;
        if (complementSet.has(key)) return false;
        complementSet.add(key);
        return true;
      })
      .join("\n\n");

    editorialByCode[code] = {
      materielMd: sanitizeEditorialText(materiel),
      consignesMd: sanitizeEditorialText(consignes),
      dosageMd: sanitizeEditorialText(dosage),
      securiteMd: sanitizeEditorialText(securite),
      detailMd,
      fullMdRaw: sanitizeEditorialText(entry.block),
      complementsMd: sanitizeEditorialText(complements),
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

  console.log(
    `Editorial fallbacks before overrides: ${fallbackEntriesBefore.length}`
  );
  console.log(`Editorial fallbacks after overrides: ${fallbackOutput.length}`);

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
    `  complementsMd: string;\n` +
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


