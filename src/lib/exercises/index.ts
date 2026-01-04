import exercisesData from "@/data/exercises.json";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { getExercise as getLegacyExercise } from "@/lib/exercise-data";
import { editorialByCode } from "@/lib/editorial.generated";
import { normalizeExerciseRecord, type ExerciseRecord } from "@/lib/exercises/schema";
import {
  UI_TEXT_FIELDS,
  extractReferenceCodes,
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
  const availableCodes = new Set(byCode.keys());
  const referenceMap = new Map(byCode);
  Object.entries(editorialByCode).forEach(([code, editorial]) => {
    const normalized = normalizeExerciseCode(code);
    if (referenceMap.has(normalized)) return;
    referenceMap.set(
      normalized,
      normalizeExerciseRecord({
        code: normalized,
        materielMd: editorial.materielMd,
        consignesMd: editorial.consignesMd,
        dosageMd: editorial.dosageMd,
        securiteMd: editorial.securiteMd,
        detailMd: editorial.detailMd,
        fullMdRaw: editorial.fullMdRaw,
      })
    );
  });
  const referenceContext = new Map<string, string[]>();
  const cache = new Map<string, ExerciseRecord>();
  const stack = new Set<string>();

  const collectReferenceCodes = (record: ExerciseRecord): string[] => {
    const current = normalizeExerciseCode(record.code);
    const seen = new Set<string>();
    const codes: string[] = [];

    const addCodes = (text: string) => {
      extractReferenceCodes(text).forEach((code) => {
        if (code === current || seen.has(code)) return;
        seen.add(code);
        codes.push(code);
      });
    };

    for (const field of UI_TEXT_FIELDS) {
      const value = record[field.key];
      if (field.kind === "string") {
        if (typeof value === "string" && value.trim()) addCodes(value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item && item.trim()) addCodes(item);
        });
      }
    }

    return codes;
  };

  const inferReferenceCodes = (
    currentCode: string,
    contextCodes: string[]
  ): string[] => {
    if (contextCodes.length === 1) return contextCodes;
    if (contextCodes.length > 1) {
      throw new Error(
        `Ambiguous cross-reference marker in ${currentCode} (multiple candidates: ${contextCodes.join(
          ", "
        )})`
      );
    }
    return [];
  };

  const stripMarkerOnly = (text: string) => {
    let output = text;
    output = output.replace(
      /m(?:e|\u00EA)me\s+exercice\s+(?:de|du|des|d')\s+/gi,
      ""
    );
    output = output.replace(/m(?:e|\u00EA)me\s+exercice/gi, "");
    output = output.replace(
      /(^|[\s"'(),.;:!?[\]{}])(?:idem|id\.)\b\s*[.,;:!?]?/gi,
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

  records.forEach((record) => {
    const code = normalizeExerciseCode(record.code);
    referenceContext.set(code, collectReferenceCodes(record));
  });

  const expandRecord = (record: ExerciseRecord): ExerciseRecord => {
    const code = normalizeExerciseCode(record.code);
    const cached = cache.get(code);
    if (cached) return cached;
    if (stack.has(code)) {
      throw new Error(`Cross-reference cycle detected for ${code}`);
    }
    stack.add(code);

    const next: ExerciseRecord = { ...record };

    const target = next as Record<string, string | string[] | undefined>;
    for (const field of UI_TEXT_FIELDS) {
      const value = next[field.key];
      if (field.kind === "string") {
        if (typeof value === "string" && value.trim()) {
          const contextCodes = referenceContext.get(code) ?? [];
          target[field.key] = expandStringField(
            code,
            field.key,
            value,
            referenceMap,
            contextCodes
          );
        }
      } else if (Array.isArray(value) && value.length) {
        const joined = value.join("\n");
        const contextCodes = referenceContext.get(code) ?? [];
        const expanded = expandStringField(
          code,
          field.key,
          joined,
          referenceMap,
          contextCodes
        );
        target[field.key] =
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
      recordMap: Map<string, ExerciseRecord>,
      contextCodes: string[]
    ): string => {
    const { codes, hasMarker } = findCrossReferenceCandidates(text, currentCode);
    let refCodes = codes;
    if (!refCodes.length) {
      if (!hasMarker) return text;
      refCodes = inferReferenceCodes(currentCode, contextCodes);
      if (!refCodes.length) {
        throw new Error(
          `Unresolved cross-reference marker in ${currentCode}.${String(
            fieldKey
          )}`
        );
      }
    }

    const refTexts = refCodes.flatMap((refCode) => {
      if (!availableCodes.has(refCode)) return [];
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
          `Empty referenced field ${refCode}.${String(
            fieldKey
          )} used by ${currentCode}`
        );
      }
      return stripCrossReferences(String(refText), [refCode]);
    });

    const remainder = stripCrossReferences(text, refCodes);
    return [refTexts.join("\n"), remainder].filter((part) => part).join("\n");
  };

  return records.map((record) => expandRecord(record));
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
