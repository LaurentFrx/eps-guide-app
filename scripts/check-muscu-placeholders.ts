import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SEARCH_DIRS = ["src", "public"];
const IGNORE_DIRS = new Set([".git", "node_modules", ".next", "out", "dist"]);
const IGNORE_FILES = new Set([path.normalize("public/sw.js")]);
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const PLACEHOLDER_PATTERN =
  /\/muscu[\\/]+infographies[\\/]+connaissances[\\/]+(tonification|volume|puissance|parametres|methodes|contractions)\.png|\/muscu[\\/]+infographies[\\/]+evaluation[\\/]+(bac-lgt|bac-pro|cap|seconde-cap|premiere-cap)\.png/gi;

type Match = { file: string; matches: string[] };

const shouldIgnoreFile = (filePath: string) =>
  IGNORE_FILES.has(path.normalize(path.relative(ROOT, filePath)));

const shouldScanFile = (filePath: string) =>
  TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());

const walk = (dir: string, files: string[] = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walk(fullPath, files);
    } else if (entry.isFile()) {
      if (!shouldScanFile(fullPath)) continue;
      if (shouldIgnoreFile(fullPath)) continue;
      files.push(fullPath);
    }
  }
  return files;
};

const collectMatches = (filePath: string) => {
  const content = fs.readFileSync(filePath, "utf8");
  const regex = new RegExp(PLACEHOLDER_PATTERN.source, "gi");
  const hits = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    hits.add(match[0]);
  }
  return Array.from(hits);
};

const matches: Match[] = [];

SEARCH_DIRS.forEach((dir) => {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) return;
  walk(absDir).forEach((filePath) => {
    const hits = collectMatches(filePath);
    if (hits.length) {
      matches.push({ file: path.relative(ROOT, filePath), matches: hits });
    }
  });
});

if (matches.length) {
  console.error("Muscu placeholder references found:");
  matches.forEach((entry) => {
    console.error(`- ${entry.file}: ${entry.matches.join(", ")}`);
  });
  process.exit(1);
}

console.log("Muscu placeholder references not found.");
