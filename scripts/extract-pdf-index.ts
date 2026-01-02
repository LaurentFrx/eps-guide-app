#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";

type PdfEntry = {
  code: string;
  title: string;
  series: string;
};

type Candidate = {
  code: string;
  title: string;
  line: number;
};

const ROOT = process.cwd();
const PDF_PATH = path.join(
  ROOT,
  "assets",
  "originals",
  "EPS_Guide_Pro_S1-S5_2025-12-27.pdf"
);
const OUT_JSON = path.join(ROOT, "src", "data", "pdfIndex.json");
const OUT_DIR = path.join(ROOT, "scripts", "out");
const OUT_REPORT = path.join(OUT_DIR, "pdfIndex.report.md");

const CODE_RE = /S\s*([1-5])\s*[-_ ]\s*(\d{1,2})/gi;

function normalizeCode(raw: string): string | null {
  const normalized = normalizeExerciseCode(raw);
  if (!isValidExerciseCode(normalized)) return null;
  return normalized;
}

function cleanTitle(value: string): string {
  const stripped = value.replace(/^[-–—:]+/, "").trim();
  const collapsed = stripped.replace(/\s{2,}/g, " ");
  const nextCode = collapsed.search(CODE_RE);
  if (nextCode > 0) return collapsed.slice(0, nextCode).trim();
  return collapsed;
}

function findNextTitle(lines: string[], start: number): string {
  for (let i = start; i < Math.min(lines.length, start + 6); i += 1) {
    const candidate = lines[i].trim();
    if (!candidate) continue;
    if (CODE_RE.test(candidate)) {
      CODE_RE.lastIndex = 0;
      continue;
    }
    return cleanTitle(candidate);
  }
  return "";
}

function pickTitle(current: Candidate | undefined, next: Candidate): Candidate {
  if (!current) return next;
  if (!current.title && next.title) return next;
  if (next.title && next.title.length > current.title.length) return next;
  return current;
}

function countBySeries(entries: PdfEntry[]) {
  const counts: Record<string, number> = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0 };
  for (const entry of entries) {
    if (counts[entry.series] !== undefined) counts[entry.series] += 1;
  }
  return counts;
}

async function main() {
  const buffer = await fs.readFile(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText();
  await parser.destroy();
  const raw = parsed.text || "";
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");

  const candidates = new Map<string, Candidate>();
  const missingTitle: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    let match: RegExpExecArray | null;
    CODE_RE.lastIndex = 0;
    while ((match = CODE_RE.exec(line)) !== null) {
      const rawCode = match[0];
      const normalizedCode = normalizeCode(rawCode);
      if (!normalizedCode) continue;
      let title = cleanTitle(line.slice(match.index + match[0].length));
      if (!title) {
        title = findNextTitle(lines, i + 1);
      }
      const candidate: Candidate = { code: normalizedCode, title, line: i + 1 };
      const current = candidates.get(normalizedCode);
      candidates.set(normalizedCode, pickTitle(current, candidate));
    }
  }

  const entries: PdfEntry[] = Array.from(candidates.values())
    .map((entry) => {
      const series = entry.code.split("-")[0];
      if (!entry.title) missingTitle.push(entry.code);
      return {
        code: entry.code,
        title: entry.title || "",
        series,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(entries, null, 2), "utf8");

  const counts = countBySeries(entries);
  const reportLines = [
    "# PDF Index Report",
    "",
    `Source: ${PDF_PATH}`,
    `Total codes: ${entries.length}`,
    "",
    "## Counts by series",
    "",
    `S1: ${counts.S1}`,
    `S2: ${counts.S2}`,
    `S3: ${counts.S3}`,
    `S4: ${counts.S4}`,
    `S5: ${counts.S5}`,
    "",
    "## Missing titles",
    "",
    missingTitle.length > 0 ? missingTitle.slice(0, 20).join(", ") : "None.",
    "",
  ];

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_REPORT, reportLines.join("\n"), "utf8");

  console.log("PDF index extracted");
  console.log(`Total codes: ${entries.length}`);
  console.log("Counts by series:", counts);
  if (missingTitle.length > 0) {
    console.log("Missing titles (top 10):", missingTitle.slice(0, 10));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
