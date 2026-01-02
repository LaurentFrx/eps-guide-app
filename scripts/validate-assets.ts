#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { exercisesGenerated } from "../src/lib/exercises.generated";

type Missing = {
  id: string;
  image: string;
  reason: string;
};

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

function normalizeImagePath(imagePath: string) {
  return imagePath.replace(/^\/+/, "");
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const missing: Missing[] = [];

  for (const exercise of exercisesGenerated) {
    const imagePath = exercise.image;
    if (!imagePath) {
      missing.push({ id: exercise.id, image: "", reason: "empty image path" });
      continue;
    }

    const rel = normalizeImagePath(imagePath);
    const abs = path.join(PUBLIC_DIR, rel);
    const exists = await fileExists(abs);

    if (!exists) {
      missing.push({ id: exercise.id, image: imagePath, reason: "file not found" });
    }
  }

  if (missing.length > 0) {
    console.error("Missing exercise images:");
    missing.forEach((m) => {
      console.error(`- ${m.id}: ${m.image || "(empty)"} (${m.reason})`);
    });
    process.exit(1);
  }

  console.log(`validate-assets: ok (${exercisesGenerated.length} exercises)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
