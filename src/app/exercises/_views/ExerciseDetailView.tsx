import { notFound } from "next/navigation";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { getExerciseByCode } from "@/lib/exercises/index";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import { getHeroSrc } from "@/lib/exerciseAssets";

type ExerciseDetailViewProps = {
  code: string;
  from?: string;
};

const resolveFrom = (value?: string) =>
  value && value.startsWith("/") ? value : "";

export function ExerciseDetailView({ code, from }: ExerciseDetailViewProps) {
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) {
    notFound();
  }

  const exercise = getExerciseByCode(normalized);
  if (!exercise) {
    notFound();
  }

  const heroAsset = getHeroSrc(normalized);
  const sessionId = normalized.split("-")[0] ?? "";
  const safeFrom = resolveFrom(from);
  const backHref = safeFrom || (sessionId ? `/exercises/${sessionId}` : "/exercises");

  return (
    <ExerciseDetail
      exercise={exercise}
      heroSrc={heroAsset.src}
      heroIsSvg={heroAsset.isSvg}
      backHref={backHref}
    />
  );
}
