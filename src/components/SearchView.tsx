"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ExerciseCard } from "@/components/ExerciseCard";
import { GlassCard } from "@/components/GlassCard";
import {
  equipmentOptions,
  filterExercises,
  levels,
  sessionOptions,
} from "@/lib/exercise-data";

export const SearchView = ({ initialQuery }: { initialQuery?: string }) => {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [levelFilter, setLevelFilter] = useState("Tous");
  const [equipmentFilter, setEquipmentFilter] = useState("Tous");
  const [sessionFilter, setSessionFilter] = useState<number | null>(null);

  const results = useMemo(
    () =>
      filterExercises({
        query,
        level: levelFilter,
        equipment: equipmentFilter,
        sessionNum: sessionFilter ?? undefined,
      }),
    [equipmentFilter, levelFilter, query, sessionFilter]
  );

  const hasFilters =
    levelFilter !== "Tous" ||
    equipmentFilter !== "Tous" ||
    sessionFilter !== null ||
    query.length > 0;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Recherche
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Trouver un exercice
        </h1>
        <p className="text-sm text-white/70">
          Filtre par titre, code, muscles ou matériel.
        </p>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white/75">
          <SlidersHorizontal className="h-4 w-4" />
          Recherche globale
        </div>
        <Input
          placeholder="Planche, S1-01, tirage..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Session
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={sessionFilter === null ? "default" : "secondary"}
                data-active={sessionFilter === null ? "true" : "false"}
                onClick={() => setSessionFilter(null)}
                className="ui-chip"
              >
                Toutes
              </Button>
              {sessionOptions.map((session) => (
                <Button
                  key={session.num}
                  type="button"
                  size="sm"
                  variant={
                    sessionFilter === session.num ? "default" : "secondary"
                  }
                  data-active={sessionFilter === session.num ? "true" : "false"}
                  onClick={() => setSessionFilter(session.num)}
                  className="ui-chip"
                >
                  S{session.num}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Niveau
            </p>
            <div className="flex flex-wrap gap-2">
              {["Tous", ...levels].map((level) => (
                <Button
                  key={level}
                  type="button"
                  size="sm"
                  variant={levelFilter === level ? "default" : "secondary"}
                  data-active={levelFilter === level ? "true" : "false"}
                  onClick={() => setLevelFilter(level)}
                  className="ui-chip"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Matériel
            </p>
            <div className="flex flex-wrap gap-2">
              {["Tous", ...equipmentOptions].map((equipment) => (
                <Button
                  key={equipment}
                  type="button"
                  size="sm"
                  variant={
                    equipmentFilter === equipment ? "default" : "secondary"
                  }
                  data-active={equipmentFilter === equipment ? "true" : "false"}
                  onClick={() => setEquipmentFilter(equipment)}
                  className="ui-chip"
                >
                  {equipment}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <Badge className="ui-chip border-0">
            {results.length} résultats
          </Badge>
          {hasFilters ? (
            <button
              type="button"
              className="ui-link font-medium"
              onClick={() => {
                setQuery("");
                setLevelFilter("Tous");
                setEquipmentFilter("Tous");
                setSessionFilter(null);
              }}
            >
              Réinitialiser
            </button>
          ) : null}
        </div>
        <div className="grid gap-4">
          {results.map((exercise) => (
            <ExerciseCard
              key={exercise.code}
              exercise={exercise}
              showSession
            />
          ))}
        </div>
      </div>
    </div>
  );
};
