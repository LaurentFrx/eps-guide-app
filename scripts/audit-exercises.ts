#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";
import data from "../src/data/exercises.json";
import pdfIndex from "../src/data/pdfIndex.json";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";

type SeriesId = "S1" | "S2" | "S3" | "S4" | "S5";

type ExercisesData = {
  sessions: Array<{
    num: number;
    exercises: Array<{ code: string }>;
  }>;
};

type ReportSection = {
  label: string;
  codes: string[];
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const EXERCISES_DIR = path.join(PUBLIC_DIR, "exercises");
const OUT_DIR = path.join(ROOT, "scripts", "out");
const OUT_FILE = path.join(OUT_DIR, "audit-exercises.report.md");
const LIST_PAGE = path.join(ROOT, "src", "app", "exercises", "[sessionId]", "page.tsx");
const ASSET_EXTS = new Set([".webp", ".avif", ".jpg", ".jpeg", ".png"]);
const CODE_RE = /^S([1-5])-(\d{1,2})$/i;

function normalizeCode(raw: string): string | null {
  const normalized = normalizeExerciseCode(raw);
  if (!isValidExerciseCode(normalized)) return null;
  return normalized;
}

function getSeries(code: string): SeriesId | null {
  const match = code.match(/^S([1-5])-/);
  if (!match) return null;
  return `S${match[1]}` as SeriesId;
}

function sortCodes(codes: Iterable<string>): string[] {
  const list = Array.from(codes);
  list.sort((a, b) => {
    const ma = a.match(CODE_RE);
    const mb = b.match(CODE_RE);
    if (!ma || !mb) return a.localeCompare(b);
    const sa = Number(ma[1]);
    const sb = Number(mb[1]);
    if (sa !== sb) return sa - sb;
    const na = Number(ma[2]);
    const nb = Number(mb[2]);
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
  return list;
}

function countBySeries(codes: Iterable<string>): Record<SeriesId, number> {
  const counts: Record<SeriesId, number> = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0 };
  for (const code of codes) {
    const series = getSeries(code);
    if (series) counts[series] += 1;
  }
  return counts;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) files.push(...(await walk(full)));
    else if (ent.isFile()) files.push(full);
  }

  return files;
}

async function getAssetCodes(): Promise<Set<string>> {
  const codes = new Set<string>();
  let files: string[] = [];

  try {
    files = await walk(EXERCISES_DIR);
  } catch {
    return codes;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!ASSET_EXTS.has(ext)) continue;
    const base = path.basename(file, ext);
    const match = base.match(CODE_RE);
    if (!match) continue;
    const code = normalizeCode(`S${match[1]}-${match[2]}`);
    if (code) codes.add(code);
  }

  return codes;
}

function getDataCodes(): Set<string> {
  const typed = data as ExercisesData;
  const codes = new Set<string>();

  for (const session of typed.sessions ?? []) {
    for (const exercise of session.exercises ?? []) {
      const code = normalizeCode(exercise.code ?? "");
      if (code) codes.add(code);
    }
  }

  return codes;
}

function getPdfCodes(): Set<string> {
  const entries = pdfIndex as Array<{ code?: string }>;
  const codes = new Set<string>();
  for (const entry of entries) {
    const code = normalizeCode(entry.code ?? "");
    if (code) codes.add(code);
  }
  return codes;
}

async function assertListUsesPdfIndex() {
  try {
    const content = await fs.readFile(LIST_PAGE, "utf8");
    const usesCatalog = content.includes("getSeriesCards(") || content.includes("getPdfSeries(");
    const hasRange =
      /Array\.from\(\{\s*length/i.test(content) ||
      /for\s*\(\s*let\s+i\s*=\s*1/i.test(content);

    if (!usesCatalog || hasRange) {
      throw new Error("List page is not driven by PDF index.");
    }
  } catch (err) {
    console.error("audit-exercises: list page validation failed");
    throw err;
  }
}

function writeSection(label: string, codes: string[]) {
  const header = `## ${label} (${codes.length})`;
  const preview = codes.slice(0, 10).join(", ");
  return `${header}\n\n${preview ? `${preview}\n` : "None.\n"}`;
}

async function main() {
  const pdfCodes = getPdfCodes();
  const dataCodes = getDataCodes();
  const assetCodes = await getAssetCodes();
  await assertListUsesPdfIndex();
  const appCodes = new Set(pdfCodes);

  const ghostInApp = sortCodes(
    Array.from(appCodes).filter((code) => !pdfCodes.has(code))
  );
  const missingData = sortCodes(
    Array.from(pdfCodes).filter((code) => !dataCodes.has(code))
  );
  const photoNoData = sortCodes(
    Array.from(assetCodes).filter(
      (code) => pdfCodes.has(code) && !dataCodes.has(code)
    )
  );
  const dataNoPhoto = sortCodes(
    Array.from(dataCodes).filter(
      (code) => pdfCodes.has(code) && !assetCodes.has(code)
    )
  );

  const sections: ReportSection[] = [
    { label: "GHOST_IN_APP", codes: ghostInApp },
    { label: "MISSING_DATA", codes: missingData },
    { label: "PHOTO_NO_DATA", codes: photoNoData },
    { label: "DATA_NO_PHOTO", codes: dataNoPhoto },
  ];

  const summary = [
    "# Audit Exercises Report",
    "",
    `- PDF_CODES: ${pdfCodes.size}`,
    `- DATA_CODES: ${dataCodes.size}`,
    `- ASSET_CODES: ${assetCodes.size}`,
    `- APP_CODES: ${appCodes.size}`,
    "",
    "## Counts by series",
    "",
    "PDF_CODES: " + JSON.stringify(countBySeries(pdfCodes)),
    "DATA_CODES: " + JSON.stringify(countBySeries(dataCodes)),
    "ASSET_CODES: " + JSON.stringify(countBySeries(assetCodes)),
    "APP_CODES: " + JSON.stringify(countBySeries(appCodes)),
    "",
    "## Diffs (top 10)",
    "",
    ...sections.map((section) => writeSection(section.label, section.codes)),
    "",
  ].join("\n");

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, summary, "utf8");

  console.log("Audit summary");
  console.log(`PDF_CODES: ${pdfCodes.size}`);
  console.log(`DATA_CODES: ${dataCodes.size}`);
  console.log(`ASSET_CODES: ${assetCodes.size}`);
  console.log(`APP_CODES: ${appCodes.size}`);
  console.log("Counts by series");
  console.log("PDF_CODES:", countBySeries(pdfCodes));
  console.log("DATA_CODES:", countBySeries(dataCodes));
  console.log("ASSET_CODES:", countBySeries(assetCodes));
  console.log("APP_CODES:", countBySeries(appCodes));
  console.log("Top 10 diffs");
  for (const section of sections) {
    console.log(`${section.label} (${section.codes.length}):`, section.codes.slice(0, 10));
  }

  if (ghostInApp.length > 0) {
    console.error("audit-exercises: failed (ghost codes detected)");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
