#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

type Job = {
  input: string;
  output: string;
  width: number;
  label: string;
};

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "assets", "originals");
const OUT_DIR = path.join(ROOT, "public", "exercises");
const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".avif",
]);
const EXERCISE_RE = /^(S[1-5])-(\d+)$/i;
const HERO_RE = /^hero$/i;

function normalizeRel(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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

function findSessionId(relPath: string): string | null {
  const parts = relPath.split(path.sep);
  for (const part of parts) {
    if (/^S[1-5]$/i.test(part)) return part.toUpperCase();
  }
  return null;
}

async function main() {
  const force = process.argv.slice(2).includes("--force");

  if (!(await isDirectory(SRC_DIR))) {
    console.error("assets/originals folder not found. Add source images before running this script.");
    process.exit(1);
  }

  const files = await walk(SRC_DIR);
  const jobs: Job[] = [];
  const outputs = new Set<string>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) continue;

    const rel = path.relative(SRC_DIR, file);
    const base = path.basename(rel, ext);

    if (HERO_RE.test(base)) {
      const sessionId = findSessionId(rel);
      if (!sessionId) {
        console.warn(`Skipping hero without session folder: ${normalizeRel(rel)}`);
        continue;
      }
      const output = path.join(OUT_DIR, sessionId, "hero.webp");
      if (outputs.has(output)) {
        console.warn(`Duplicate hero source for ${sessionId}: ${normalizeRel(rel)}`);
        continue;
      }
      outputs.add(output);
      jobs.push({ input: file, output, width: 1600, label: `${sessionId} hero` });
      continue;
    }

    const m = base.match(EXERCISE_RE);
    if (!m) continue;
    const sessionId = m[1].toUpperCase();
    const code = `${sessionId}-${m[2]}`;
    const output = path.join(OUT_DIR, sessionId, `${code}.webp`);
    if (outputs.has(output)) {
      console.warn(`Duplicate exercise source for ${code}: ${normalizeRel(rel)}`);
      continue;
    }
    outputs.add(output);
    jobs.push({ input: file, output, width: 600, label: code });
  }

  if (jobs.length === 0) {
    console.log("No source images found under assets/originals.");
    return;
  }

  for (const job of jobs) {
    if (!force && (await exists(job.output))) {
      console.log(`exists ${normalizeRel(path.relative(ROOT, job.output))}`);
      continue;
    }

    await fs.mkdir(path.dirname(job.output), { recursive: true });
    await sharp(job.input)
      .resize({ width: job.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(job.output);

    console.log(
      `Created ${normalizeRel(path.relative(ROOT, job.output))} from ${normalizeRel(
        path.relative(ROOT, job.input)
      )}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
