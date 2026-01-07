import { getAllExercises } from "../src/lib/exercises/index";
import { UI_TEXT_FIELDS } from "../src/lib/exercises/crossRefs";
import { hasReferralPhrase } from "./editorial-utils";

type Issue = { code: string; field: string; excerpt: string };

const compact = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 160);

const issues: Issue[] = [];

for (const exercise of getAllExercises()) {
  for (const field of UI_TEXT_FIELDS) {
    const value = exercise[field.key];
    if (field.kind === "string") {
      if (typeof value !== "string" || !value.trim()) continue;
      if (!hasReferralPhrase(value)) continue;
      issues.push({
        code: exercise.code,
        field: String(field.key),
        excerpt: compact(value),
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!item || !item.trim()) return;
        if (!hasReferralPhrase(item)) return;
        issues.push({
          code: exercise.code,
          field: `${String(field.key)}[${index}]`,
          excerpt: compact(item),
        });
      });
    }
  }
}

if (!issues.length) {
  console.log("No referral phrases found.");
  process.exit(0);
}

console.error(`Referral check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.code} ${issue.field}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);
