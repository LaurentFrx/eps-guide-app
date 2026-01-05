import { getAllExercises } from "../src/lib/exercises/index";

type FieldSpec = { key: string; kind: "string" | "stringArray" };

const PLACEHOLDER_START: RegExp[] = [
  /^contenu\s+a\s+completer$/i,
  /^contenu\s+à\s+compléter$/i,
  /^\(omission/i,
  /^similaires?\b/i,
  /^identiques?\b/i,
];

const PLACEHOLDER_ANYWHERE: RegExp[] = [
  /omission/i,
  /suite des exercices/i,
  /\(les exercices/i,
  /\(en résumé/i,
  /\(en resume/i,
  /session\s+[1-5]\s+[–-]/i,
  /dosage pour le haut du corps varie/i,
  /\(\s*…/,
  /\(\s*\.\.\./,
];

const PLACEHOLDER_LINE_RE = /^le$/i;
const CODE_RE = /S[1-5]-\d{2}/g;
const ALLOWED_LEVELS = new Set(["Débutant", "Intermédiaire", "Avancé"]);

const TEXT_FIELDS: FieldSpec[] = [
  { key: "title", kind: "string" },
  { key: "equipment", kind: "string" },
  { key: "muscles", kind: "string" },
  { key: "objective", kind: "string" },
  { key: "anatomy", kind: "string" },
  { key: "biomechanics", kind: "string" },
  { key: "benefits", kind: "string" },
  { key: "contraindications", kind: "string" },
  { key: "regress", kind: "string" },
  { key: "progress", kind: "string" },
  { key: "dosage", kind: "string" },
  { key: "materielMd", kind: "string" },
  { key: "consignesMd", kind: "string" },
  { key: "dosageMd", kind: "string" },
  { key: "securiteMd", kind: "string" },
  { key: "detailMd", kind: "string" },
  { key: "safety", kind: "stringArray" },
  { key: "key_points", kind: "stringArray" },
];

type Issue = { code: string; field: string; message: string; excerpt: string };
const issues: Issue[] = [];

const addIssue = (code: string, field: string, message: string, value: string) => {
  issues.push({
    code,
    field,
    message,
    excerpt: value.replace(/\s+/g, " ").trim().slice(0, 160),
  });
};

const hasPlaceholder = (value: string) => {
  if (PLACEHOLDER_ANYWHERE.some((re) => re.test(value))) return true;
  return PLACEHOLDER_START.some((re) => re.test(value.trim()));
};

const hasPlaceholderLine = (value: string) =>
  value.split(/\r?\n/).some((line) => PLACEHOLDER_LINE_RE.test(line.trim()));

const findForeignCodes = (value: string, current: string) => {
  const matches = value.match(CODE_RE) ?? [];
  return Array.from(new Set(matches.filter((code) => code !== current)));
};

for (const exercise of getAllExercises()) {
  if (!ALLOWED_LEVELS.has(exercise.level)) {
    addIssue(
      exercise.code,
      "level",
      "invalid level",
      exercise.level || "(empty)"
    );
  }

  for (const field of TEXT_FIELDS) {
    const value = (exercise as Record<string, unknown>)[field.key];
    if (field.kind === "string") {
      if (typeof value !== "string" || !value.trim()) continue;
      if (hasPlaceholder(value)) {
        addIssue(exercise.code, field.key, "placeholder text", value);
      }
      if (hasPlaceholderLine(value)) {
        addIssue(exercise.code, field.key, "isolated 'Le' line", value);
      }
      if (["dosage", "dosageMd"].includes(field.key)) {
        const foreign = findForeignCodes(value, exercise.code);
        if (foreign.length) {
          addIssue(
            exercise.code,
            field.key,
            `foreign codes: ${foreign.join(", ")}`,
            value
          );
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item !== "string" || !item.trim()) return;
        if (hasPlaceholder(item)) {
          addIssue(
            exercise.code,
            `${field.key}[${index}]`,
            "placeholder text",
            item
          );
        }
        if (hasPlaceholderLine(item)) {
          addIssue(
            exercise.code,
            `${field.key}[${index}]`,
            "isolated 'Le' line",
            item
          );
        }
        if (["safety", "key_points"].includes(field.key)) {
          const foreign = findForeignCodes(item, exercise.code);
          if (foreign.length) {
            addIssue(
              exercise.code,
              `${field.key}[${index}]`,
              `foreign codes: ${foreign.join(", ")}`,
              item
            );
          }
        }
      });
    }
  }
}

if (!issues.length) {
  console.log("Editorial integrity check passed.");
  process.exit(0);
}

console.error(`Editorial integrity check failed (${issues.length}).`);
issues.forEach((issue) => {
  console.error(`- ${issue.code} ${issue.field}: ${issue.message}`);
  console.error(`  ${issue.excerpt}`);
});
process.exit(1);


