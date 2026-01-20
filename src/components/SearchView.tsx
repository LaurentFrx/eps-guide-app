"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExerciseCard } from "@/components/ExerciseCard";
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const resetFilters = () => {
    setQuery("");
    setLevelFilter("Tous");
    setEquipmentFilter("Tous");
    setSessionFilter(null);
  };

  const filterPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">Session</p>
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
              variant={sessionFilter === session.num ? "default" : "secondary"}
              data-active={sessionFilter === session.num ? "true" : "false"}
              onClick={() => setSessionFilter(session.num)}
              className="ui-chip"
            >
              S{session.num}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-px bg-white/10" />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">Niveau</p>
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
      <div className="h-px bg-white/10" />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">Matériel</p>
        <div className="flex flex-wrap gap-2">
          {["Tous", ...equipmentOptions].map((equipment) => (
            <Button
              key={equipment}
              type="button"
              size="sm"
              variant={equipmentFilter === equipment ? "default" : "secondary"}
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
  );

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/55">
          Exercices
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Trouver un exercice
        </h1>
        <p className="text-sm text-white/70">
          Filtrer par titre, code, muscles ou matériel.
        </p>
      </header>

      <div
        className="sticky z-30"
        style={{ top: "calc(env(safe-area-inset-top) + 76px)" }}
      >
        <div className="ui-card space-y-3 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                placeholder="Planche, S1-01, tirage..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="ui-chip min-h-11 min-w-11 md:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden md:block">{filterPanel}</div>
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setFiltersOpen(false)}
            aria-label="Fermer les filtres"
          />
          <div className="absolute bottom-0 left-0 right-0 ui-card rounded-t-[28px] p-5">
            <div className="flex items-center justify-between gap-2 pb-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/55">
                  Filtres
                </p>
                <p className="text-base font-semibold text-white">
                  Affiner la recherche
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="ui-chip min-h-10 min-w-10"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {filterPanel}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <Badge className="ui-chip border-0">{results.length} résultats</Badge>
          {hasFilters ? (
            <button type="button" className="ui-link font-medium" onClick={resetFilters}>
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
              from="/search"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

