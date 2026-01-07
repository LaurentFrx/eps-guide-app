import exercisesData from "@/data/exercises.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExercise as getLegacyExercise } from "@/lib/exercise-data";
import { editorialByCode } from "@/lib/editorial.generated";
import { applyExercisePatch } from "@/lib/editorial/exercisePatches";
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
    complementsMd: editorial.complementsMd,
  };
};

const exercisesWithEditorial = exercisesFromJson.map((exercise) =>
  applyExercisePatch(withEditorial(exercise))
);

const PLACEHOLDER_START: RegExp[] = [
  /^contenu\s+a\s+completer$/i,
  /^contenu\s+à\s+compléter$/i,
  /^\(omission/i,
  /^similaires?\b/i,
  /^identiques?\b/i,
];

const PLACEHOLDER_ANYWHERE: RegExp[] = [
  /omission/i,
  /suite des exercices/i,
  /\(les exercices/i,
  /\(en résumé/i,
  /\(en resume/i,
  /session\s+[1-5]\s+[–-]/i,
  /dosage pour le haut du corps varie/i,
  /\(\s*…/,
  /\(\s*\.\.\./,
];

const PLACEHOLDER_LINE_RE = /^le$/i;

const stripPlaceholderText = (text: string): string => {
  if (!text.trim()) return "";
  if (PLACEHOLDER_ANYWHERE.some((re) => re.test(text))) return "";
  const trimmed = text.trim();
  if (PLACEHOLDER_START.some((re) => re.test(trimmed))) return "";
  const lines = text
    .split(/\r?\n/)
    .filter((line) => !PLACEHOLDER_LINE_RE.test(line.trim()));
  const joined = lines.join("\n");
  const joinedTrimmed = joined.trim();
  if (!joinedTrimmed) return "";
  if (PLACEHOLDER_ANYWHERE.some((re) => re.test(joined))) return "";
  if (PLACEHOLDER_START.some((re) => re.test(joinedTrimmed))) return "";
  return joined;
};

const stripMarkerOnly = (text: string) => {
  let output = text;
  output = output.replace(
    /m(?:e|\u00EA)me\s+exercice\s+(?:de|du|des|d')\s+/gi,
    ""
  );
  output = output.replace(/m(?:e|\u00EA)me\s+exercice/gi, "");
  output = output.replace(
    /(^|[\s"'(),.;:!?[\]{}])(?:idem|id\.|voir|cf\.?|ref\.?|reference|identique|identiques|similaire|similaires)\b\s*[.,;:!?]?/gi,
    "$1"
  );
  return output;
};

const stripCrossReferences = (text: string, refCodes: string[]) => {
  let output = text;
  refCodes.forEach((code) => {
    output = stripCrossReference(output, code);
  });
  output = stripMarkerOnly(output);
  return output
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const cleanText = (text: string, currentCode: string) => {
  const { codes, hasMarker } = findCrossReferenceCandidates(text, currentCode);
  const stripped = codes.length || hasMarker ? stripCrossReferences(text, codes) : text;
  return stripPlaceholderText(stripped);
};

const expandExerciseText = (records: ExerciseRecord[]): ExerciseRecord[] => {
  return records.map((record) => {
    const code = normalizeExerciseCode(record.code);
    const next: ExerciseRecord = { ...record };

    for (const field of UI_TEXT_FIELDS) {
      const value = next[field.key];
      if (field.kind === "string") {
        if (typeof value !== "string") continue;
        const cleaned = cleanText(value, code);
        next[field.key] = cleaned as never;
      } else if (Array.isArray(value)) {
        const cleanedItems = value
          .map((item) => (item ? cleanText(item, code) : ""))
          .filter(Boolean);
        next[field.key] = cleanedItems as never;
      }
    }

    return next;
  });
};

let expandedExercises: ExerciseRecord[] | null = null;

const getExpandedExercises = () => {
  if (!expandedExercises) {
    expandedExercises = expandExerciseText(exercisesWithEditorial);
  }
  return expandedExercises;
};

export function getAllExercises(): ExerciseRecord[] {
  return getExpandedExercises();
}

export function getAllExercisesRaw(): ExerciseRecord[] {
  return exercisesWithEditorial;
}

export function getExerciseByCode(code: string): ExerciseRecord | undefined {
  const normalized = normalizeExerciseCode(code);
  const fromJson = getExpandedExercises().find(
    (exercise) => normalizeExerciseCode(exercise.code) === normalized
  );

  if (fromJson) return fromJson;

  const legacy = getLegacyExercise(normalized);
  if (!legacy) return undefined;

  return applyExercisePatch(
    withEditorial(
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
    )
  );
}

