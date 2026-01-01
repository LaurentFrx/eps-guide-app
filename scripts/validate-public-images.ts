#!/usr/bin/env node
/* eslint-disable no-console */
import fs from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "public");
const IMAGE_EXTS = new Set([".jpg", ".jpeg"]);

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

async function main() {
  try {
    await fs.access(TARGET_DIR);
  } catch {
    console.error("public folder not found.");
    process.exit(1);
  }

  const allFiles = await walk(TARGET_DIR);
  const jpgFiles = allFiles.filter((file) =>
    IMAGE_EXTS.has(path.extname(file).toLowerCase())
  );
  const invalid: string[] = [];

  for (const file of jpgFiles) {
    if (await looksLikeSvg(file)) {
      invalid.push(path.relative(ROOT, file));
    }
  }

  if (invalid.length > 0) {
    console.error(`Scanned ${jpgFiles.length} .jpg/.jpeg files under public/.`);
    console.error("Found SVG content inside .jpg/.jpeg files:");
    invalid.forEach((file) => {
      console.error(`- ${file}`);
    });
    process.exit(1);
  }

  console.log(`validate-public-images: ok (${jpgFiles.length} files checked)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
