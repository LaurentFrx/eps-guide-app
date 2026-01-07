import { getAllExercises } from "../src/lib/exercises/index";
import { UI_TEXT_FIELDS } from "../src/lib/exercises/crossRefs";

type Issue = { code: string; field: string; message: string; excerpt: string };

const compact = (value: string) => value.replace(/\s+/g, " ").trim().slice(0, 160);

const issues: Issue[] = [];

const hasTrailingWhitespace = (value: string) => /[ \t]+$/m.test(value);
const hasDoubleSpaces = (value: string) => /[^\n][ \t]{2,}[^\n]/.test(value);
const hasExcessNewlines = (value: string) => /\n{3,}/.test(value);
const hasEmptyHeading = (value: string) => /(^|\n)[^:\n]{2,}:\s*$/m.test(value);

const addIssue = (code: string, field: string, message: string, value: string) => {
  issues.push({ code, field, message, excerpt: compact(value) });
};

for (const exercise of getAllExercises()) {
  for (const field of UI_TEXT_FIELDS) {
    const value = exercise[field.key];
    if (field.kind === "string") {
      if (typeof value !== "string" || !value.trim()) continue;
      if (hasTrailingWhitespace(value)) {
        addIssue(exercise.code, String(field.key), "trailing whitespace", value);
      }
      if (hasDoubleSpaces(value)) {
        addIssue(exercise.code, String(field.key), "double spaces", value);
      }
      if (hasExcessNewlines(value)) {
        addIssue(exercise.code, String(field.key), "excess newlines", value);
      }
      if (hasEmptyHeading(value)) {
        addIssue(exercise.code, String(field.key), "empty heading", value);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!item || !item.trim()) return;
        if (hasTrailingWhitespace(item)) {
          addIssue(
            exercise.code,
            `${String(field.key)}[${index}]`,
            "trailing whitespace",
            item
          );
        }
        if (hasDoubleSpaces(item)) {
          addIssue(
            exercise.code,
            `${String(field.key)}[${index}]`,
            "double spaces",
            item
          );
        }
        if (hasExcessNewlines(item)) {
          addIssue(
            exercise.code,
            `${String(field.key)}[${index}]`,
            "excess newlines",
            item
          );
        }
        if (hasEmptyHeading(item)) {
          addIssue(
            exercise.code,
            `${String(field.key)}[${index}]`,
            "empty heading",
            item
          );
        }
      });
    }
  }
}

if (!issues.length) {
  console.log("Typography check passed.");
  process.exit(0);
}

console.error(`Typography check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.code} ${issue.field}: ${issue.message}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);
