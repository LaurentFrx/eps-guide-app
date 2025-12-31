#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

type SessionId = "S1" | "S2" | "S3" | "S4" | "S5";

type Candidate = {
  name: string;
  filePath: string;
  ext: string;
  number: number;
  index: number;
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public", "exercises");
const SESSIONS: SessionId[] = ["S1", "S2", "S3", "S4", "S5"];
const PRIMARY_EXTS = new Set([".jpg", ".jpeg"]);
const FALLBACK_EXTS = new Set([".png", ".webp", ".avif"]);
const ALLOWED_EXTS = new Set([...PRIMARY_EXTS, ...FALLBACK_EXTS]);
const EXERCISE_RE = /^S([1-5])-(\d+)\.(jpg|jpeg|png|webp|avif)$/i;
const nameCollator = new Intl.Collator("en", { sensitivity: "base" });

function normalizeRel(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function listCandidates(session: SessionId, folder: string): Promise<Candidate[]> {
  const entries = await fs.readdir(folder, { withFileTypes: true });
  const candidates: Candidate[] = [];

  entries.forEach((ent, index) => {
    if (!ent.isFile()) return;

    const match = ent.name.match(EXERCISE_RE);
    if (!match) return;

    const sessionFromName = `S${match[1]}` as SessionId;
    if (sessionFromName !== session) return;

    const ext = `.${match[3].toLowerCase()}`;
    if (!ALLOWED_EXTS.has(ext)) return;

    candidates.push({
      name: ent.name,
      filePath: path.join(folder, ent.name),
      ext,
      number: Number.parseInt(match[2], 10),
      index,
    });
  });

  return candidates;
}

function pickFirstCandidate(candidates: Candidate[]): Candidate | undefined {
  const primary = candidates.filter((c) => PRIMARY_EXTS.has(c.ext));
  const pool = primary.length > 0 ? primary : candidates.filter((c) => FALLBACK_EXTS.has(c.ext));
  if (pool.length === 0) return undefined;

  pool.sort((a, b) => {
    if (a.number !== b.number) return a.number - b.number;
    const nameCompare = nameCollator.compare(a.name, b.name);
    if (nameCompare !== 0) return nameCompare;
    return a.index - b.index;
  });

  return pool[0];
}

async function main() {
  const force = process.argv.slice(2).includes("--force");

  if (!(await isDirectory(PUBLIC_DIR))) {
    console.error("public/exercises folder not found. Create it before running this script.");
    process.exit(1);
  }

  for (const session of SESSIONS) {
    const folder = path.join(PUBLIC_DIR, session);
    if (!(await isDirectory(folder))) {
      console.warn(`Missing folder: ${normalizeRel(path.relative(ROOT, folder))}`);
      continue;
    }

    const heroPath = path.join(folder, "hero.jpg");
    if (!force && (await exists(heroPath))) {
      console.log(`exists ${normalizeRel(path.relative(ROOT, heroPath))}`);
      continue;
    }

    const candidates = await listCandidates(session, folder);
    const chosen = pickFirstCandidate(candidates);

    if (!chosen) {
      console.warn(`No exercise images found for ${session} in ${normalizeRel(path.relative(ROOT, folder))}`);
      continue;
    }

    await fs.copyFile(chosen.filePath, heroPath);

    if (!PRIMARY_EXTS.has(chosen.ext)) {
      console.warn(`hero.jpg created from ${chosen.ext.slice(1)} (no conversion)`);
    }

    console.log(
      `Created ${normalizeRel(path.relative(ROOT, heroPath))} from ${chosen.name}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
