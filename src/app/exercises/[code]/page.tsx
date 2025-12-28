import { notFound } from "next/navigation";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { getExercise } from "@/lib/exercise-data";

export default function ExercisePage({
  params,
}: {
  params: { code: string };
}) {
  const exercise = getExercise(params.code);

  if (!exercise) {
    notFound();
  }

  return <ExerciseDetail exercise={exercise} />;
}
