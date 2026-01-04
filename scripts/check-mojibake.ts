import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET_DIRS = ["src", "public"];
const IGNORE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out"]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".txt",
  ".css",
  ".html",
  ".webmanifest",
]);

const PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "U+201A (‚)", re: /\u201A/ },
  { label: "OE in word (maŒ)", re: /[a-z]\u0152/i },
  { label: "Replacement char (�)", re: /\uFFFD/ },
  { label: "UTF-8 mojibake (â€”)", re: /â€”/ },
  { label: "UTF-8 mojibake (â€“)", re: /â€“/ },
  { label: "UTF-8 mojibake (â€™)", re: /â€™/ },
  { label: "UTF-8 mojibake (â€œ)", re: /â€œ/ },
  { label: "UTF-8 mojibake (â€)", re: /â€/ },
];

const shouldScan = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
};

const walk = async (dir: string, files: string[] = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile() && shouldScan(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
};

const scanFile = async (filePath: string) => {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const hits: Array<{ line: number; text: string; label: string }> = [];

  lines.forEach((line, index) => {
    for (const { label, re } of PATTERNS) {
      if (re.test(line)) {
        hits.push({ line: index + 1, text: line.trim(), label });
      }
    }
  });

  return hits;
};

const run = async () => {
  const files: string[] = [];
  for (const target of TARGET_DIRS) {
    const abs = path.join(ROOT, target);
    try {
      const stats = await fs.stat(abs);
      if (stats.isDirectory()) {
        files.push(...(await walk(abs)));
      }
    } catch {
      // Ignore missing dirs.
    }
  }

  const issues: Array<{ file: string; line: number; label: string; text: string }> =
    [];

  for (const file of files) {
    const hits = await scanFile(file);
    hits.forEach((hit) => {
      issues.push({ file, ...hit });
    });
  }

  if (issues.length) {
    console.error("Mojibake check failed. Suspicious sequences found:");
    issues.forEach((issue) => {
      console.error(
        `- ${path.relative(ROOT, issue.file)}:${issue.line} [${issue.label}] ${issue.text}`
      );
    });
    process.exit(1);
  }

  console.log("Mojibake check passed.");
};

run().catch((error) => {
  console.error("Mojibake check failed:", error);
  process.exit(1);
});
