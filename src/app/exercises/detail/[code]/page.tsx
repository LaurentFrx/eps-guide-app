import { notFound, permanentRedirect } from "next/navigation";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { getMergedExerciseRecord } from "@/lib/exercises/merged";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import { getHeroSrc } from "@/lib/exerciseAssets";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) {
    notFound();
  }

  if (code !== normalized) {
    permanentRedirect(`/exercises/detail/${normalized}`);
  }

  const exercise = await getMergedExerciseRecord(normalized);
  if (!exercise) {
    notFound();
  }

  const heroAsset = getHeroSrc(normalized);

  return (
    <ExerciseDetail
      exercise={exercise}
      heroSrc={heroAsset.src}
      heroIsSvg={heroAsset.isSvg}
    />
  );
}
