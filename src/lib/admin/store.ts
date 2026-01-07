import { kv } from "@vercel/kv";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import type { ExerciseRecord } from "@/lib/exercises/schema";
import { isKvConfigured } from "@/lib/admin/env";

const overrideKey = (code: string) =>
  `exercise:override:${normalizeExerciseCode(code)}`;
const customKey = (code: string) =>
  `exercise:custom:${normalizeExerciseCode(code)}`;
const customIndexKey = "exercise:custom:index";

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
): Promise<Partial<ExerciseRecord> | null> {
  if (!ensureConfigured()) return null;
  const record = await kv.get<Partial<ExerciseRecord>>(overrideKey(code));
  return record ?? null;
}

export async function setOverride(
  code: string,
  override: Partial<ExerciseRecord>
) {
  if (!ensureConfigured()) return;
  await kv.set(overrideKey(code), override);
}

export async function deleteOverride(code: string) {
  if (!ensureConfigured()) return false;
  await kv.del(overrideKey(code));
  return true;
}

