import { normalizeExerciseCode } from "@/lib/exerciseCode";

export type ExerciseRecord = {
  code: string;
  title: string;
  level: string;
  equipment: string;
  muscles: string;
  objective: string;
  anatomy: string;
  safety: string[];
  key_points: string[];
  regress: string;
  progress: string;
  dosage: string;
  image?: string;
};

type ExerciseInput = Partial<{
  code: unknown;
  title: unknown;
  level: unknown;
  equipment: unknown;
  muscles: unknown;
  objective: unknown;
  anatomy: unknown;
  safety: unknown;
  key_points: unknown;
  regress: unknown;
  progress: unknown;
  dosage: unknown;
  image: unknown;
}>;

const toString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

const toEquipment = (value: unknown): string => {
  if (Array.isArray(value)) {
    const items = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return items.join(", ");
  }
  return toString(value);
};

export function normalizeExerciseRecord(input: ExerciseInput): ExerciseRecord {
  const normalizedCode = normalizeExerciseCode(toString(input.code));

  return {
    code: normalizedCode,
    title: toString(input.title),
    level: toString(input.level),
    equipment: toEquipment(input.equipment),
    muscles: toString(input.muscles),
    objective: toString(input.objective),
    anatomy: toString(input.anatomy),
    safety: toStringArray(input.safety),
    key_points: toStringArray(input.key_points),
    regress: toString(input.regress),
    progress: toString(input.progress),
    dosage: toString(input.dosage),
    image: toString(input.image) || undefined,
  };
}
