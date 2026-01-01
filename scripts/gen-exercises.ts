#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";

type SessionId = "S1" | "S2" | "S3" | "S4" | "S5";

type Found = {
  id: string; // ex: "S2-51" ou "S3-07" (selon le nom du fichier)
  sessionId: SessionId;
  image: string; // ex: "/exercises/S2/S2-51.jpg"
};

type Entry = {
  id: string;
  sessionId: SessionId;
  webpRel?: string;
  svgRel?: string;
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public", "exercises");
const OUT_FILE = path.join(ROOT, "src", "lib", "exercises.generated.ts");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);

const PLACEHOLDER_SVG = (label: string) => {
  const safeLabel = label.replace(/[^A-Za-z0-9-]/g, "");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${safeLabel} placeholder">\n` +
    `  <rect width="100%" height="100%" fill="#e2e8f0"/>\n` +
    `  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#64748b">${safeLabel}</text>\n` +
    `</svg>\n`
  );
};

function normalizeRelPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

// id like S2-51 or S3-7 or S3-07
function naturalSortKey(id: string): [number, number, string] {
  const m = id.match(/^S([1-5])-(\d+)$/i);
  if (!m) return [99, 0, id];
  const sess = Number(m[1]);
  const num = Number(m[2]);
  return [sess, num, id];
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

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function looksLikeSvg(filePath: string): Promise<boolean> {
  try {
    const handle = await fs.open(filePath, "r");
    const buffer = Buffer.alloc(300);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    await handle.close();
    const snippet = buffer.subarray(0, bytesRead).toString("utf8").toLowerCase();
    return snippet.includes("<svg");
  } catch {
    return false;
  }
}

async function ensurePlaceholderSvg(filePath: string, label: string) {
  try {
    await fs.access(filePath);
    return;
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, PLACEHOLDER_SVG(label), "utf8");
  }
}

async function main() {
  try {
    await fs.access(PUBLIC_DIR);
  } catch (_err) {
    console.error(
      "public/exercises folder not found. Create it and add images before running this script."
    );
    process.exit(1);
  }

  const allFiles = await walk(PUBLIC_DIR);
  const entries = new Map<string, Entry>();

  for (const file of allFiles) {
    let filePath = file;
    let ext = path.extname(filePath).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) continue;

    // rel from public/exercises: ex "S2/S2-51.jpg" or "S2-51.jpg"
    let rel = path.relative(PUBLIC_DIR, filePath);

    const filename = path.basename(rel, ext); // "S2-51"
    const m = filename.match(/^(S[1-5])-(\d+)$/i);
    if (!m) continue;

    const sessionId = m[1].toUpperCase() as SessionId;

    // IMPORTANT: on garde l'id aligné sur le nom du fichier (pas de padStart)
    // - si fichier "S3-7.jpg" => id "S3-7"
    // - si fichier "S3-07.jpg" => id "S3-07"
    const id = `${sessionId}-${m[2]}`;

    let relPath = rel;
    if ((ext === ".jpg" || ext === ".jpeg") && (await looksLikeSvg(filePath))) {
      const svgPath = path.join(path.dirname(filePath), `${filename}.svg`);
      if (await exists(svgPath)) {
        await fs.unlink(filePath);
      } else {
        await fs.rename(filePath, svgPath);
      }
      filePath = svgPath;
      ext = ".svg";
      relPath = path.relative(PUBLIC_DIR, svgPath);
    }

    const entry = entries.get(id) ?? { id, sessionId };
    if (!entries.has(id)) entries.set(id, entry);
    if (ext === ".webp" && !entry.webpRel) entry.webpRel = relPath;
    if (ext === ".svg" && !entry.svgRel) entry.svgRel = relPath;
  }

  const found: Found[] = [];
  for (const entry of entries.values()) {
    let relPath = entry.webpRel;
    if (!relPath) {
      if (!entry.svgRel) {
        const placeholderRel = path.join(entry.sessionId, `${entry.id}.svg`);
        await ensurePlaceholderSvg(path.join(PUBLIC_DIR, placeholderRel), entry.id);
        entry.svgRel = placeholderRel;
      }
      relPath = entry.svgRel;
    }

    if (!relPath) continue;
    const webRel = normalizeRelPath(relPath);
    found.push({ id: entry.id, sessionId: entry.sessionId, image: `/exercises/${webRel}` });
  }

  found.sort((a, b) => {
    const ka = naturalSortKey(a.id);
    const kb = naturalSortKey(b.id);
    if (ka[0] !== kb[0]) return ka[0] - kb[0];
    if (ka[1] !== kb[1]) return ka[1] - kb[1];
    return ka[2].localeCompare(kb[2]);
  });

  // generate content
  const header =
    `/* This file is auto-generated by scripts/gen-exercises.ts. Do not edit manually. */\n` +
    `import type { Exercise } from "./exercises";\n\n`;

  const items = found
    .map((u) => {
      const id = u.id;
      return `  {
    id: "${id}",
    sessionId: "${u.sessionId}",
    title: "Exercice ${id}",
    subtitleEn: undefined,
    level: "Débutant",
    image: "${u.image}",
    objectif: "Contenu à compléter",
    materiel: "Contenu à compléter",
    anatomie: { muscles: "Contenu à compléter", fonction: "Contenu à compléter" },
    techniquePoints: [],
    securitePoints: [],
    progression: { regression: "Contenu à compléter", progression: "Contenu à compléter" },
    dosage: "Contenu à compléter"
  }`;
    })
    .join(",\n");

  const body = `${header}export const exercisesGenerated: Exercise[] = [\n${items}\n];\n`;

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, body, "utf8");
  console.log(`Wrote ${OUT_FILE} with ${found.length} exercises.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
