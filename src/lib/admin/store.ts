import { kv } from "@vercel/kv";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import type { ExerciseRecord } from "@/lib/exercises/schema";
import { isKvConfigured } from "@/lib/admin/env";

export type OverrideRecord = Partial<ExerciseRecord> & { updatedAt?: string };
export type OverrideSummary = { code: string; updatedAt?: string };

const overrideKey = (code: string) =>
  `admin:exercise:${normalizeExerciseCode(code)}`;
const legacyOverrideKey = (code: string) =>
  `exercise:override:${normalizeExerciseCode(code)}`;
const customKey = (code: string) =>
  `exercise:custom:${normalizeExerciseCode(code)}`;
const customIndexKey = "exercise:custom:index";
const overrideIndexKey = "admin:exercise:index";

const ensureConfigured = () => isKvConfigured();

const normalizeIndex = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((code) => normalizeExerciseCode(code));
};

export async function listCustomCodes(): Promise<string[]> {
  if (!ensureConfigured()) return [];
  const value = await kv.get(customIndexKey);
  return normalizeIndex(value);
}

export async function setCustomIndex(codes: string[]) {
  if (!ensureConfigured()) return;
  const normalized = Array.from(
    new Set(codes.map((code) => normalizeExerciseCode(code)))
  ).sort();
  await kv.set(customIndexKey, normalized);
}

export async function listOverrideCodes(): Promise<string[]> {
  if (!ensureConfigured()) return [];
  const value = await kv.get(overrideIndexKey);
  return normalizeIndex(value);
}

export async function setOverrideIndex(codes: string[]) {
  if (!ensureConfigured()) return;
  const normalized = Array.from(
    new Set(codes.map((code) => normalizeExerciseCode(code)))
  ).sort();
  await kv.set(overrideIndexKey, normalized);
}

export async function getCustomExercise(
  code: string
): Promise<ExerciseRecord | null> {
  if (!ensureConfigured()) return null;
  const record = await kv.get<ExerciseRecord>(customKey(code));
  return record ?? null;
}

export async function setCustomExercise(record: ExerciseRecord) {
  if (!ensureConfigured()) return;
  const code = normalizeExerciseCode(record.code);
  await kv.set(customKey(code), record);
  const index = await listCustomCodes();
  if (!index.includes(code)) {
    index.push(code);
    await setCustomIndex(index);
  }
}

export async function deleteCustomExercise(code: string) {
  if (!ensureConfigured()) return false;
  const normalized = normalizeExerciseCode(code);
  await kv.del(customKey(normalized));
  const index = await listCustomCodes();
  await setCustomIndex(index.filter((item) => item !== normalized));
  return true;
}

export async function getOverride(
  code: string
): Promise<OverrideRecord | null> {
  if (!ensureConfigured()) return null;
  const record = await kv.get<OverrideRecord>(overrideKey(code));
  if (record) return record;
  const legacy = await kv.get<OverrideRecord>(legacyOverrideKey(code));
  return legacy ?? null;
}

export async function setOverride(
  code: string,
  override: OverrideRecord
) {
  if (!ensureConfigured()) return;
  const normalized = normalizeExerciseCode(code);
  const record = {
    ...override,
    updatedAt: override.updatedAt ?? new Date().toISOString(),
  };
  await kv.set(overrideKey(normalized), record);
  await kv.set(legacyOverrideKey(normalized), record);
  const index = await listOverrideCodes();
  if (!index.includes(normalized)) {
    index.push(normalized);
    await setOverrideIndex(index);
  }
}

export async function deleteOverride(code: string) {
  if (!ensureConfigured()) return false;
  const normalized = normalizeExerciseCode(code);
  await kv.del(overrideKey(normalized));
  await kv.del(legacyOverrideKey(normalized));
  const index = await listOverrideCodes();
  await setOverrideIndex(index.filter((item) => item !== normalized));
  return true;
}

export async function listOverrideSummaries(): Promise<OverrideSummary[]> {
  if (!ensureConfigured()) return [];
  const codes = await listOverrideCodes();
  const summaries: OverrideSummary[] = [];
  for (const code of codes) {
    const record = await getOverride(code);
    if (record) {
      summaries.push({ code, updatedAt: record.updatedAt });
    }
  }
  return summaries;
}

export async function getOverrideSummariesForCodes(
  codes: string[]
): Promise<OverrideSummary[]> {
  if (!ensureConfigured()) return [];
  const summaries: OverrideSummary[] = [];
  for (const code of codes) {
    const record = await getOverride(code);
    if (record) {
      summaries.push({ code, updatedAt: record.updatedAt });
    }
  }
  return summaries;
}

