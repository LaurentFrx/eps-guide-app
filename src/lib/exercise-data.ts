import data from "@/data/exercises.json";

export type Exercise = {
  code: string;
  title: string;
  level: string;
  equipment: string;
  muscles: string;
  objective: string;
  anatomy: string;
  key_points: string[];
  safety: string[];
  regress: string;
  progress: string;
  dosage: string;
  image: string;
};

export type Session = {
  num: number;
  title: string;
  subtitle: string;
  exercises: Exercise[];
};

export type ExercisesData = {
  meta?: {
    is_mock?: boolean;
    warning?: string;
    source_docs?: string[];
  };
  sessions: Session[];
};

export type ExerciseWithSession = Exercise & {
  sessionNum: number;
  sessionTitle: string;
};

const typed = data as ExercisesData;

export const sessions = typed.sessions ?? [];
export const isMockData = Boolean(typed.meta?.is_mock);
export const mockWarning =
  typed.meta?.warning ?? "Donnees de demonstration actives.";

export const allExercises: ExerciseWithSession[] = sessions.flatMap((session) =>
  session.exercises.map((exercise) => ({
    ...exercise,
    sessionNum: session.num,
    sessionTitle: session.title,
  }))
);

export const levels = Array.from(
  new Set(allExercises.map((exercise) => exercise.level))
).sort();

export const equipmentOptions = Array.from(
  new Set(allExercises.map((exercise) => exercise.equipment))
).sort();

export const sessionOptions = sessions.map((session) => ({
  num: session.num,
  title: session.title,
}));

export const getSession = (num: number) =>
  sessions.find((session) => session.num === num) ?? null;

export const getExercise = (code: string) =>
  allExercises.find((exercise) => exercise.code === code.toUpperCase()) ?? null;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export const filterExercises = (options: {
  query?: string;
  level?: string;
  equipment?: string;
  sessionNum?: number;
}) => {
  const query = options.query ? normalizeText(options.query) : "";
  const level = options.level && options.level !== "Tous" ? options.level : "";
  const equipment =
    options.equipment && options.equipment !== "Tous"
      ? options.equipment
      : "";
  const sessionNum = options.sessionNum ?? null;

  return allExercises.filter((exercise) => {
    if (level && exercise.level !== level) {
      return false;
    }
    if (equipment && exercise.equipment !== equipment) {
      return false;
    }
    if (sessionNum && exercise.sessionNum !== sessionNum) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = normalizeText(
      `${exercise.title} ${exercise.code} ${exercise.muscles} ${exercise.equipment}`
    );
    return haystack.includes(query);
  });
};
