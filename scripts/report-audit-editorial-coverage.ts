#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { parseAuditEditorialReport } from "./parse-audit-editorial-report";

const ROOT = process.cwd();
const INPUT_PATHS = [
  path.join(ROOT, "docs", "editorial", "audit-editorial.report.md"),
  path.join(ROOT, "audit-editorial.report.md"),
];
const OUTPUT_PATH = path.join(ROOT, "reports", "editorial.coverage.json");

async function resolveInputPath() {
  for (const candidate of INPUT_PATHS) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  throw new Error("audit-editorial.report.md not found.");
}

async function main() {
  const inputPath = await resolveInputPath();
  const result = await parseAuditEditorialReport(inputPath);
  const report = {
    source: inputPath,
    totalLines: result.lines.length,
    segmentCount: result.segments.length,
    unassignedCount: result.unassigned.length,
    unassigned: result.unassigned,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(report, null, 2), "utf8");

  if (!result.unassigned.length) {
    console.log("Editorial coverage check passed.");
    return;
  }

  console.error(
    `Editorial coverage check failed (${result.unassigned.length} unassigned lines).`
  );
  result.unassigned.slice(0, 20).forEach((line) => {
    console.error(`- ${line}`);
  });
  if (result.unassigned.length > 20) {
    console.error("... (see reports/editorial.coverage.json for full list)");
  }
  process.exit(1);
}

main().catch((error) => {
  console.error("Editorial coverage check failed:", error);
  process.exit(1);
});
