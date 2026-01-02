import { getExercise } from "@/lib/exercise-data";
import { cleanPdfTitle, getPdfItem, getPdfSeries, pdfHasCode } from "@/data/pdfIndex";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExerciseHeroSrc } from "@/lib/exerciseAssets";

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

const IMAGE_CACHE = new Map<string, string | null>();

function resolveExerciseImage(code: string): string | null {
  const normalized = normalizeExerciseCode(code);
  if (IMAGE_CACHE.has(normalized)) {
    return IMAGE_CACHE.get(normalized) ?? null;
  }
  const value = getExerciseHeroSrc(normalized);
  IMAGE_CACHE.set(normalized, value);
  return value;
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
    href: `/exercises/detail/${normalized}`,
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
      href: `/exercises/detail/${code}`,
      image,
      series: item.series,
    };
  });
}
