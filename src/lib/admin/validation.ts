import { z } from "zod";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";
import {
  normalizeExerciseRecord,
  type ExerciseRecord,
} from "@/lib/exercises/schema";

const stringArray = z.array(z.string().trim()).optional();

const baseSchema = z.object({
  code: z
    .string()
    .min(1)
    .transform((value) => normalizeExerciseCode(value))
    .refine((value) => isValidExerciseCode(value), {
      message: "Code invalide",
    }),
  title: z.string().min(1, "Le titre est requis"),
  level: z.string().optional().default(""),
  equipment: z.string().optional().default(""),
  muscles: z.string().optional().default(""),
  objective: z.string().optional().default(""),
  anatomy: z.string().optional().default(""),
  biomechanics: z.string().optional().default(""),
  benefits: z.string().optional().default(""),
  contraindications: z.string().optional().default(""),
  regress: z.string().optional().default(""),
  progress: z.string().optional().default(""),
  dosage: z.string().optional().default(""),
  image: z.string().optional().default(""),
  safety: stringArray.default([]),
  key_points: stringArray.default([]),
  cues: stringArray.default([]),
  sources: stringArray.default([]),
  materielMd: z.string().optional().default(""),
  consignesMd: z.string().optional().default(""),
  dosageMd: z.string().optional().default(""),
  securiteMd: z.string().optional().default(""),
  detailMd: z.string().optional().default(""),
  fullMdRaw: z.string().optional().default(""),
});

const overrideSchema = z.object({
  title: z.string().optional(),
  level: z.string().optional(),
  equipment: z.string().optional(),
  muscles: z.string().optional(),
  objective: z.string().optional(),
  anatomy: z.string().optional(),
  biomechanics: z.string().optional(),
  benefits: z.string().optional(),
  contraindications: z.string().optional(),
  regress: z.string().optional(),
  progress: z.string().optional(),
  dosage: z.string().optional(),
  image: z.string().optional(),
  safety: stringArray,
  key_points: stringArray,
  cues: stringArray,
  sources: stringArray,
  materielMd: z.string().optional(),
  consignesMd: z.string().optional(),
  dosageMd: z.string().optional(),
  securiteMd: z.string().optional(),
  detailMd: z.string().optional(),
  fullMdRaw: z.string().optional(),
});

export const parseExercisePayload = (payload: unknown): ExerciseRecord => {
  const parsed = baseSchema.parse(payload);
  return normalizeExerciseRecord(parsed);
};

export const parseExerciseOverride = (
  payload: unknown
): Partial<ExerciseRecord> => {
  return overrideSchema.parse(payload);
};
