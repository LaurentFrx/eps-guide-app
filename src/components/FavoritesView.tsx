"use client";

import { useMemo } from "react";
import { HeartOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/ExerciseCard";
import { GlassCard } from "@/components/GlassCard";
import type { ExerciseWithSession } from "@/lib/exercise-data";
import { useFavorites } from "@/lib/favorites";

export const FavoritesView = ({
  exercises,
}: {
  exercises: ExerciseWithSession[];
}) => {
  const { favorites, clearFavorites } = useFavorites();

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const visibleExercises = useMemo(
    () => exercises.filter((exercise) => favoriteSet.has(exercise.code)),
    [exercises, favoriteSet]
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Favoris
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Vos exercices préférés
        </h1>
        <p className="text-sm text-white/70">
          Retrouvez vos fiches sauvegardées pour un accès rapide.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-white/70">
        <Badge className="ui-chip border-0">
          {visibleExercises.length} exercices
        </Badge>
        {visibleExercises.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={clearFavorites} className="ui-chip">
            Vider
          </Button>
        ) : null}
      </div>

      {visibleExercises.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 text-center">
          <HeartOff className="h-6 w-6 text-white/60" />
          <div>
            <p className="font-medium text-white/80">
              Aucun favori pour le moment
            </p>
            <p className="text-sm text-white/60">
              Ajoutez des exercices pour les retrouver ici.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {visibleExercises.map((exercise) => (
            <ExerciseCard key={exercise.code} exercise={exercise} showSession />
          ))}
        </div>
      )}
    </div>
  );
};
