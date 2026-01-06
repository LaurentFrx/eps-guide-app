import ExerciseForm from "../ExerciseForm";
import { normalizeExerciseRecord } from "@/lib/exercises/schema";
import { isAdminConfigured } from "@/lib/admin/env";
import { GlassCard } from "@/components/GlassCard";

export default function NewExercisePage() {
  if (!isAdminConfigured()) {
    return (
      <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Admin
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">
            Admin non configuré
          </h1>
          <p className="text-sm text-white/70">
            Configurez les variables d’environnement KV + admin pour activer le mode.
          </p>
        </GlassCard>
      </div>
    );
  }

  const empty = normalizeExerciseRecord({});
  return <ExerciseForm initial={empty} mode="new" />;
}

