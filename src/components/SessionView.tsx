"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ExerciseCard } from "@/components/ExerciseCard";
import { GlassCard } from "@/components/GlassCard";
import { normalizeLevelLabel, splitEquipment, type Session } from "@/lib/exercise-data";

export const SessionView = ({ session }: { session: Session }) => {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("Tous");
  const [equipmentFilter, setEquipmentFilter] = useState("Tous");

  const levels = useMemo(
    () =>
      Array.from(
        new Set(session.exercises.map((ex) => normalizeLevelLabel(ex.level)))
      ).sort(),
    [session.exercises]
  );
  const equipmentOptions = useMemo(
    () =>
      Array.from(
        new Set(session.exercises.flatMap((ex) => splitEquipment(ex.equipment)))
      ).sort(),
    [session.exercises]
  );

  const filtered = useMemo(() => {
    return session.exercises.filter((exercise) => {
      if (
        levelFilter !== "Tous" &&
        normalizeLevelLabel(exercise.level) !== levelFilter
      ) {
        return false;
      }
      if (equipmentFilter !== "Tous") {
        const tokens = splitEquipment(exercise.equipment);
        if (!tokens.includes(equipmentFilter)) {
          return false;
        }
      }
      if (!query) {
        return true;
      }
      const equipmentText = splitEquipment(exercise.equipment).join(" ");
      const haystack = `${exercise.title} ${exercise.code} ${exercise.muscles} ${equipmentText}`
        .toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [equipmentFilter, levelFilter, query, session.exercises]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="ui-link px-0">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Session {session.num}
          </p>
          <h1 className="font-display text-3xl font-semibold text-white">
            {session.title}
          </h1>
          <p className="text-sm text-white/70">{session.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Badge className="ui-chip border-0">
            {session.exercises.length} exercices
          </Badge>
        </div>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white/75">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres rapides
        </div>
        <Input
          placeholder="Rechercher un exercice..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="space-y-3">
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
          <span>{filtered.length} exercices</span>
          {(levelFilter !== "Tous" || equipmentFilter !== "Tous" || query) && (
            <button
              type="button"
              className="ui-link font-medium"
              onClick={() => {
                setLevelFilter("Tous");
                setEquipmentFilter("Tous");
                setQuery("");
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>
        <div className="grid gap-4">
          {filtered.map((exercise) => (
            <ExerciseCard
              key={exercise.code}
              exercise={{
                ...exercise,
                sessionNum: session.num,
                sessionTitle: session.title,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
