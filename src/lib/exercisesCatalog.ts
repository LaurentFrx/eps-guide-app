import { cleanPdfTitle, getPdfItem, getPdfSeries, pdfHasCode } from "@/data/pdfIndex";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExerciseHeroSrc } from "@/lib/exerciseAssets";
import { getMergedExerciseRecord, getMergedExerciseRecords } from "@/lib/exercises/merged";

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

export async function getExerciseStatus(code: string): Promise<ExerciseCatalogStatus> {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized) || !pdfHasCode(normalized)) return "ghost";
  return (await getMergedExerciseRecord(normalized)) ? "ready" : "draft";
}

export async function getCatalogItem(code: string): Promise<SeriesCard | null> {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized) || !pdfHasCode(normalized)) return null;

  const pdfItem = getPdfItem(normalized);
  const detail = await getMergedExerciseRecord(normalized);
  const status: ExerciseCatalogStatus = detail ? "ready" : "draft";
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

export async function getSeriesCards(series: string): Promise<SeriesCard[]> {
  const items = getPdfSeries(series);
  const mergedRecords = await getMergedExerciseRecords();
  const recordMap = new Map(mergedRecords.map((record) => [record.code, record]));

  const cards = items.map((item) => {
    const code = normalizeExerciseCode(item.code);
    const detail = recordMap.get(code);
    const status: ExerciseCatalogStatus = detail ? "ready" : "draft";
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

  const extraCustom = mergedRecords
    .filter((record) => record.code.startsWith(series) && !pdfHasCode(record.code))
    .map((record) => ({
      code: record.code,
      title: record.title || record.code,
      level: record.level,
      status: "ready" as const,
      href: `/exercises/detail/${record.code}`,
      image: resolveExerciseImage(record.code),
      series,
    }));

  return [...cards, ...extraCustom];
}
