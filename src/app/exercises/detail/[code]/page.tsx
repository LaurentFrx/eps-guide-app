import { notFound } from "next/navigation";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { getExercise } from "@/lib/exercise-data";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const exercise = getExercise(code);

  if (!exercise) {
    notFound();
  }

  return <ExerciseDetail exercise={exercise} />;
}
