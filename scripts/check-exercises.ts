#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";
import { allExercises } from "../src/lib/exercise-data";
import pdfIndex from "../src/data/pdfIndex.json";
import { normalizeExerciseCode, isValidExerciseCode } from "../src/lib/exerciseCode";

type SeriesId = "S1" | "S2" | "S3" | "S4" | "S5";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public", "exercises");
const LIST_PAGE = path.join(ROOT, "src", "app", "exercises", "[sessionId]", "page.tsx");
const ASSET_EXTS = new Set([".webp", ".avif", ".jpg", ".jpeg", ".png"]);
const CODE_RE = /^S([1-5])-(\d{1,2})$/i;

function normalizeCode(raw: string): string | null {
  const normalized = normalizeExerciseCode(raw);
  if (!isValidExerciseCode(normalized)) return null;
  return normalized;
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
    const match = code.match(/^S([1-5])-/);
    if (!match) continue;
    const series = `S${match[1]}` as SeriesId;
    counts[series] += 1;
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
    files = await walk(PUBLIC_DIR);
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

async function main() {
  const strict = process.env.EXERCISES_STRICT === "1";

  const pdfEntries = pdfIndex as Array<{ code?: string }>;
  const pdfCodes = new Set(
    pdfEntries.map((item) => normalizeCode(item.code ?? "")).filter(Boolean) as string[]
  );
  const dataCodes = new Set(
    allExercises
      .map((exercise) => normalizeCode(exercise.code))
      .filter(Boolean) as string[]
  );
  const assetCodes = await getAssetCodes();

  const appCodes = pdfEntries.map((item) => normalizeExerciseCode(item.code ?? ""));
  const invalidCodes = sortCodes(appCodes.filter((code) => !isValidExerciseCode(code)));

  const counts = new Map<string, number>();
  for (const code of appCodes) {
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  const duplicateCodes = sortCodes(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([code]) => code)
  );

  const appCodeSet = new Set(appCodes.filter((code) => isValidExerciseCode(code)));
  const ghostInApp = sortCodes(Array.from(appCodeSet).filter((code) => !pdfCodes.has(code)));

  const missingData = sortCodes(
    Array.from(pdfCodes).filter((code) => !dataCodes.has(code))
  );
  const photoNoData = sortCodes(
    Array.from(assetCodes).filter((code) => pdfCodes.has(code) && !dataCodes.has(code))
  );
  const dataNoPhoto = sortCodes(
    Array.from(dataCodes).filter((code) => pdfCodes.has(code) && !assetCodes.has(code))
  );

  console.log("check-exercises summary");
  console.log("PDF_CODES:", pdfCodes.size, countBySeries(pdfCodes));
  console.log("DATA_CODES:", dataCodes.size, countBySeries(dataCodes));
  console.log("ASSET_CODES:", assetCodes.size, countBySeries(assetCodes));
  console.log("APP_CODES:", appCodeSet.size, countBySeries(appCodeSet));

  if (missingData.length) {
    console.warn(`MISSING_DATA (${missingData.length}) (warn):`, missingData.slice(0, 10));
  }
  if (photoNoData.length) {
    console.warn(`PHOTO_NO_DATA (${photoNoData.length}) (warn):`, photoNoData.slice(0, 10));
  }
  if (dataNoPhoto.length) {
    console.warn(`DATA_NO_PHOTO (${dataNoPhoto.length}) (warn):`, dataNoPhoto.slice(0, 10));
  }

  const hardFailures: string[] = [];
  try {
    const content = await fs.readFile(LIST_PAGE, "utf8");
    const usesCatalog =
      content.includes("getSeriesCards(") || content.includes("getPdfSeries(");
    const hasRange =
      /Array\.from\(\{\s*length/i.test(content) ||
      /for\s*\(\s*let\s+i\s*=\s*1/i.test(content);
    if (!usesCatalog || hasRange) {
      hardFailures.push("LIST_NOT_PDF_BASED");
    }
  } catch {
    hardFailures.push("LIST_PAGE_UNREADABLE");
  }
  if (invalidCodes.length) hardFailures.push(`INVALID_CODES (${invalidCodes.length})`);
  if (duplicateCodes.length) hardFailures.push(`DUPLICATE_CODES (${duplicateCodes.length})`);
  if (ghostInApp.length) hardFailures.push(`GHOST_IN_APP (${ghostInApp.length})`);

  if (strict) {
    if (missingData.length) hardFailures.push(`MISSING_DATA (${missingData.length})`);
    if (photoNoData.length) hardFailures.push(`PHOTO_NO_DATA (${photoNoData.length})`);
  }

  if (invalidCodes.length) {
    console.error("INVALID_CODES:", invalidCodes.slice(0, 10));
  }
  if (duplicateCodes.length) {
    console.error("DUPLICATE_CODES:", duplicateCodes.slice(0, 10));
  }
  if (ghostInApp.length) {
    console.error("GHOST_IN_APP:", ghostInApp.slice(0, 10));
  }

  if (hardFailures.length > 0) {
    console.error("check-exercises: failed", hardFailures.join(", "));
    process.exit(1);
  }

  console.log("check-exercises: ok (non-strict)");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
