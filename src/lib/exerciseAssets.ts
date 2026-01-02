import fs from "fs";
import path from "path";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXTS = [".webp", ".avif", ".jpg", ".jpeg", ".png", ".svg"];

export function getExerciseHeroSrc(code: string): string | null {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) return null;

  const series = normalized.split("-")[0];
  const base = path.join(PUBLIC_DIR, "exercises", series, normalized);

  for (const ext of IMAGE_EXTS) {
    const abs = `${base}${ext}`;
    if (fs.existsSync(abs)) {
      return `/exercises/${series}/${normalized}${ext}`;
    }
  }

  return null;
}

export function getExerciseHeroSrcOrFallback(
  code: string,
  fallback = "/exercises/fallback.svg"
): string {
  return getExerciseHeroSrc(code) ?? fallback;
}
