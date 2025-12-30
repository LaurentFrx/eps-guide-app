/* tools/check-no-ha-refs.js */
const fs = require("fs");
const path = require("path");

const DEFAULT_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "out",
  "build",
  "coverage",
  ".turbo",
  ".vercel",
]);

const FORBIDDEN = [
  { re: /\bhomeassistant\b/i, label: "homeassistant" },
  { re: /\bhome\s*assistant\b/i, label: "home assistant" },
  { re: /\/config(?!uration|\.ts)/i, label: "/config" },  // match "/config" but not "next.config.ts" or "/configuration"
  { re: /\bingress\b/i, label: "ingress" },
  { re: /\bhassio\b/i, label: "hassio" },
  { re: /\bsupervisor\b/i, label: "supervisor" },
];

function shouldIgnoreDir(name) {
  return IGNORE_DIRS.has(name);
}

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (shouldIgnoreDir(ent.name)) continue;
      yield* walk(full);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
       if (DEFAULT_EXTS.has(ext)) {
         // Skip the check script itself and eslint config
         if (ent.name === "check-no-ha-refs.js" || ent.name === "eslint.config.mjs") continue;
         yield full;
       }
    }
  }
}

function isCodeLine(line) {
  // Skip pure comments and documentation
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
    return false;
  }
  return true;
}

function findMatches(text) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
      if (!isCodeLine(line)) continue;
   
    for (const rule of FORBIDDEN) {
      if (rule.re.test(line)) {
        hits.push({ lineNo: i + 1, label: rule.label, line });
      }
    }
  }
  return hits;
}

(async () => {
  const repoRoot = process.cwd();
  let failures = 0;

  for await (const filePath of walk(repoRoot)) {
    let content;
    try {
      content = await fs.promises.readFile(filePath, "utf8");
    } catch {
      continue;
    }
    const matches = findMatches(content);
    if (matches.length) {
      const rel = path.relative(repoRoot, filePath);
      for (const m of matches) {
        failures++;
        console.error(
          `✗ Forbidden ref "${m.label}" in ${rel}:${m.lineNo}\n  ${m.line.trim()}`
        );
      }
    }
  }

  if (failures) {
    console.error(`\nFound ${failures} forbidden reference(s).`);
    process.exit(1);
  }

  console.log("✓ Security check passed: no forbidden HA references found.");
})();
