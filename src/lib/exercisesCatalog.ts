import fs from "fs";
import path from "path";
import { getExercise } from "@/lib/exercise-data";
import { cleanPdfTitle, getPdfItem, getPdfSeries, pdfHasCode } from "@/data/pdfIndex";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

export type ExerciseCatalogStatus = "ready" | "draft" | "ghost";

export type SeriesCard = {
  code: string;
  title: string;
  level?: string;
  status: ExerciseCatalogStatus;
  href?: string;
  image?: string | null;
  series: string;
};

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXTS = [".webp", ".avif", ".jpg", ".jpeg", ".png", ".svg"];
const IMAGE_CACHE = new Map<string, string | null>();

function resolveExerciseImage(code: string): string | null {
  const normalized = normalizeExerciseCode(code);
  if (IMAGE_CACHE.has(normalized)) {
    return IMAGE_CACHE.get(normalized) ?? null;
  }
  if (!isValidExerciseCode(normalized)) {
    IMAGE_CACHE.set(normalized, null);
    return null;
  }

  const series = normalized.split("-")[0];
  const base = path.join(PUBLIC_DIR, "exercises", series, normalized);

  for (const ext of IMAGE_EXTS) {
    const abs = `${base}${ext}`;
    if (fs.existsSync(abs)) {
      const rel = `/exercises/${series}/${normalized}${ext}`;
      IMAGE_CACHE.set(normalized, rel);
      return rel;
    }
  }

  IMAGE_CACHE.set(normalized, null);
  return null;
}

export function getExerciseStatus(code: string): ExerciseCatalogStatus {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized) || !pdfHasCode(normalized)) return "ghost";
  return getExercise(normalized) ? "ready" : "draft";
}

export function getCatalogItem(code: string): SeriesCard | null {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized) || !pdfHasCode(normalized)) return null;

  const pdfItem = getPdfItem(normalized);
  const detail = getExercise(normalized);
  const status = detail ? "ready" : "draft";
  const title = detail?.title ?? (pdfItem ? cleanPdfTitle(pdfItem.title) : "");
  const image = resolveExerciseImage(normalized);
  const series = pdfItem?.series ?? normalized.split("-")[0];

  return {
    code: normalized,
    title: title || normalized,
    level: detail?.level,
    status,
    href: status === "ready" ? `/exercises/detail/${normalized}` : undefined,
    image,
    series,
  };
}

export function getSeriesCards(series: string): SeriesCard[] {
  const items = getPdfSeries(series);
  return items.map((item) => {
    const code = normalizeExerciseCode(item.code);
    const detail = getExercise(code);
    const status = detail ? "ready" : "draft";
    const title = detail?.title ?? cleanPdfTitle(item.title);
    const image = resolveExerciseImage(code);

    return {
      code,
      title: title || code,
      level: detail?.level,
      status,
      href: status === "ready" ? `/exercises/detail/${code}` : undefined,
      image,
      series: item.series,
    };
  });
}
