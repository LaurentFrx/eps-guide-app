import { notFound, permanentRedirect } from "next/navigation";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";

export default async function ExerciseRedirect({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const normalized = normalizeExerciseCode(exerciseId);
  if (!isValidExerciseCode(normalized)) {
    notFound();
  }
  permanentRedirect(`/exercises/detail/${normalized}`);
}
