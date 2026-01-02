import data from "@/data/exercises.json";
import { EXERCISES_FROM_PDF } from "@/data/exercisesFromPdf";
import { normalizeExerciseCode } from "@/lib/exerciseCode";

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

function getSessionNumFromCode(code: string): number | null {
  const match = code.match(/^S([1-5])-/);
  if (!match) return null;
  return Number(match[1]);
}

const pdfExercises = EXERCISES_FROM_PDF.map((exercise) => ({
  ...exercise,
  code: normalizeExerciseCode(exercise.code),
}));

const baseSessions = (typed.sessions ?? []).map((session) => ({
  ...session,
  exercises: session.exercises.map((exercise) => ({
    ...exercise,
    code: normalizeExerciseCode(exercise.code),
  })),
}));

const mergedSessions: Session[] = baseSessions.map((session) => {
  const existing = new Map(session.exercises.map((exercise) => [exercise.code, exercise]));
  const exercises = [...session.exercises];

  for (const exercise of pdfExercises) {
    const sessionNum = getSessionNumFromCode(exercise.code);
    if (sessionNum !== session.num) continue;
    if (existing.has(exercise.code)) continue;
    exercises.push(exercise);
  }

  return {
    ...session,
    exercises,
  };
});

const sessionNums = new Set(mergedSessions.map((session) => session.num));
for (const exercise of pdfExercises) {
  const sessionNum = getSessionNumFromCode(exercise.code);
  if (!sessionNum || sessionNums.has(sessionNum)) continue;
  const exercises = pdfExercises.filter(
    (item) => getSessionNumFromCode(item.code) === sessionNum
  );
  mergedSessions.push({
    num: sessionNum,
    title: `Session ${sessionNum}`,
    subtitle: `Session ${sessionNum}`,
    exercises,
  });
  sessionNums.add(sessionNum);
}

mergedSessions.sort((a, b) => a.num - b.num);

export const sessions = mergedSessions;
export const isMockData = Boolean(typed.meta?.is_mock);
export const mockWarning =
  typed.meta?.warning ?? "Données de démonstration actives.";

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

export const getExercise = (code: string) => {
  const normalized = normalizeExerciseCode(code);
  return allExercises.find((exercise) => exercise.code === normalized) ?? null;
};

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
