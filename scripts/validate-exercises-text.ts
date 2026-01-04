import { getAllExercises } from "../src/lib/exercises/index";
import {
  UI_TEXT_FIELDS,
  findCrossReferenceCandidates,
} from "../src/lib/exercises/crossRefs";

type ErrorItem = {
  code: string;
  field: string;
  excerpt: string;
  references: string[];
};

const compactExcerpt = (value: string) =>
  value.replace(/\s+/g, " ").trim().slice(0, 160);

const errors: ErrorItem[] = [];

for (const exercise of getAllExercises()) {
  const code = exercise.code;
  for (const field of UI_TEXT_FIELDS) {
    const value = exercise[field.key];
    if (field.kind === "string") {
      if (typeof value !== "string" || !value.trim()) continue;
      const { codes, hasMarker } = findCrossReferenceCandidates(value, code);
      if (!codes.length && !hasMarker) continue;
      errors.push({
        code,
        field: String(field.key),
        excerpt: compactExcerpt(value),
        references: codes.length ? codes : ["(marker without code)"],
      });
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!item || !item.trim()) return;
        const { codes, hasMarker } = findCrossReferenceCandidates(item, code);
        if (!codes.length && !hasMarker) return;
        errors.push({
          code,
          field: `${String(field.key)}[${index}]`,
          excerpt: compactExcerpt(item),
          references: codes.length ? codes : ["(marker without code)"],
        });
      });
    }
  }
}

if (!errors.length) {
  console.log("Cross-reference validation passed.");
  process.exit(0);
}

console.error(`Cross-reference validation failed (${errors.length}).`);
errors.forEach((error) => {
  const refs = error.references.join(", ");
  console.error(`- ${error.code} ${error.field} -> ${refs}`);
  console.error(`  ${error.excerpt}`);
});
process.exit(1);
