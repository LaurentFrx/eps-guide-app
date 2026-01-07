export const normalizeLineEndings = (value: string) =>
  value.replace(/\r\n?/g, "\n");

export const stripTrailingWhitespace = (value: string) =>
  value.replace(/[ \t]+$/gm, "");

export const collapseSpaces = (value: string) =>
  value.replace(/[ \t]{2,}/g, " ");

export const collapseNewlines = (value: string) =>
  value.replace(/\n{3,}/g, "\n\n");

export const normalizeTypography = (value: string) => {
  let output = normalizeLineEndings(value);
  output = stripTrailingWhitespace(output);
  output = output.replace(/^[ \t]*[•\u2022]\s+/gm, "- ");
  output = collapseSpaces(output);
  output = collapseNewlines(output);
  return output.trim();
};

export const normalizeForCompare = (value: string) =>
  value
    .toLowerCase()
    .replace(/[\u0153\u0152]/g, "oe")
    .replace(/[\u00E6\u00C6]/g, "ae")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const REF_PATTERNS: RegExp[] = [
  /\bidem\b/gi,
  /\bid\.\b/gi,
  /\bvoir\b\s+(?:l'|le|les)?\s*(?:exercice|exo|fiche)\b/gi,
  /\bvoir\b\s+(S[1-5]\s*[-_ ]\s*\d{1,2})\b/gi,
  /\bcf\.?\b\s+(?:l'|le|les)?\s*(?:exercice|exo|fiche)\b/gi,
  /\bcf\.?\b\s+(S[1-5]\s*[-_ ]\s*\d{1,2})\b/gi,
  /\bse\s+r[ée]f[ée]rer\b/gi,
  /\bcomme\s+l['’]exercice\b/gi,
  /\bexercice\s+S[1-5]\s*[-_ ]\s*\d{1,2}\b/gi,
];

export const stripReferralPhrases = (value: string) => {
  let output = value;
  for (const pattern of REF_PATTERNS) {
    output = output.replace(pattern, "");
  }
  output = output.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n");
  return output.trim();
};

export const hasReferralPhrase = (value: string) =>
  REF_PATTERNS.some((pattern) => pattern.test(value));

export const splitParagraphs = (value: string) =>
  normalizeLineEndings(value)
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
