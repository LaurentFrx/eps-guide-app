import { notFound } from "next/navigation";
import ClientRedirect from "@/components/ClientRedirect";
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
  return <ClientRedirect to={`/v2/exercises/detail/${normalized}`} />;
}
