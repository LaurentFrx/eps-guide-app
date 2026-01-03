import exercisesData from "@/data/exercises.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExercise as getLegacyExercise } from "@/lib/exercise-data";
import { normalizeExerciseRecord, type ExerciseRecord } from "@/lib/exercises/schema";

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

export function getAllExercises(): ExerciseRecord[] {
  return exercisesFromJson;
}

export function getExerciseByCode(code: string): ExerciseRecord | undefined {
  const normalized = normalizeExerciseCode(code);
  const fromJson = exercisesFromJson.find(
    (exercise) => normalizeExerciseCode(exercise.code) === normalized
  );

  if (fromJson) return fromJson;

  const legacy = getLegacyExercise(normalized);
  if (!legacy) return undefined;

  return normalizeExerciseRecord({
    code: legacy.code,
    title: legacy.title,
    level: legacy.level,
    equipment: legacy.equipment,
    muscles: legacy.muscles,
    objective: legacy.objective,
    anatomy: legacy.anatomy,
    safety: legacy.safety,
    key_points: legacy.key_points,
    regress: legacy.regress,
    progress: legacy.progress,
    dosage: legacy.dosage,
    image: legacy.image,
  });
}
