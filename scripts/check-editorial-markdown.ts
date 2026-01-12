import { editorialByCode } from "../src/lib/editorial.generated";
import { SESSION_ABOUT } from "../src/lib/editorial/sessions.generated";
import { getGuideData } from "../src/lib/editorial";

const BAD_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: "star-dash", re: /\*\s*-\s+/ },
  { label: "tab-bullet", re: /\t\u2022\t/ },
];
const INLINE_CODE_RE = /-\s*S[1-5]-\d{2}\b/g;
const INLINE_COLON_RE = /:\s*-\s+/;

type Issue = { scope: string; field: string; label: string; excerpt: string };
const issues: Issue[] = [];

const compact = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 160);

const checkValue = (scope: string, field: string, value: string) => {
  if (!value || !value.trim()) return;
  for (const pattern of BAD_PATTERNS) {
    if (pattern.re.test(value)) {
      issues.push({
        scope,
        field,
        label: pattern.label,
        excerpt: compact(value),
      });
    }
  }
  const lines = value.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    if (INLINE_COLON_RE.test(line)) {
      issues.push({
        scope,
        field,
        label: "inline-colon-list",
        excerpt: compact(line),
      });
    }
    const matches = line.match(INLINE_CODE_RE) ?? [];
    if (matches.length > 1) {
      issues.push({
        scope,
        field,
        label: "inline-code-list",
        excerpt: compact(line),
      });
    }
  }
};

Object.entries(editorialByCode).forEach(([code, entry]) => {
  Object.entries(entry).forEach(([field, value]) => {
    if (typeof value !== "string") return;
    checkValue(code, field, value);
  });
});

Object.entries(SESSION_ABOUT).forEach(([sessionId, entry]) => {
  checkValue(sessionId, "aboutMd", entry.aboutMd ?? "");
  checkValue(sessionId, "extraMd", entry.extraMd ?? "");
});

const guide = getGuideData();
checkValue("guide", "presentation", guide.presentation);
checkValue("guide", "conclusion", guide.conclusion);
checkValue("guide", "notes", guide.notes ?? "");
guide.sources.forEach((source, index) => {
  checkValue("guide", `sources[${index}]`, source);
});

if (!issues.length) {
  console.log("Editorial markdown check passed.");
  process.exit(0);
}

console.error(`Editorial markdown check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.scope} ${issue.field}: ${issue.label}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);
