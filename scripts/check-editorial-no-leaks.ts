import { getAllExercises } from "../src/lib/exercises/index";
import { normalizeExerciseCode } from "../src/lib/exerciseCode";
import { UI_TEXT_FIELDS } from "../src/lib/exercises/crossRefs";
import { SESSION_ABOUT } from "../src/lib/editorial/sessions.generated";

const SESSION_RE = /Session\s+[1-5]\s*[-:\u2010-\u2015]/i;
const SUITE_RE = /Suite des exercices/i;
const CODE_RE = /\bS[1-5]\s*[-\u2010-\u2015]\s*\d{2}\b/g;

type Issue = { code: string; field: string; message: string; excerpt: string };
const issues: Issue[] = [];

const compact = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 160);

const normalizeCode = (value: string) =>
  normalizeExerciseCode(value.replace(/[\u2010-\u2015]/g, "-"));

const findForeignCodes = (value: string, current: string) => {
  const matches = value.match(CODE_RE) ?? [];
  const normalizedCurrent = normalizeCode(current);
  const normalized = matches
    .map((code) => normalizeCode(code))
    .filter((code) => code && code !== normalizedCurrent);
  return Array.from(new Set(normalized));
};

const checkValue = (code: string, field: string, value: string, skipForeign = false) => {
  if (!value || !value.trim()) return;
  if (SESSION_RE.test(value)) {
    issues.push({
      code,
      field,
      message: "contains session header",
      excerpt: compact(value),
    });
  }
  if (SUITE_RE.test(value)) {
    issues.push({
      code,
      field,
      message: "contains session summary marker",
      excerpt: compact(value),
    });
  }
  if (!skipForeign) {
    const foreign = findForeignCodes(value, code);
    if (foreign.length) {
      issues.push({
        code,
        field,
        message: `foreign codes: ${foreign.join(", ")}`,
        excerpt: compact(value),
      });
    }
  }
};

for (const exercise of getAllExercises()) {
  for (const field of UI_TEXT_FIELDS) {
    if (field.key === "fullMdRaw" && exercise.detailMd?.trim()) {
      continue;
    }
    const value = exercise[field.key];
    if (field.kind === "string") {
      if (typeof value !== "string") continue;
      checkValue(exercise.code, String(field.key), value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!item) return;
        checkValue(exercise.code, `${String(field.key)}[${index}]`, item);
      });
    }
  }
}

Object.entries(SESSION_ABOUT).forEach(([sessionId, entry]) => {
  const about = entry.aboutMd ?? "";
  const extra = entry.extraMd ?? "";
  checkValue(sessionId, "aboutMd", about, true);
  checkValue(sessionId, "extraMd", extra, true);
  if ((sessionId === "S3" || sessionId === "S4") && extra) {
    const lines = extra.split(/\r?\n/).filter((line) => line.trim());
    const hasBadLine = lines.some((line) => {
      const codes = Array.from(
        new Set((line.match(CODE_RE) ?? []).map((code) => normalizeCode(code)))
      );
      if (!codes.length) return false;
      if (codes.some((code) => !code.startsWith(sessionId))) return true;
      return codes.length > 1;
    });
    if (hasBadLine) {
      issues.push({
        code: sessionId,
        field: "extraMd",
        message: "contains invalid multi-code line",
        excerpt: compact(extra),
      });
    }
  }
});

if (!issues.length) {
  console.log("Editorial leak check passed.");
  process.exit(0);
}

console.error(`Editorial leak check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.code} ${issue.field}: ${issue.message}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);
