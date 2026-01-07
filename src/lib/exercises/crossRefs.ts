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
  { key: "complementsMd", kind: "string" },
  { key: "safety", kind: "stringArray" },
  { key: "key_points", kind: "stringArray" },
  { key: "cues", kind: "stringArray" },
  { key: "sources", kind: "stringArray" },
];

const CODE_RE = /S\s*[1-5]\s*[-_]\s*\d{1,2}/gi;
const MARKER_BOUNDARY = "(?:^|[\\s\"'(),.;:!?\\[\\]{}])";
const MARKER_END = "(?=$|[\\s\"'(),.;:!?\\[\\]{}])";
const IDEM_RE = new RegExp(
  `${MARKER_BOUNDARY}(?:idem|id\\.)${MARKER_END}`,
  "i"
);
const REF_RE = new RegExp(
  `${MARKER_BOUNDARY}(?:voir|cf\\.?|ref\\.?|reference)${MARKER_END}`,
  "i"
);
const SOFT_MARKER_RE = new RegExp(
  `${MARKER_BOUNDARY}(?:identique|identiques|similaire|similaires|m(?:e|\\u00EA)me\\s+exercice)${MARKER_END}`,
  "i"
);
const EXO_RE = new RegExp(`${MARKER_BOUNDARY}(?:exercice|exo)${MARKER_END}`, "i");

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

export const hasReferenceMarker = (text: string, hasCode: boolean): boolean => {
  if (IDEM_RE.test(text)) return true;
  const softHit = SOFT_MARKER_RE.test(text) || REF_RE.test(text);
  if (!softHit) return false;
  return hasCode || EXO_RE.test(text);
};

export const findCrossReferenceCandidates = (
  text: string,
  currentCode: string
) => {
  const codes = extractReferenceCodes(text).filter((code) => code !== currentCode);
  const hasMarker = hasReferenceMarker(text, codes.length > 0);
  return { codes, hasMarker };
};

const buildCodePattern = (code: string) =>
  code.replace(/^S/, "S\\s*").replace("-", "\\s*[-_]?\\s*");

export const stripCrossReference = (text: string, refCode: string) => {
  const codePattern = buildCodePattern(refCode);
  const markerToken =
    "(?:idem|id\\.|voir|cf\\.?|ref\\.?|reference|identique|identiques|similaire|similaires|m(?:e|\\u00EA)me\\s+exercice)";
  const prepToken = "(?:a|\\u00E0|au|aux|de|d'|du|des)";
  const patterns = [
    new RegExp(
      `${markerToken}\\s+(?:${prepToken}\\s+)?${codePattern}`,
      "gi"
    ),
    new RegExp(`(?:exercice|exo)\\s+${codePattern}`, "gi"),
    new RegExp(codePattern, "gi"),
  ];

  let output = text;
  for (const pattern of patterns) {
    output = output.replace(pattern, "");
  }

  output = output
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n");
  return output.trim();
};
