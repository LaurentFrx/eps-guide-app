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
import { applyEditorialOverrides } from "./editorial-overrides";
import {
  SESSION_IDS,
  type SessionId,
} from "../src/lib/editorial/sessionsBase";

type EditorialEntry = {
  materielMd: string;
  consignesMd: string;
  dosageMd: string;
  securiteMd: string;
  detailMd: string;
  fullMdRaw: string;
  complementsMd: string;
  auditSummaryMd: string;
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
const SESSION_OUTPUT_PATH = path.join(
  ROOT,
  "src",
  "lib",
  "editorial",
  "sessions.generated.ts"
);
const GUIDE_OUTPUT_PATH = path.join(ROOT, "src", "data", "editorial.fr.json");
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

const stripOmissionPrefix = (value: string) => {
  const trimmed = value.trim();
  const hadWrapper = trimmed.startsWith("(") && trimmed.includes("Omission");
  let output = value.replace(
    /(^|\n)\s*\(?\s*Omission\s*[-\u2013\u2014]\s*/g,
    "$1"
  );
  if (hadWrapper) {
    output = output.replace(/^\s*\(/, "").replace(/\)\s*$/, "");
  }
  return output;
};

const sanitizeEditorialText = (value: string) =>
  normalizeTypography(stripReferralPhrases(stripOmissionPrefix(value)));

const STRIP_REF_PARENS_RE =
  /\([^)]*\b(?:idem|identique|similaire)[^)]*S[1-5]-\d{2}[^)]*\)/gi;
const EST_SIM_RE =
  /\best\s+(?:similaire|identique)\s+(?:à|a|au|aux)\s+S[1-5]-\d{2}\b/gi;
const SONT_SIM_RE =
  /\bsont\s+(?:similaires|identiques)\s+(?:à|a|au|aux)\s+S[1-5]-\d{2}\b/gi;
const CODE_REF_RE = /\b(?:à|a|au|aux)?\s*(S[1-5]-\d{2})\b/gi;

const stripForeignExerciseCodes = (value: string, code: string) => {
  const normalizedCode = normalizeExerciseCode(code);
  return value.replace(CODE_REF_RE, (match, rawCode) => {
    const normalized = normalizeExerciseCode(rawCode);
    if (!normalized) return "";
    if (normalized === normalizedCode) return match;
    return "";
  });
};

const sanitizeExerciseText = (value: string, code: string) => {
  let output = stripOmissionPrefix(value);
  output = output.replace(STRIP_REF_PARENS_RE, "");
  output = output.replace(EST_SIM_RE, "est comparable");
  output = output.replace(SONT_SIM_RE, "sont comparables");
  output = stripReferralPhrases(output);
  output = stripForeignExerciseCodes(output, code);
  output = output.replace(/\bcomparables?\s+à(?=\s*[.,;:]|$)/gi, "comparables");
  output = output.replace(/\bcomparable\s+à(?=\s*[.,;:]|$)/gi, "comparable");
  output = output.replace(
    /\bcomparables?\s+(?!à|a|au|aux|de|du|des|d')([a-zA-Z][\w-]*)/gi,
    (_match, noun) => `comparables au ${noun}`
  );
  output = output.replace(
    /\bcomparable\s+(?!à|a|au|aux|de|du|des|d')([a-zA-Z][\w-]*)/gi,
    (_match, noun) => `comparable au ${noun}`
  );
  output = output.replace(
    /(Contre-indications(?: et adaptations)?\s*:)\s*comparables?\s*\.\s*/gi,
    "$1 "
  );
  output = output.replace(/\(\s*coudes?\s*\)/gi, "sur coudes");
  output = output.replace(/\bpar\s+sur\s+coudes\b/gi, "par une planche sur coudes");
  output = output.replace(/\(\s*\)/g, "");
  output = output.replace(/:\s*,/g, ": ");
  output = output.replace(/\s+,/g, ",");
  output = output.replace(/\s+;/g, ";");
  output = output.replace(/\s+:/g, ":");
  output = output.replace(/\s+\./g, ".");
  output = output.replace(/:\s*\n\s*\n(?=\S)/g, ": ");
  return normalizeTypography(output);
};

const toComparable = (value: string) =>
  normalizeForCompare(normalizeTypography(value));

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

const REF_CODE_RE = /\bS[1-5]\s*[-_\u2010\u2011\u2012\u2013\u2014]?\s*\d{1,2}\b/gi;
const REF_MARKER_RE =
  /\b(idem|id\.|identique(?:s)?|similaire(?:s)?|voir|cf\.?|ref\.?|reference|m(?:e|\u00EA)me\s+exercice|se\s+r(?:e|\u00E9)f(?:e|\u00E9)rer)\b/i;
const OMISSION_PREFIX_RE = /^\s*\(?\s*Omission\s*[-\u2013\u2014]\s*/i;
const CODE_LINE_RE = /^\s*\(?S[1-5]\s*[-_\u2010\u2011\u2012\u2013\u2014]?\s*\d{1,2}\b.*$/;

const normalizeRefCode = (value: string) =>
  normalizeExerciseCode(value.replace(/[\s_\u2010\u2011\u2012\u2013\u2014]+/g, "-"));

const extractReferenceCodes = (value: string) => {
  const matches = value.match(REF_CODE_RE) ?? [];
  const codes = matches
    .map((match) => normalizeRefCode(match))
    .filter(Boolean);
  return Array.from(new Set(codes));
};

const stripExerciseHeader = (value: string) => {
  const lines = value.split("\n");
  if (lines.length && CODE_LINE_RE.test(lines[0])) {
    lines.shift();
  }
  return lines.join("\n").trim();
};

const buildCodePattern = (code: string) =>
  code.replace(/^S/, "S\\s*").replace("-", "\\s*[-_\\u2010\\u2011\\u2012\\u2013\\u2014]?\\s*");

const stripReferencePhrases = (value: string, codes: string[]) => {
  let output = value;
  output = output.replace(OMISSION_PREFIX_RE, "");
  if (output.startsWith("(") && output.endsWith(")")) {
    output = output.slice(1, -1);
  }
  for (const code of codes) {
    const codePattern = buildCodePattern(code);
    const markerToken =
      "(?:idem|id\\.|identique|identiques|similaire|similaires|voir|cf\\.?|ref\\.?|reference|m(?:e|\\u00EA)me\\s+exercice|se\\s+r(?:e|\\u00E9)f(?:e|\\u00E9)rer)";
    const prepToken = "(?:a|\\u00E0|au|aux|de|d'|du|des)";
    const patterns = [
      new RegExp(`${markerToken}\\s+(?:${prepToken}\\s+)?${codePattern}`, "gi"),
      new RegExp(`(?:exercice|exo|fiche)\\s+${codePattern}`, "gi"),
      new RegExp(codePattern, "gi"),
    ];
    patterns.forEach((pattern) => {
      output = output.replace(pattern, "");
    });
  }
  output = output.replace(REF_MARKER_RE, "");
  output = output
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/^[\s,.;:!?\u2013\u2014-]+/, "")
    .replace(/[\s,.;:!?\u2013\u2014-]+$/, "");
  return output.trim();
};


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
    {
      key: "description",
      label: "Description anatomique",
      masterKey: "description",
    },
    { key: "anatomie", label: "Anatomie" },
    { key: "muscles", label: "Muscles", masterKey: "muscles" },
    {
      key: "objectifs",
      label: "Objectifs fonctionnels",
      masterKey: "objectifs",
    },
    {
      key: "justifications",
      label: "Justifications biomécaniques",
      masterKey: "justifications",
    },
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
    {
      key: "consignes",
      label: "Consignes pédagogiques",
      masterKey: "consignes",
    },
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
      fallbackFields.push("consignes");
    }
    if (!dosage) {
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
    const isSummaryEntry = entry.source === "summary";
    for (const section of detailOrder) {
      const auditSections = getSections([
        section.key,
        ...(section.aliases ?? []),
      ]);
      if (auditSections.length) {
        for (const auditSection of auditSections) {
          const segment = auditSection.segment.trim();
          if (!segment) continue;
          detailSegments.push(segment);
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

    const detailMd = sanitizeExerciseText(detailSegments.join("\n\n"), code);
    const auditSummary = auditParse.summaryByCode[code] ?? "";

    const usedText = [materiel, consignes, dosage, securite, detailMd]
      .filter(Boolean)
      .join("\n\n");
    const usedSet = new Set(
      splitParagraphs(usedText).map((part) => toComparable(part))
    );

    const unmappedText = isSummaryEntry
      ? ""
      : stripExerciseHeader(buildUnmappedText(entry.block, entry.sections));
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

    const sanitizeExercise = (value: string) =>
      sanitizeExerciseText(value, code);

    editorialByCode[code] = {
      materielMd: sanitizeExercise(materiel),
      consignesMd: sanitizeExercise(consignes),
      dosageMd: sanitizeExercise(dosage),
      securiteMd: sanitizeExercise(securite),
      detailMd,
      fullMdRaw: isSummaryEntry ? "" : sanitizeExercise(entry.block),
      complementsMd: isSummaryEntry ? "" : sanitizeExercise(complements),
      auditSummaryMd: sanitizeExercise(auditSummary),
    };
  }

  applyEditorialOverrides(editorialByCode, sanitizeExerciseText);

  const rawEditorialByCode: EditorialByCode = {};
  for (const [code, entry] of Object.entries(editorialByCode)) {
    rawEditorialByCode[code] = { ...entry };
  }

  const resolvedCache = new Map<string, string>();
  const resolveField = (
    code: string,
    field: keyof EditorialEntry,
    stack: string[] = []
  ): string => {
    const key = `${code}:${field}`;
    const cached = resolvedCache.get(key);
    if (cached != null) return cached;
    if (stack.includes(key)) {
      throw new Error(`Cross-reference cycle detected: ${[...stack, key].join(" -> ")}`);
    }
    const rawEntry = rawEditorialByCode[code];
    if (!rawEntry) {
      resolvedCache.set(key, "");
      return "";
    }
    const rawValue = rawEntry[field] ?? "";
    if (!rawValue.trim()) {
      resolvedCache.set(key, "");
      return "";
    }
    const refCodes = extractReferenceCodes(rawValue).filter((ref) => ref !== code);
    const hasMarker = REF_MARKER_RE.test(rawValue) || refCodes.length > 0;
    if (!hasMarker) {
      resolvedCache.set(key, rawValue);
      return rawValue;
    }

    const cleaned = stripReferencePhrases(rawValue, refCodes);
    const parts: string[] = [];
    if (cleaned.trim()) parts.push(cleaned);

    for (const refCode of refCodes) {
      const refText = resolveField(refCode, field, [...stack, key]);
      if (!refText.trim()) continue;
      const refKey = toComparable(refText);
      if (parts.some((part) => toComparable(part) === refKey)) continue;
      parts.push(refText);
    }

    const combined = parts.join("\n\n").trim();
    resolvedCache.set(key, combined);
    return combined;
  };

  const fieldsToResolve: Array<keyof EditorialEntry> = [
    "materielMd",
    "consignesMd",
    "dosageMd",
    "securiteMd",
    "detailMd",
    "fullMdRaw",
    "complementsMd",
  ];

  for (const code of expectedList) {
    const entry = editorialByCode[code];
    if (!entry) continue;
    for (const field of fieldsToResolve) {
      const resolved = resolveField(code, field, []);
      entry[field] = sanitizeEditorialText(resolved) as never;
    }
  }

  const missingEditorial: Array<{ code: string; fields: string[] }> = [];
  for (const code of expectedList) {
    const entry = editorialByCode[code];
    const source = auditEntries[code]?.source ?? "explicit";
    if (source === "summary") continue;
    if (!entry) continue;
    const fields: string[] = [];
    if (!entry.consignesMd.trim()) fields.push("consignes");
    if (!entry.dosageMd.trim()) fields.push("dosage");
    if (!entry.securiteMd.trim()) fields.push("securite");
    if (!entry.detailMd.trim() && !entry.fullMdRaw.trim()) {
      fields.push("detail");
    }
    if (fields.length) missingEditorial.push({ code, fields });
  }
  if (missingEditorial.length) {
    throw new Error(
      `Missing editorial fields for: ${missingEditorial
        .map((entry) => `${entry.code} (${entry.fields.join(", ")})`)
        .join(", ")}`
    );
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

  const sessionAboutOutput: Record<
    SessionId,
    { aboutMd: string; extraMd: string }
  > = SESSION_IDS.reduce((acc, id) => {
    const session = auditParse.sessions[id];
    acc[id] = {
      aboutMd: sanitizeEditorialText(session?.about ?? ""),
      extraMd: sanitizeEditorialText(session?.extra ?? ""),
    };
    return acc;
  }, {} as Record<SessionId, { aboutMd: string; extraMd: string }>);

  const missingSessionAbout = SESSION_IDS.filter(
    (id) => !sessionAboutOutput[id].aboutMd
  );
  if (missingSessionAbout.length) {
    throw new Error(
      `Missing session about blocks for: ${missingSessionAbout.join(", ")}`
    );
  }

  const sessionsOutput =
    `/* Auto-generated by scripts/gen-editorial.ts. */\n` +
    `import type { SessionId } from "@/lib/editorial/sessionsBase";\n\n` +
    `export type SessionAbout = { aboutMd: string; extraMd: string };\n\n` +
    `export const SESSION_ABOUT: Record<SessionId, SessionAbout> = ${JSON.stringify(
      sessionAboutOutput,
      null,
      2
    )};\n`;

  await fs.mkdir(path.dirname(SESSION_OUTPUT_PATH), { recursive: true });
  await fs.writeFile(SESSION_OUTPUT_PATH, sessionsOutput, "utf8");

  const guideOutput = {
    presentation: sanitizeEditorialText(auditParse.guide.presentation),
    conclusion: sanitizeEditorialText(auditParse.guide.conclusion),
    sources: sanitizeEditorialText(auditParse.guide.sources),
    notes: sanitizeEditorialText(auditParse.guide.notes),
  };

  if (!guideOutput.presentation.trim()) {
    throw new Error("Missing guide presentation block in audit report.");
  }

  await fs.mkdir(path.dirname(GUIDE_OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    GUIDE_OUTPUT_PATH,
    JSON.stringify(guideOutput, null, 2),
    "utf8"
  );

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
    `  auditSummaryMd: string;\n` +
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



