import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import { PDF_INDEX } from "@/data/pdfIndex";

export type EditorialSource = "Master" | "Report" | "Fallback";

const CODE_RE =
  /^\s*\d*\s*(?:#+\s*)?(S[1-5][-\u2010\u2011\u2012\u2013\u2014]\d{2})\b/gm;

const normalizeCodeToken = (value: string) =>
  value.replace(/[\u2010\u2011\u2012\u2013\u2014]/g, "-");

const loadCodesFromFile = async (filePath: string): Promise<Set<string>> => {
  const raw = await fs.readFile(filePath, "utf8");
  const matches = Array.from(raw.matchAll(CODE_RE));
  const codes = new Set<string>();
  matches.forEach((match) => {
    const token = normalizeCodeToken(match[1] ?? "");
    const normalized = normalizeExerciseCode(token);
    if (isValidExerciseCode(normalized)) {
      codes.add(normalized);
    }
  });
  return codes;
};

const ROOT = process.cwd();
const MASTER_PATH = path.join(ROOT, "docs", "editorial", "master.fr.md");
const REPORT_PATH = path.join(
  ROOT,
  "docs",
  "editorial",
  "audit-editorial.report.md"
);

const loadEditorialSources = async () => {
  const [masterCodes, reportCodes] = await Promise.all([
    loadCodesFromFile(MASTER_PATH),
    loadCodesFromFile(REPORT_PATH),
  ]);

  const sources = new Map<string, EditorialSource>();
  PDF_INDEX.forEach((item) => {
    if (masterCodes.has(item.code)) {
      sources.set(item.code, "Master");
      return;
    }
    if (reportCodes.has(item.code)) {
      sources.set(item.code, "Report");
      return;
    }
    sources.set(item.code, "Fallback");
  });

  return sources;
};

export const getEditorialSources = unstable_cache(
  loadEditorialSources,
  ["editorial-sources"],
  { tags: ["editorial"] }
);
