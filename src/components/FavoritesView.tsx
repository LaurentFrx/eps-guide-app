"use client";

import { useMemo } from "react";
import { HeartOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExerciseCard } from "@/components/ExerciseCard";
import { GlassCard } from "@/components/GlassCard";
import { allExercises } from "@/lib/exercise-data";
import { useFavorites } from "@/lib/favorites";

export const FavoritesView = () => {
  const { favorites, clearFavorites } = useFavorites();

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const exercises = useMemo(
    () => allExercises.filter((exercise) => favoriteSet.has(exercise.code)),
    [favoriteSet]
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-slate-500">
          Favoris
        </p>
        <h1 className="font-display text-3xl font-semibold text-slate-900">
          Vos exercices préférés
        </h1>
        <p className="text-sm text-slate-600">
          Retrouvez vos fiches sauvegardées pour un accès rapide.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <Badge className="border-0 bg-slate-100 text-slate-700">
          {exercises.length} exercices
        </Badge>
        {exercises.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={clearFavorites}>
            Vider
          </Button>
        ) : null}
      </div>

      {exercises.length === 0 ? (
        <GlassCard className="flex flex-col items-center gap-3 text-center">
          <HeartOff className="h-6 w-6 text-slate-400" />
          <div>
            <p className="font-medium text-slate-800">
              Aucun favori pour le moment
            </p>
            <p className="text-sm text-slate-500">
              Ajoutez des exercices pour les retrouver ici.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.code} exercise={exercise} showSession />
          ))}
        </div>
      )}
    </div>
  );
};
