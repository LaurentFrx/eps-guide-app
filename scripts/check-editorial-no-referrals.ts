import { getAllExercises } from "../src/lib/exercises/index";
import { UI_TEXT_FIELDS } from "../src/lib/exercises/crossRefs";
import { SESSION_ABOUT } from "../src/lib/editorial/sessions.generated";
import { getGuideData } from "../src/lib/editorial";

const REFERRAL_RE = /\b(idem|identique(?:s)?|similaire(?:s)?)\b/i;

type Issue = { scope: string; field: string; excerpt: string };
const issues: Issue[] = [];

const compact = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 160);

const checkValue = (scope: string, field: string, value: string) => {
  if (!value || !value.trim()) return;
  if (!REFERRAL_RE.test(value)) return;
  issues.push({ scope, field, excerpt: compact(value) });
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
  console.log("Editorial referral check passed.");
  process.exit(0);
}

console.error(`Editorial referral check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.scope} ${issue.field}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);
