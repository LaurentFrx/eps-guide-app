import exercisesData from "@/data/exercises.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExercise as getLegacyExercise } from "@/lib/exercise-data";
import { editorialByCode } from "@/lib/editorial.generated";
import { normalizeExerciseRecord, type ExerciseRecord } from "@/lib/exercises/schema";
import {
  UI_TEXT_FIELDS,
  findCrossReferenceCandidates,
  stripCrossReference,
} from "@/lib/exercises/crossRefs";

type ExercisesData = {
  sessions?: Array<{
    exercises?: unknown[];
  }>;
};

const typedData = exercisesData as ExercisesData;

const exercisesFromJson: ExerciseRecord[] = (typedData.sessions ?? [])
  .flatMap((session) => session.exercises ?? [])
  .map((exercise) => normalizeExerciseRecord(exercise ?? {}))
  .filter((exercise) => exercise.code.length > 0);

const withEditorial = (exercise: ExerciseRecord): ExerciseRecord => {
  const normalized = normalizeExerciseCode(exercise.code);
  const editorial = editorialByCode[normalized];
  if (!editorial) return exercise;
  return {
    ...exercise,
    materielMd: editorial.materielMd,
    consignesMd: editorial.consignesMd,
    dosageMd: editorial.dosageMd,
    securiteMd: editorial.securiteMd,
    detailMd: editorial.detailMd,
    fullMdRaw: editorial.fullMdRaw,
  };
};

const exercisesWithEditorial = exercisesFromJson.map(withEditorial);

const expandExerciseText = (records: ExerciseRecord[]): ExerciseRecord[] => {
  const byCode = new Map(
    records.map((record) => [normalizeExerciseCode(record.code), record])
  );
  const cache = new Map<string, ExerciseRecord>();
  const stack = new Set<string>();

  const expandRecord = (record: ExerciseRecord): ExerciseRecord => {
    const code = normalizeExerciseCode(record.code);
    const cached = cache.get(code);
    if (cached) return cached;
    if (stack.has(code)) {
      throw new Error(`Cross-reference cycle detected for ${code}`);
    }
    stack.add(code);

    const next: ExerciseRecord = { ...record };

    for (const field of UI_TEXT_FIELDS) {
      const value = next[field.key];
      if (field.kind === "string") {
        if (typeof value === "string" && value.trim()) {
          next[field.key] = expandStringField(code, field.key, value, byCode);
        }
      } else if (Array.isArray(value) && value.length) {
        const joined = value.join("\n");
        const expanded = expandStringField(code, field.key, joined, byCode);
        next[field.key] =
          expanded === joined ? value : expanded.split(/\n+/).filter(Boolean);
      }
    }

    cache.set(code, next);
    stack.delete(code);
    return next;
  };

  const expandStringField = (
    currentCode: string,
    fieldKey: keyof ExerciseRecord,
    text: string,
    recordMap: Map<string, ExerciseRecord>
  ): string => {
    const { codes, hasMarker } = findCrossReferenceCandidates(text, currentCode);
    if (!codes.length) {
      if (hasMarker) {
        throw new Error(
          `Unresolved cross-reference marker in ${currentCode}.${String(
            fieldKey
          )}`
        );
      }
      return text;
    }
    if (codes.length > 1) {
      throw new Error(
        `Multiple cross-references in ${currentCode}.${String(fieldKey)}: ${codes.join(
          ", "
        )}`
      );
    }

    const refCode = codes[0];
    const referenced = recordMap.get(refCode);
    if (!referenced) {
      throw new Error(
        `Missing referenced exercise ${refCode} in ${currentCode}.${String(
          fieldKey
        )}`
      );
    }

    const expandedReferenced = expandRecord(referenced);
    const refValue = expandedReferenced[fieldKey];
    const refText = Array.isArray(refValue) ? refValue.join("\n") : refValue;
    if (!refText || !refText.toString().trim()) {
      throw new Error(
        `Empty referenced field ${refCode}.${String(fieldKey)} used by ${currentCode}`
      );
    }

    const remainder = stripCrossReference(text, refCode);
    if (!remainder) return String(refText);
    return `${refText}\n${remainder}`;
  };

  return records.map((record) => expandRecord(record));
};

const expandedExercises = expandExerciseText(exercisesWithEditorial);

export function getAllExercises(): ExerciseRecord[] {
  return expandedExercises;
}

export function getAllExercisesRaw(): ExerciseRecord[] {
  return exercisesWithEditorial;
}

export function getExerciseByCode(code: string): ExerciseRecord | undefined {
  const normalized = normalizeExerciseCode(code);
  const fromJson = expandedExercises.find(
    (exercise) => normalizeExerciseCode(exercise.code) === normalized
  );

  if (fromJson) return fromJson;

  const legacy = getLegacyExercise(normalized);
  if (!legacy) return undefined;

  return withEditorial(
    normalizeExerciseRecord({
    code: legacy.code,
    title: legacy.title,
    level: legacy.level,
    equipment: legacy.equipment,
    muscles: legacy.muscles,
    objective: legacy.objective,
    anatomy: legacy.anatomy,
    biomechanics: "",
    benefits: "",
    contraindications: "",
    safety: legacy.safety,
    key_points: legacy.key_points,
    cues: [],
    sources: [],
    regress: legacy.regress,
    progress: legacy.progress,
    dosage: legacy.dosage,
    image: legacy.image,
    })
  );
}
