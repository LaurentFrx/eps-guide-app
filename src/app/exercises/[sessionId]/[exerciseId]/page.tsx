import { permanentRedirect } from "next/navigation";

export default async function ExerciseRedirect({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const normalized = exerciseId.trim().toUpperCase();
  permanentRedirect(`/exercises/detail/${normalized}`);
}
