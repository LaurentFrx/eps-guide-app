import pdfIndex from "@/data/pdfIndex.json";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";

export type PdfIndexItem = {
  code: string;
  title: string;
  series: string;
};

const RAW_INDEX = pdfIndex as PdfIndexItem[];

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/Ã©/g, "é"],
  [/Ã¨/g, "è"],
  [/Ãª/g, "ê"],
  [/Ã /g, "à"],
  [/Ã¢/g, "â"],
  [/Ã´/g, "ô"],
  [/Ã»/g, "û"],
  [/Ã¹/g, "ù"],
  [/Ã§/g, "ç"],
  [/Ã‰/g, "É"],
  [/\u0090/g, "É"],
];

export function cleanPdfTitle(input: string): string {
  let value = input ?? "";
  value = value.replace(/\s+\d+$/g, "");
  for (const [pattern, replacement] of REPLACEMENTS) {
    value = value.replace(pattern, replacement);
  }
  return value.replace(/\s+/g, " ").trim();
}

export const PDF_INDEX: PdfIndexItem[] = RAW_INDEX.map((item) => ({
  ...item,
  code: normalizeExerciseCode(item.code),
  title: cleanPdfTitle(item.title),
  series: item.series?.toUpperCase() ?? "",
}));

const PDF_BY_CODE = new Map<string, PdfIndexItem>(
  PDF_INDEX.map((item) => [item.code, item])
);

export function pdfHasCode(code: string): boolean {
  const normalized = normalizeExerciseCode(code);
  return isValidExerciseCode(normalized) && PDF_BY_CODE.has(normalized);
}

export function getPdfItem(code: string): PdfIndexItem | undefined {
  const normalized = normalizeExerciseCode(code);
  return PDF_BY_CODE.get(normalized);
}

export function getPdfSeries(series: string): PdfIndexItem[] {
  const normalized = series.trim().toUpperCase();
  return PDF_INDEX.filter((item) => item.series === normalized);
}
