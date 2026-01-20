import { notFound } from "next/navigation";
import { ExerciseDetail } from "@/components/ExerciseDetail";
import { getExerciseByCode } from "@/lib/exercises/index";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import { getHeroSrc } from "@/lib/exerciseAssets";

export default async function ExercisePage(props: unknown) {
  const { params, searchParams } = props as {
    params: { code: string } | Promise<{ code: string }>;
    searchParams?: { from?: string } | Promise<{ from?: string }>;
  };
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const rawFrom = resolvedSearchParams?.from;
  const safeFrom =
    typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "";

  const { code } = resolvedParams;
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
