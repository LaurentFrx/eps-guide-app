import data from "@/data/exercises.json";
import { EXERCISES_FROM_PDF } from "@/data/exercisesFromPdf";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { applyExercisePatch } from "@/lib/editorial/exercisePatches";
import { SESSIONS_EDITORIAL, type SessionId } from "@/lib/editorial/sessions";

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
  chips: string[];
  introMd: string;
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

const MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u00C3\u00A9/g, "\u00E9"],
  [/\u00C3\u00A8/g, "\u00E8"],
  [/\u00C3\u00AA/g, "\u00EA"],
  [/\u00C3\u00AB/g, "\u00EB"],
  [/\u00C3\u00A0/g, "\u00E0"],
  [/\u00C3\u00A2/g, "\u00E2"],
  [/\u00C3\u00AE/g, "\u00EE"],
  [/\u00C3\u00AF/g, "\u00EF"],
  [/\u00C3\u00B4/g, "\u00F4"],
  [/\u00C3\u00B6/g, "\u00F6"],
  [/\u00C3\u00B9/g, "\u00F9"],
  [/\u00C3\u00BB/g, "\u00FB"],
  [/\u00C3\u00BC/g, "\u00FC"],
  [/\u00C3\u00A7/g, "\u00E7"],
  [/\u00C3\u0089/g, "\u00C9"],
  [/\u00C3\u0080/g, "\u00C0"],
  [/\u00C3\u0082/g, "\u00C2"],
  [/\u00C3\u0087/g, "\u00C7"],
  [/\u201A/g, "\u00E9"],
];

function fixMojibake(value: string) {
  let out = value;
  for (const [pattern, replacement] of MOJIBAKE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function normalizeText(value: string) {
  return fixMojibake(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function normalizeLevelLabel(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return fixMojibake(value.trim());
  if (normalized === "debutant") return "D\u00E9butant";
  if (normalized === "intermediaire") return "Interm\u00E9diaire";
  if (normalized === "avance") return "Avanc\u00E9";
  return fixMojibake(value.trim());
}

export function normalizeEquipmentLabel(value: string): string {
  const trimmed = fixMojibake(value.trim());
  const normalized = normalizeText(trimmed)
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized || normalized === "aucun" || normalized === "sans materiel") {
    return "Aucun";
  }
  if (
    normalized === "medecine ball" ||
    normalized === "medecine-ball" ||
    normalized === "medicine ball"
  ) {
    return "M\u00E9decine-ball";
  }
  if (normalized === "tapis") {
    return "Tapis";
  }
  if (normalized.startsWith("swiss ball")) {
    return "Swiss Ball (gros ballon)";
  }
  return trimmed;
}

export function splitEquipment(value: string): string[] {
  const tokens = value
    .split(",")
    .map((item) => normalizeEquipmentLabel(item))
    .filter(Boolean);
  return Array.from(new Set(tokens));
}


const typed = data as ExercisesData;

function getSessionNumFromCode(code: string): number | null {
  const match = code.match(/^S([1-5])-/);
  if (!match) return null;
  return Number(match[1]);
}

const getSessionId = (num: number) => `S${num}` as SessionId;

const getSessionEditorial = (num: number) => SESSIONS_EDITORIAL[getSessionId(num)];

const normalizeExercise = (exercise: Exercise): Exercise => {
  const normalized: Exercise = {
    ...exercise,
    code: normalizeExerciseCode(exercise.code),
  };
  const patched = applyExercisePatch(normalized);
  return {
    ...patched,
    level: normalizeLevelLabel(patched.level),
  };
};

const pdfExercises = EXERCISES_FROM_PDF.map((exercise) => ({
  ...normalizeExercise(exercise),
}));

const baseSessions = (typed.sessions ?? []).map((session) => ({
  ...session,
  title: getSessionEditorial(session.num)?.title ?? session.title,
  subtitle: getSessionEditorial(session.num)?.subtitle ?? session.subtitle,
  chips: getSessionEditorial(session.num)?.chips ?? [],
  introMd: getSessionEditorial(session.num)?.introMd ?? "",
  exercises: session.exercises.map((exercise) => normalizeExercise(exercise)),
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
  const editorial = getSessionEditorial(sessionNum);
  const exercises = pdfExercises.filter(
    (item) => getSessionNumFromCode(item.code) === sessionNum
  );
  mergedSessions.push({
    num: sessionNum,
    title: editorial?.title ?? `Session ${sessionNum}`,
    subtitle: editorial?.subtitle ?? `Session ${sessionNum}`,
    chips: editorial?.chips ?? [],
    introMd: editorial?.introMd ?? "",
    exercises,
  });
  sessionNums.add(sessionNum);
}

mergedSessions.sort((a, b) => a.num - b.num);

export const sessions = mergedSessions;
export const isMockData = Boolean(typed.meta?.is_mock);
export const mockWarning =
  typed.meta?.warning ?? "Donn\u00E9es de d\u00E9monstration actives.";

export const allExercises: ExerciseWithSession[] = sessions.flatMap((session) =>
  session.exercises.map((exercise) => ({
    ...exercise,
    sessionNum: session.num,
    sessionTitle: session.title,
  }))
);


const levelSet = new Set(
  allExercises.map((exercise) => normalizeLevelLabel(exercise.level))
);
const LEVEL_ORDER = ["D\u00E9butant", "Interm\u00E9diaire", "Avanc\u00E9"];
export const levels = LEVEL_ORDER.filter((level) => levelSet.has(level));

export const equipmentOptions = Array.from(
  new Set(allExercises.flatMap((exercise) => splitEquipment(exercise.equipment)))
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

export const filterExercises = (options: {
  query?: string;
  level?: string;
  equipment?: string;
  sessionNum?: number;
}) => {
  const query = options.query ? normalizeText(options.query) : "";
  const level =
    options.level && options.level !== "Tous"
      ? normalizeLevelLabel(options.level)
      : "";
  const equipment =
    options.equipment && options.equipment !== "Tous"
      ? normalizeEquipmentLabel(options.equipment)
      : "";
  const sessionNum = options.sessionNum ?? null;

  return allExercises.filter((exercise) => {
    const exerciseLevel = normalizeLevelLabel(exercise.level);
    if (level && exerciseLevel !== level) {
      return false;
    }
    if (equipment) {
      const tokens = splitEquipment(exercise.equipment);
      if (!tokens.includes(equipment)) {
        return false;
      }
    }
    if (sessionNum && exercise.sessionNum !== sessionNum) {
      return false;
    }
    if (!query) {
      return true;
    }
    const equipmentText = splitEquipment(exercise.equipment).join(" ");
    const haystack = normalizeText(
      `${exercise.title} ${exercise.code} ${exercise.muscles} ${equipmentText}`
    );
    return haystack.includes(query);
  });
};



