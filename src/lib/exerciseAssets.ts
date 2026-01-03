import fs from "fs";
import path from "path";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXTS = [".webp", ".avif", ".jpg", ".jpeg", ".png", ".svg"];
const SVG_SNIFF_BYTES = 300;
const heroCache = new Map<string, HeroAsset>();

type HeroAsset = {
  src: string;
  isSvg: boolean;
};

function looksLikeSvg(absPath: string): boolean {
  try {
    const fd = fs.openSync(absPath, "r");
    const buffer = Buffer.alloc(SVG_SNIFF_BYTES);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    const snippet = buffer
      .subarray(0, bytesRead)
      .toString("utf8")
      .toLowerCase();
    return snippet.includes("<svg");
  } catch {
    return false;
  }
}

function resolveHeroAsset(code: string): HeroAsset | null {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) return null;
  if (typeof window !== "undefined") {
    throw new Error("getHeroSrc can only be used in a server context.");
  }

  const cached = heroCache.get(normalized);
  if (cached) return cached;

  const series = normalized.split("-")[0];
  const base = path.join(PUBLIC_DIR, "exercises", series, normalized);

  for (const ext of IMAGE_EXTS) {
    const abs = `${base}${ext}`;
    if (!fs.existsSync(abs)) continue;

    const baseSrc = `/exercises/${series}/${normalized}`;
    const isSvg = ext === ".svg";
    if (!isSvg && looksLikeSvg(abs)) {
      const svgAbs = `${base}.svg`;
      if (fs.existsSync(svgAbs)) {
        const asset = { src: `${baseSrc}.svg`, isSvg: true };
        heroCache.set(normalized, asset);
        return asset;
      }
      const asset = { src: `${baseSrc}${ext}`, isSvg: true };
      heroCache.set(normalized, asset);
      return asset;
    }

    const asset = { src: `${baseSrc}${ext}`, isSvg };
    heroCache.set(normalized, asset);
    return asset;
  }

  return null;
}

export function getExerciseHeroSrc(code: string): string | null {
  return resolveHeroAsset(code)?.src ?? null;
}

export function getExerciseHeroSrcOrFallback(
  code: string,
  fallback = "/exercises/fallback.svg"
): string {
  return resolveHeroAsset(code)?.src ?? fallback;
}

export function getHeroSrc(
  code: string,
  fallback = "/exercises/fallback.svg"
): HeroAsset {
  return (
    resolveHeroAsset(code) ?? {
      src: fallback,
      isSvg: fallback.toLowerCase().endsWith(".svg"),
    }
  );
}
