import Link from "next/link";
import { Suspense } from "react";
import { GlassCard } from "@/components/GlassCard";
import { MuscuExercisesView } from "@/components/muscu/MuscuExercisesView";
import { exercises } from "@/lib/exercises";
import { exerciseTagsByCode } from "@/lib/exercises/exerciseTags";
import { muscuExercises } from "@/lib/muscu";

export default function ExercicesPage() {
  const epsExercises = exercises.map((exercise) => ({
    id: exercise.id,
    title: exercise.title,
    sessionId: exercise.sessionId,
    level: exercise.level,
    image: exercise.image,
  }));

  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Bibliothèque
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Exercices
        </h1>
        <p className="text-sm text-white/70">
          Accès aux exercices musculation et filtres EPS.
        </p>
      </header>

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
    </div>
  );
}
