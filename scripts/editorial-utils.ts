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
  output = output.replace(/^\s*\*\s*-\s+/gm, "- ");
  output = output.replace(/^\s*-\s*-\s+/gm, "- ");
  output = output.replace(
    /^\s*[\u0007\u00B7\u2022\u2023\u2043\u2219\u25AA\u25AB\u25CF\u25E6]\s+/gm,
    "- "
  );
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
  /\bidentique(s)?\b/gi,
  /\bsimilaire(s)?\b/gi,
  /\bsemblable(s)?\b/gi,
  /\bcf\.\b/gi,
  /\bcf\./gi,
  /\bvoir\b\s+(?:l'|le|les)?\s*(?:exercice|exo|fiche)\b/gi,
  /\bvoir\b\s+(S[1-5]\s*[-_ ]\s*\d{1,2})\b/gi,
  /\bcf\.?\b\s+(?:l'|le|les)?\s*(?:exercice|exo|fiche)\b/gi,
  /\bcf\.?\b\s+(S[1-5]\s*[-_ ]\s*\d{1,2})\b/gi,
  /\bse\s+r[ée]f[ée]rer\b/gi,
  /\bse\s+r[e\u00E9]f[e\u00E9]rer\b/gi,
  /\bcomme\s+l['']exercice\b/gi,
  /\bexercice\s+S[1-5]\s*[-_ ]\s*\d{1,2}\b/gi,
];

export const stripReferralPhrases = (value: string) => {
  let output = value;
  output = output.replace(
    /\bsimilaire(s)?\b/gi,
    (_match, plural) => (plural ? "comparables" : "comparable")
  );
  output = output.replace(
    /\bsemblable(s)?\b/gi,
    (_match, plural) => (plural ? "comparables" : "comparable")
  );
  output = output.replace(
    /\bidentique(s)?\b/gi,
    (_match, plural) => (plural ? "equivalents" : "equivalent")
  );
  output = output.replace(/\bidem\b/gi, "meme");
  output = output.replace(/\bid\.\b/gi, "meme");
  output = output.replace(/\bcf\./gi, "");
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

