import { notFound } from "next/navigation";
import ExerciseForm from "../ExerciseForm";
import { normalizeExerciseCode, isValidExerciseCode } from "@/lib/exerciseCode";
import { getMergedExerciseRecord } from "@/lib/exercises/merged";
import { getCustomExercise } from "@/lib/admin/store";
import { isAdminConfigured } from "@/lib/admin/env";
import { GlassCard } from "@/components/GlassCard";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function EditExercisePage({ params }: PageProps) {
  if (!isAdminConfigured()) {
    return (
      <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Admin
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">
            Admin non configur&apos;
          </h1>
          <p className="text-sm text-white/70">
            Configurez les variables d&apos;environnement KV + admin pour activer le mode.
          </p>
        </GlassCard>
      </div>
    );
  }

  const { code } = await params;
  const normalized = normalizeExerciseCode(code);
  if (!isValidExerciseCode(normalized)) {
    notFound();
  }

  const custom = await getCustomExercise(normalized);
  const exercise = custom ?? (await getMergedExerciseRecord(normalized));
  if (!exercise) {
    notFound();
  }

  return (
    <ExerciseForm
      initial={exercise}
      mode="edit"
      source={custom ? "custom" : "base"}
    />
  );
}

