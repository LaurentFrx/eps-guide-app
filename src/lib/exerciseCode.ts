const CODE_RE = /^S([1-5])[-_]?(\d+)$/i;

export function normalizeExerciseCode(input: string): string {
  const raw = input.trim().toUpperCase().replace(/_/g, "-");
  const match = raw.match(CODE_RE);
  if (!match) return raw;
  const session = Number(match[1]);
  const num = Number(match[2]);
  if (!Number.isFinite(session) || !Number.isFinite(num)) return raw;
  return `S${session}-${String(num).padStart(2, "0")}`;
}

export function isValidExerciseCode(code: string): boolean {
  return /^S[1-5]-\d{2}$/.test(code);
}
