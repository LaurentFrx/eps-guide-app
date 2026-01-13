import { Suspense } from "react";
import { GlassCard } from "@/components/GlassCard";
import { MuscuExercisesView } from "@/components/muscu/MuscuExercisesView";
import { exercises } from "@/lib/exercises";
import { exerciseTagsByCode } from "@/lib/exercises/exerciseTags";
import { muscuExercises } from "@/lib/muscu";

export default function MuscuExercicesPage() {
  const epsExercises = exercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    sessionId: exercise.sessionId,
    level: exercise.level,
    image: exercise.image,
  }));

  return (
    <Suspense
      fallback={
        <GlassCard>
          <p className="text-sm text-white/70">Chargement des exercices...</p>
        </GlassCard>
      }
    >
      <MuscuExercisesView
        muscuExercises={muscuExercises}
        epsExercises={epsExercises}
        exerciseTagsByCode={exerciseTagsByCode}
      />
    </Suspense>
  );
}
