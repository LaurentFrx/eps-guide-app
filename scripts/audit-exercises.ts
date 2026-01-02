#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";
import data from "../src/data/exercises.json";
import { isValidExerciseCode, normalizeExerciseCode } from "../src/lib/exerciseCode";

type SessionId = "S1" | "S2" | "S3" | "S4" | "S5";

type AssetEntry = {
  code: string;
  relPath: string;
  ext: string;
};

type ManifestEntry = {
  code: string;
  sessionId: SessionId;
  sessionNum: number;
  image: string | null;
  hasData: boolean;
  hasAsset: boolean;
};

type DataSession = {
  num: number;
  exercises: Array<{ code: string }>;
};

type ExercisesData = {
  sessions: DataSession[];
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const EXERCISES_DIR = path.join(PUBLIC_DIR, "exercises");
const OUT_FILE = path.join(ROOT, "src", "data", "exercisesManifest.ts");
const ASSET_EXTS = new Set([".webp", ".avif", ".jpg", ".jpeg", ".png"]);
const ASSET_PRIORITY = [".webp", ".avif", ".jpg", ".jpeg", ".png"];
const CODE_RE = /^S([1-5])-(\d+)$/i;

function normalizeRelPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

function parseSessionId(code: string): SessionId | null {
  const match = code.match(/^S([1-5])-/);
  if (!match) return null;
  return `S${match[1]}` as SessionId;
}

function parseSessionNum(code: string): number | null {
  const match = code.match(/^S([1-5])-/);
  if (!match) return null;
  return Number(match[1]);
}

function pickPreferredAsset(current: AssetEntry | undefined, next: AssetEntry): AssetEntry {
  if (!current) return next;
  const currentRank = ASSET_PRIORITY.indexOf(current.ext);
  const nextRank = ASSET_PRIORITY.indexOf(next.ext);
  if (nextRank !== -1 && (currentRank === -1 || nextRank < currentRank)) {
    return next;
  }
  return current;
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

async function getAssetEntries(): Promise<Map<string, AssetEntry>> {
  const assets = new Map<string, AssetEntry>();
  let files: string[] = [];

  try {
    files = await walk(EXERCISES_DIR);
  } catch {
    return assets;
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!ASSET_EXTS.has(ext)) continue;

    const base = path.basename(file, ext);
    const match = base.match(CODE_RE);
    if (!match) continue;

    const normalized = normalizeExerciseCode(`S${match[1].toUpperCase()}-${match[2]}`);
    if (!isValidExerciseCode(normalized)) continue;

    const relFromPublic = normalizeRelPath(path.relative(PUBLIC_DIR, file));
    const entry: AssetEntry = { code: normalized, relPath: `/${relFromPublic}`, ext };
    const current = assets.get(normalized);
    assets.set(normalized, pickPreferredAsset(current, entry));
  }

  return assets;
}

function getDataCodes(): Map<string, number> {
  const typed = data as ExercisesData;
  const codes = new Map<string, number>();

  for (const session of typed.sessions ?? []) {
    const sessionNum = Number(session.num);
    if (!Number.isFinite(sessionNum)) continue;

    for (const exercise of session.exercises ?? []) {
      const normalized = normalizeExerciseCode(exercise.code ?? "");
      if (!isValidExerciseCode(normalized)) continue;
      codes.set(normalized, sessionNum);
    }
  }

  return codes;
}

function buildManifest(
  dataCodes: Map<string, number>,
  assetEntries: Map<string, AssetEntry>
): ManifestEntry[] {
  const allCodes = new Set<string>();
  for (const code of dataCodes.keys()) allCodes.add(code);
  for (const code of assetEntries.keys()) allCodes.add(code);

  const entries: ManifestEntry[] = [];

  for (const code of allCodes) {
    const sessionId = parseSessionId(code);
    const sessionNum = parseSessionNum(code);
    if (!sessionId || sessionNum === null) continue;

    const asset = assetEntries.get(code);
    entries.push({
      code,
      sessionId,
      sessionNum,
      image: asset?.relPath ?? null,
      hasData: dataCodes.has(code),
      hasAsset: Boolean(asset),
    });
  }

  entries.sort((a, b) => {
    if (a.sessionNum !== b.sessionNum) return a.sessionNum - b.sessionNum;
    const na = Number(a.code.split("-")[1]);
    const nb = Number(b.code.split("-")[1]);
    if (na !== nb) return na - nb;
    return a.code.localeCompare(b.code);
  });

  return entries;
}

async function writeManifest(entries: ManifestEntry[]) {
  const header =
    "/* This file is auto-generated by scripts/audit-exercises.ts. Do not edit manually. */\n\n";
  const typeDef =
    'export type ExerciseManifestEntry = {\n' +
    '  code: string;\n' +
    '  sessionId: "S1" | "S2" | "S3" | "S4" | "S5";\n' +
    "  sessionNum: number;\n" +
    "  image: string | null;\n" +
    "  hasData: boolean;\n" +
    "  hasAsset: boolean;\n" +
    "};\n\n";

  const lines = entries
    .map((entry) => {
      return (
        "  " +
        JSON.stringify(
          {
            code: entry.code,
            sessionId: entry.sessionId,
            sessionNum: entry.sessionNum,
            image: entry.image,
            hasData: entry.hasData,
            hasAsset: entry.hasAsset,
          },
          null,
          2
        )
          .replace(/\n/g, "\n  ")
          .trimEnd()
      );
    })
    .join(",\n");

  const body = `${header}${typeDef}export const exercisesManifest: ExerciseManifestEntry[] = [\n${lines}\n];\n`;

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, body, "utf8");
}

function printList(label: string, items: string[]) {
  console.log(`${label} (${items.length})`);
  if (items.length === 0) return;
  console.log(items.join(", "));
}

async function main() {
  const dataCodes = getDataCodes();
  const assetEntries = await getAssetEntries();
  const manifest = buildManifest(dataCodes, assetEntries);
  await writeManifest(manifest);

  const dataList = sortCodes(dataCodes.keys());
  const assetList = sortCodes(assetEntries.keys());
  const listedList = sortCodes(manifest.map((entry) => entry.code));

  const assetSet = new Set(assetList);
  const dataSet = new Set(dataList);
  const listedSet = new Set(listedList);

  const photoSansFiche = assetList.filter((code) => !dataSet.has(code));
  const ficheSansPhoto = dataList.filter((code) => !assetSet.has(code));
  const fantomes = Array.from(listedSet).filter(
    (code) => !dataSet.has(code) && !assetSet.has(code)
  );

  printList("DATA_CODES", dataList);
  printList("ASSET_CODES", assetList);
  printList("LISTED_CODES", listedList);
  printList("PHOTO_SANS_FICHE", sortCodes(photoSansFiche));
  printList("FICHE_SANS_PHOTO", sortCodes(ficheSansPhoto));
  printList("FANTOMES", sortCodes(fantomes));

  if (fantomes.length > 0) {
    console.error("audit-exercises: failed (fantomes detected)");
    process.exit(1);
  }

  console.log("audit-exercises: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
