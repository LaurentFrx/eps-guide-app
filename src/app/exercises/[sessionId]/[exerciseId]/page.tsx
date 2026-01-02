import { notFound, permanentRedirect } from "next/navigation";
import { isValidExerciseCode, normalizeExerciseCode } from "@/lib/exerciseCode";
import { pdfHasCode } from "@/data/pdfIndex";

export default async function ExerciseRedirect({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const normalized = normalizeExerciseCode(exerciseId);
  if (!isValidExerciseCode(normalized) || !pdfHasCode(normalized)) {
    notFound();
  }
  permanentRedirect(`/exercises/detail/${normalized}`);
}
