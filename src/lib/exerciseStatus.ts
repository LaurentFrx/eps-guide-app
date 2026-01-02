import fs from "fs";
import path from "path";
import { getExercise, type ExerciseWithSession } from "@/lib/exercise-data";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

export type ExerciseStatus = "ready" | "draft";

const PUBLIC_DIR = path.join(process.cwd(), "public");

type ExerciseCandidate = {
  id: string;
  image?: string | null;
};

function hasPublicAsset(imagePath: string) {
  const normalized = imagePath.replace(/^\/+/, "");
  const abs = path.join(PUBLIC_DIR, normalized);
  return fs.existsSync(abs);
}

function isImageReady(imagePath?: string | null) {
  if (!imagePath) return false;
  if (imagePath.toLowerCase().endsWith(".svg")) return false;
  return hasPublicAsset(imagePath);
}

export function isExerciseDetailReady(detail: ExerciseWithSession) {
  const hasTitle = detail.title.trim().length > 0;
  const hasLevel = detail.level.trim().length > 0;
  const hasObjective = detail.objective.trim().length > 0;
  const hasSection =
    detail.key_points.length > 0 ||
    detail.safety.length > 0 ||
    detail.anatomy.trim().length > 0;
  return hasTitle && hasLevel && hasObjective && hasSection;
}

export function getExerciseStatus(candidate: ExerciseCandidate): ExerciseStatus {
  const normalized = normalizeExerciseCode(candidate.id);
  if (!isValidExerciseCode(normalized)) return "draft";
  const detail = getExercise(normalized);
  if (!detail || !isExerciseDetailReady(detail)) return "draft";
  if (!isImageReady(candidate.image)) return "draft";
  return "ready";
}
