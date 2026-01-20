"use client";

import Link from "next/link";
import { useMemo } from "react";
import { HeartOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExerciseCard } from "@/components/ExerciseCard";
import { GlassCard } from "@/components/GlassCard";
import { allExercises } from "@/lib/exercise-data";
import { useFavorites } from "@/lib/favorites";
import { useGuideBookmarks } from "@/lib/guideBookmarks";

export const FavoritesView = () => {
  const { favorites, clearFavorites } = useFavorites();
  const { bookmarks, removeBookmark, clearBookmarks } = useGuideBookmarks();

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const exercises = useMemo(
    () => allExercises.filter((exercise) => favoriteSet.has(exercise.code)),
    [favoriteSet]
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">Favoris</p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Vos raccourcis
        </h1>
        <p className="text-sm text-white/70">
          Exercices sauvegardés et marque-pages guide.
        </p>
      </div>

      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList className="ui-surface w-full justify-start gap-2 rounded-full px-2 py-1">
          <TabsTrigger
            value="exercises"
            className="ui-chip text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white sm:text-sm"
          >
            Exercices
          </TabsTrigger>
          <TabsTrigger
            value="guide"
            className="ui-chip text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white sm:text-sm"
          >
            Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <div className="flex items-center justify-between text-sm text-white/70">
            <Badge className="ui-chip border-0">
              {exercises.length} exercices
            </Badge>
            {exercises.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFavorites}
                className="ui-chip"
              >
                Vider
              </Button>
            ) : null}
          </div>

          {exercises.length === 0 ? (
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
              {exercises.map((exercise) => (
                <ExerciseCard key={exercise.code} exercise={exercise} showSession />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <div className="flex items-center justify-between text-sm text-white/70">
            <Badge className="ui-chip border-0">
              {bookmarks.length} marque-pages
            </Badge>
            {bookmarks.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearBookmarks}
                className="ui-chip"
              >
                Vider
              </Button>
            ) : null}
          </div>

          {bookmarks.length === 0 ? (
            <GlassCard className="flex flex-col items-center gap-3 text-center">
              <HeartOff className="h-6 w-6 text-white/60" />
              <div>
                <p className="font-medium text-white/80">
                  Aucun marque-page pour le moment
                </p>
                <p className="text-sm text-white/60">
                  Enregistrez une page guide pour la retrouver ici.
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid gap-3">
              {bookmarks.map((bookmark) => (
                <Link
                  key={`${bookmark.route}:${bookmark.page}`}
                  href={bookmark.route}
                  className="ui-card ui-pressable flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-white/55">
                      Guide
                    </p>
                    <p className="text-base font-semibold text-white">
                      {bookmark.title}
                    </p>
                    <p className="text-sm text-white/70">
                      Page {bookmark.page}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="ui-chip px-3 py-1 text-xs">
                      Page {bookmark.page}
                    </span>
                    <button
                      type="button"
                      className="ui-chip inline-flex items-center gap-2 px-3 py-2 text-xs font-medium"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeBookmark(bookmark.route);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Retirer
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
