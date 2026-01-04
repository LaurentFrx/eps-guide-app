import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import type { ExerciseRecord } from "@/lib/exercises/schema";

export type TextFieldSpec = {
  key: keyof ExerciseRecord;
  kind: "string" | "stringArray";
};

export const UI_TEXT_FIELDS: TextFieldSpec[] = [
  { key: "title", kind: "string" },
  { key: "level", kind: "string" },
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
  { key: "fullMdRaw", kind: "string" },
  { key: "safety", kind: "stringArray" },
  { key: "key_points", kind: "stringArray" },
  { key: "cues", kind: "stringArray" },
  { key: "sources", kind: "stringArray" },
];

const CODE_RE = /S\s*[1-5]\s*[-_]\s*\d{1,2}/gi;
const MARKER_RE =
  /\b(idem|id\.|voir|cf\.?|réf\.?|reference|référence|même|meme|identique|similaire)\b/i;

const normalizeCodeToken = (token: string) => {
  const cleaned = token.replace(/\s+/g, "");
  const normalized = normalizeExerciseCode(cleaned);
  return isValidExerciseCode(normalized) ? normalized : null;
};

export const extractReferenceCodes = (text: string): string[] => {
  const matches = text.match(CODE_RE) ?? [];
  const codes = matches
    .map((match) => normalizeCodeToken(match))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(codes));
};

export const hasReferenceMarker = (text: string): boolean => MARKER_RE.test(text);

export const findCrossReferenceCandidates = (
  text: string,
  currentCode: string
) => {
  const codes = extractReferenceCodes(text).filter((code) => code !== currentCode);
  const hasMarker = hasReferenceMarker(text);
  return { codes, hasMarker };
};

const buildCodePattern = (code: string) =>
  code.replace(/^S/, "S\\s*").replace("-", "\\s*[-_]?\\s*");

export const stripCrossReference = (text: string, refCode: string) => {
  const codePattern = buildCodePattern(refCode);
  const patterns = [
    new RegExp(
      `\\b(?:idem|id\\.|voir|cf\\.?|réf\\.?|reference|référence|même|meme|identique|similaire)\\b[^\\n]*${codePattern}[^\\n]*`,
      "gi"
    ),
    new RegExp(`\\b(?:exercice|exo)\\b[^\\n]*${codePattern}[^\\n]*`, "gi"),
    new RegExp(codePattern, "gi"),
  ];

  let output = text;
  for (const pattern of patterns) {
    output = output.replace(pattern, "");
  }

  output = output.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
  return output.trim();
};
