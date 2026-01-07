import path from "path";
import fs from "fs/promises";
import { parseAuditEditorialReport } from "./parse-audit-editorial-report";
import { editorialByCode } from "../src/lib/editorial.generated";
import {
  normalizeForCompare,
  normalizeTypography,
  splitParagraphs,
  stripReferralPhrases,
} from "./editorial-utils";

type CoverageIssue = {
  code: string;
  missing: string[];
};

const ROOT = process.cwd();
const INPUT_PATHS = [
  path.join(ROOT, "docs", "editorial", "audit-editorial.report.md"),
  path.join(ROOT, "audit-editorial.report.md"),
];

const normalizeChunk = (value: string) =>
  normalizeForCompare(normalizeTypography(stripReferralPhrases(value)));

const LABEL_TOKENS = [
  "description anatomique",
  "description",
  "objectifs fonctionnels",
  "objectifs",
  "justifications biomecaniques",
  "justifications",
  "benefices averes",
  "benefices",
  "progressions / regressions",
  "progressions regressions",
  "progressions",
  "regressions",
  "progression",
  "regression",
  "consignes pedagogiques",
  "consignes",
  "dosage recommande",
  "dosage",
  "securite",
  "contre indications et adaptations",
  "contre indications",
  "materiel",
  "materiels",
  "muscles",
  "anatomie",
];

const LABEL_TOKENS_NORMALIZED = LABEL_TOKENS.map((label) =>
  normalizeForCompare(label)
).sort((a, b) => b.length - a.length);

const stripLeadingLabel = (value: string) => {
  for (const token of LABEL_TOKENS_NORMALIZED) {
    if (value === token) return "";
    if (value.startsWith(`${token} `)) {
      return value.slice(token.length).trim();
    }
  }
  return value;
};

const buildUnmappedText = (
  block: string,
  sections: Array<{ start: number; end: number }>
) => {
  if (!sections.length) return block;
  const ranges = sections
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
    } else if (range.end > last.end) {
      last.end = range.end;
    }
  }

  const parts: string[] = [];
  let cursor = 0;
  for (const range of merged) {
    if (cursor < range.start) {
      parts.push(block.slice(cursor, range.start));
    }
    cursor = Math.max(cursor, range.end);
  }
  if (cursor < block.length) {
    parts.push(block.slice(cursor));
  }
  return parts.join("\n");
};

async function main() {
  const inputPath = await (async () => {
    for (const candidate of INPUT_PATHS) {
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        continue;
      }
    }
    throw new Error("audit-editorial.report.md not found.");
  })();

  const auditParse = await parseAuditEditorialReport(inputPath);
  const coverageIssues: CoverageIssue[] = [];
  let detectedTotal = 0;
  let injectedTotal = 0;

  for (const [code, entry] of Object.entries(auditParse.entries)) {
    const editorial = editorialByCode[code];
    if (!editorial) {
      coverageIssues.push({ code, missing: ["missing editorial output"] });
      continue;
    }

    const usedText = [
      editorial.materielMd,
      editorial.consignesMd,
      editorial.dosageMd,
      editorial.securiteMd,
      editorial.detailMd,
      editorial.complementsMd,
    ]
      .filter(Boolean)
      .join("\n\n");

    const available = new Set<string>();
    for (const part of splitParagraphs(usedText)) {
      const normalized = normalizeChunk(part);
      if (normalized) {
        available.add(normalized);
        const stripped = stripLeadingLabel(normalized);
        if (stripped) {
          available.add(stripped);
        }
      }
    }

    const detectedChunks: string[] = [];
    const sectionContents = entry.sections.flatMap((section) =>
      splitParagraphs(section.content)
    );
    const unmapped = buildUnmappedText(entry.block, entry.sections);
    const allPieces = [...sectionContents, ...splitParagraphs(unmapped)];

    for (const piece of allPieces) {
      const normalized = normalizeChunk(piece);
      if (!normalized) continue;
      detectedChunks.push(normalized);
    }

    detectedTotal += detectedChunks.length;
    const missingChunks = detectedChunks.filter((chunk) => !available.has(chunk));
    injectedTotal += detectedChunks.length - missingChunks.length;

    if (missingChunks.length) {
      coverageIssues.push({
        code,
        missing: missingChunks.slice(0, 5),
      });
    }
  }

  const report = {
    detected: detectedTotal,
    injected: injectedTotal,
    missing: coverageIssues.length,
    issues: coverageIssues,
  };

  const reportDir = path.join(ROOT, "reports");
  await fs.mkdir(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, "audit-editorial-coverage.json");
  const mdPath = path.join(reportDir, "audit-editorial-coverage.md");

  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), "utf8");

  const mdLines = [
    "# Audit editorial coverage",
    "",
    `Detected chunks: ${detectedTotal}`,
    `Injected chunks: ${injectedTotal}`,
    `Missing chunks: ${coverageIssues.length}`,
    "",
  ];

  if (coverageIssues.length) {
    mdLines.push("## Missing coverage");
    coverageIssues.forEach((issue) => {
      mdLines.push(`- ${issue.code}: ${issue.missing.length} chunk(s) missing`);
      issue.missing.forEach((chunk) => {
        mdLines.push(`  - ${chunk.slice(0, 120)}`);
      });
    });
  }

  await fs.writeFile(mdPath, mdLines.join("\n"), "utf8");

  if (detectedTotal !== injectedTotal) {
    throw new Error(
      `Coverage mismatch: detected ${detectedTotal}, injected ${injectedTotal}.`
    );
  }

  console.log(`Editorial coverage OK. Report: ${mdPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
