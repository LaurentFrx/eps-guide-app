#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import pdfIndex from "../src/data/pdfIndex.json";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";

type PdfIndexEntry = {
  code: string;
  title: string;
  series: string;
};

type ExercisePdf = {
  code: string;
  title: string;
  level: string;
  equipment: string;
  muscles: string;
  objective: string;
  anatomy: string;
  key_points: string[];
  safety: string[];
  regress: string;
  progress: string;
  dosage: string;
  image: string;
};

type SectionKey =
  | "objective"
  | "anatomy"
  | "key_points"
  | "safety"
  | "regress"
  | "progress"
  | "dosage"
  | "equipment"
  | "level";

const ROOT = process.cwd();
const PDF_PATH = path.join(
  ROOT,
  "assets",
  "originals",
  "EPS_Guide_Pro_S1-S5_2025-12-27.pdf"
);
const OUT_TS = path.join(ROOT, "src", "data", "exercisesFromPdf.ts");
const OUT_JSON = path.join(ROOT, "scripts", "out", "exercisesFromPdf.json");
const OUT_REPORT = path.join(ROOT, "scripts", "out", "exercisesFromPdf.report.md");

const CODE_RE = /\bS[1-5]\s*[-_\u2013]?\s*\d{1,2}\b/g;

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u2018/g, "'"],
  [/\u2019/g, "'"],
  [/\u201c/g, "\""],
  [/\u201d/g, "\""],
  [/\u2013/g, "-"],
  [/\u2014/g, "-"],
];

const DEFAULT_LEVEL = "Intermediaire";
const DEFAULT_EQUIPMENT = "Aucun";
const PLACEHOLDER = "Contenu a completer";

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function cleanText(value: string): string {
  let output = value.replace(/\s+\d+$/g, "");
  for (const [pattern, replacement] of REPLACEMENTS) {
    output = output.replace(pattern, replacement);
  }
  output = output.replace(/[\u0000-\u001f]/g, " ");
  output = stripDiacritics(output);
  output = output.replace(/[^\x20-\x7E]/g, " ");
  output = output.replace(/\s+/g, " ").trim();
  return output;
}

function normalizeHeader(line: string): string {
  return stripDiacritics(line).toUpperCase().replace(/\s+/g, " ").trim();
}

function detectHeader(line: string): SectionKey | null {
  const normalized = normalizeHeader(line);
  if (!normalized) return null;
  if (normalized.includes("OBJECTIF")) return "objective";
  if (normalized.includes("MUSCLES") || normalized.includes("ANATOMIE")) return "anatomy";
  if (normalized.includes("POINTS CLES") || normalized.includes("TECHNIQUE")) {
    return "key_points";
  }
  if (normalized.includes("SECURITE")) return "safety";
  if (normalized.includes("REGRESSION")) return "regress";
  if (normalized.includes("PROGRESSION")) return "progress";
  if (normalized.includes("DOSAGE")) return "dosage";
  if (normalized.includes("MATERIEL") || normalized.includes("EQUIPEMENT")) {
    return "equipment";
  }
  if (normalized.includes("NIVEAU")) return "level";
  return null;
}

function shouldSkipLine(line: string): boolean {
  const normalized = normalizeHeader(line);
  if (!normalized) return true;
  if (normalized.startsWith("SESSION ")) return true;
  if (/^\d+\s*\/\s*\d+$/.test(normalized)) return true;
  if (/^--?\s*\d+\s*OF\s*\d+/.test(normalized)) return true;
  return false;
}

function hasAnyHeader(lines: string[], startIndex: number, windowSize = 24): boolean {
  for (let i = startIndex; i < Math.min(lines.length, startIndex + windowSize); i += 1) {
    if (detectHeader(lines[i])) return true;
  }
  return false;
}

function normalizeCode(raw: string): string | null {
  const normalized = normalizeExerciseCode(raw);
  if (!isValidExerciseCode(normalized)) return null;
  return normalized;
}

function parseList(lines: string[]): string[] {
  const items: string[] = [];
  for (const line of lines) {
    const normalized = line.replace(/\u2022/g, "|").replace(/\u0007/g, "|");
    const trimmed = cleanText(normalized).replace(/^[-*]\s*/, "");
    if (!trimmed) continue;
    if (trimmed.includes("|")) {
      trimmed
        .split("|")
        .map((item) => cleanText(item))
        .filter(Boolean)
        .forEach((item) => items.push(item));
      continue;
    }
    items.push(trimmed);
  }
  if (items.length === 0) {
    const combined = cleanText(lines.join(" "));
    if (combined) items.push(combined);
  }
  return items;
}

function extractTitle(lines: string[], startIndex: number, code: string): string {
  const line = lines[startIndex] ?? "";
  const afterCode = cleanText(line.replace(CODE_RE, "").trim());
  if (afterCode && !detectHeader(afterCode)) return afterCode;

  for (let i = startIndex + 1; i < Math.min(lines.length, startIndex + 8); i += 1) {
    const candidate = cleanText(lines[i]);
    if (!candidate) continue;
    if (detectHeader(candidate)) continue;
    if (normalizeCode(candidate)) continue;
    return candidate;
  }
  return code;
}

function parseSegment(lines: string[], start: number, end: number) {
  const sections: Record<SectionKey, string[]> = {
    objective: [],
    anatomy: [],
    key_points: [],
    safety: [],
    regress: [],
    progress: [],
    dosage: [],
    equipment: [],
    level: [],
  };
  let current: SectionKey | null = null;

  for (let i = start; i < end; i += 1) {
    const raw = lines[i];
    if (!raw) continue;
    const header = detectHeader(raw);
    if (header) {
      current = header;
      let rest = "";
      const colonIndex = raw.indexOf(":");
      if (colonIndex >= 0) {
        rest = raw.slice(colonIndex + 1).trim();
      } else {
        const dashIndex = raw.indexOf("-");
        if (dashIndex >= 0 && dashIndex < 40) {
          rest = raw.slice(dashIndex + 1).trim();
        }
      }
      if (rest && rest !== raw && !shouldSkipLine(rest)) {
        sections[current].push(rest);
      }
      continue;
    }
    if (!current) continue;
    if (shouldSkipLine(raw)) continue;
    sections[current].push(raw);
  }

  const objective = cleanText(sections.objective.join(" "));
  const anatomy = cleanText(sections.anatomy.join(" "));
  const key_points = parseList(sections.key_points);
  const safety = parseList(sections.safety);
  const regress = cleanText(sections.regress.join(" "));
  const progress = cleanText(sections.progress.join(" "));
  const dosage = cleanText(sections.dosage.join(" "));
  const equipment = cleanText(sections.equipment.join(" "));
  const level = cleanText(sections.level.join(" "));

  return {
    objective,
    anatomy,
    key_points,
    safety,
    regress,
    progress,
    dosage,
    equipment,
    level,
  };
}

async function main() {
  const buffer = await fs.readFile(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();

  const raw = parsed.text ?? "";
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim());

  const pdfEntries = pdfIndex as PdfIndexEntry[];
  const pdfMap = new Map<string, PdfIndexEntry>();
  for (const entry of pdfEntries) {
    const code = normalizeCode(entry.code ?? "");
    if (code) {
      pdfMap.set(code, {
        ...entry,
        code,
        title: cleanText(entry.title),
        series: entry.series ?? code.split("-")[0],
      });
    }
  }

  const occurrences: Array<{ code: string; lineIndex: number }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    const matches = line.match(CODE_RE);
    if (!matches) continue;
    for (const match of matches) {
      const code = normalizeCode(match);
      if (!code) continue;
      if (!hasAnyHeader(lines, i)) continue;
      occurrences.push({ code, lineIndex: i });
    }
  }

  occurrences.sort((a, b) => a.lineIndex - b.lineIndex);

  const startByCode = new Map<string, number>();
  for (const occ of occurrences) {
    if (!startByCode.has(occ.code)) {
      startByCode.set(occ.code, occ.lineIndex);
    }
  }

  const starts = Array.from(startByCode.entries())
    .map(([code, lineIndex]) => ({ code, lineIndex }))
    .sort((a, b) => a.lineIndex - b.lineIndex);

  const extracted = new Map<string, ExercisePdf>();
  const missingSegments: string[] = [];

  for (let i = 0; i < starts.length; i += 1) {
    const current = starts[i];
    const next = starts[i + 1];
    const end = next ? next.lineIndex : lines.length;

    const title = extractTitle(lines, current.lineIndex, current.code);
    const sectionData = parseSegment(lines, current.lineIndex, end);
    const series = current.code.split("-")[0];

    const exercise: ExercisePdf = {
      code: current.code,
      title: title || current.code,
      level: sectionData.level || DEFAULT_LEVEL,
      equipment: sectionData.equipment || DEFAULT_EQUIPMENT,
      muscles: sectionData.anatomy || PLACEHOLDER,
      objective: sectionData.objective || PLACEHOLDER,
      anatomy: sectionData.anatomy || PLACEHOLDER,
      key_points: sectionData.key_points.length ? sectionData.key_points : [PLACEHOLDER],
      safety: sectionData.safety.length ? sectionData.safety : [PLACEHOLDER],
      regress: sectionData.regress || PLACEHOLDER,
      progress: sectionData.progress || PLACEHOLDER,
      dosage: sectionData.dosage || PLACEHOLDER,
      image: `/exercises/${series}/${current.code}.webp`,
    };

    extracted.set(current.code, exercise);
  }

  for (const [code, entry] of pdfMap.entries()) {
    if (!extracted.has(code)) {
      missingSegments.push(code);
      extracted.set(code, {
        code,
        title: entry.title || code,
        level: DEFAULT_LEVEL,
        equipment: DEFAULT_EQUIPMENT,
        muscles: PLACEHOLDER,
        objective: PLACEHOLDER,
        anatomy: PLACEHOLDER,
        key_points: [PLACEHOLDER],
        safety: [PLACEHOLDER],
        regress: PLACEHOLDER,
        progress: PLACEHOLDER,
        dosage: PLACEHOLDER,
        image: `/exercises/${entry.series}/${code}.webp`,
      });
    }
  }

  const list = Array.from(extracted.values()).sort((a, b) => a.code.localeCompare(b.code));

  await fs.mkdir(path.dirname(OUT_TS), { recursive: true });
  const tsHeader =
    "/* This file is auto-generated by scripts/extract-pdf-exercises.ts. Do not edit manually. */\n\n";
  const tsBody =
    "export type ExercisePdf = {\n" +
    "  code: string;\n" +
    "  title: string;\n" +
    "  level: string;\n" +
    "  equipment: string;\n" +
    "  muscles: string;\n" +
    "  objective: string;\n" +
    "  anatomy: string;\n" +
    "  key_points: string[];\n" +
    "  safety: string[];\n" +
    "  regress: string;\n" +
    "  progress: string;\n" +
    "  dosage: string;\n" +
    "  image: string;\n" +
    "};\n\n" +
    `export const EXERCISES_FROM_PDF: ExercisePdf[] = ${JSON.stringify(list, null, 2)};\n` +
    "\n" +
    "export const EXERCISES_FROM_PDF_BY_CODE = new Map(\n" +
    "  EXERCISES_FROM_PDF.map((exercise) => [exercise.code, exercise])\n" +
    ");\n";

  await fs.writeFile(OUT_TS, tsHeader + tsBody, "utf8");

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(list, null, 2), "utf8");

  const reportLines = [
    "# PDF Exercises Extraction Report",
    "",
    `Source: ${PDF_PATH}`,
    `Total exercises: ${list.length}`,
    `Missing segments: ${missingSegments.length}`,
    missingSegments.length > 0 ? missingSegments.slice(0, 20).join(", ") : "None",
    "",
  ];
  await fs.writeFile(OUT_REPORT, reportLines.join("\n"), "utf8");

  console.log(`Extracted ${list.length} exercises from PDF.`);
  if (missingSegments.length > 0) {
    console.log(`Missing segments (${missingSegments.length}):`, missingSegments.slice(0, 10));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
