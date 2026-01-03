import exercisesData from "@/data/exercises.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExercise as getLegacyExercise } from "@/lib/exercise-data";
import { editorialByCode } from "@/lib/editorial.generated";
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

export function getAllExercises(): ExerciseRecord[] {
  return exercisesWithEditorial;
}

export function getExerciseByCode(code: string): ExerciseRecord | undefined {
  const normalized = normalizeExerciseCode(code);
  const fromJson = exercisesWithEditorial.find(
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
