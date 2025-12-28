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
import type { Session } from "@/lib/exercise-data";

export const SessionView = ({ session }: { session: Session }) => {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("Tous");
  const [equipmentFilter, setEquipmentFilter] = useState("Tous");

  const levels = useMemo(
    () => Array.from(new Set(session.exercises.map((ex) => ex.level))).sort(),
    [session.exercises]
  );
  const equipmentOptions = useMemo(
    () =>
      Array.from(new Set(session.exercises.map((ex) => ex.equipment))).sort(),
    [session.exercises]
  );

  const filtered = useMemo(() => {
    return session.exercises.filter((exercise) => {
      if (levelFilter !== "Tous" && exercise.level !== levelFilter) {
        return false;
      }
      if (equipmentFilter !== "Tous" && exercise.equipment !== equipmentFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${exercise.title} ${exercise.code} ${exercise.muscles} ${exercise.equipment}`
        .toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [equipmentFilter, levelFilter, query, session.exercises]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="space-y-4">
        <Button asChild variant="ghost" className="px-0 text-slate-600">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Session {session.num}
          </p>
          <h1 className="font-display text-3xl font-semibold text-slate-900">
            {session.title}
          </h1>
          <p className="text-sm text-slate-600">{session.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Badge className="border-0 bg-slate-100 text-slate-700">
            {session.exercises.length} exercices
          </Badge>
        </div>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
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
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Niveau
            </p>
            <div className="flex flex-wrap gap-2">
              {["Tous", ...levels].map((level) => (
                <Button
                  key={level}
                  type="button"
                  size="sm"
                  variant={levelFilter === level ? "default" : "secondary"}
                  onClick={() => setLevelFilter(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Materiel
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
                  onClick={() => setEquipmentFilter(equipment)}
                >
                  {equipment}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>{filtered.length} exercices</span>
          {(levelFilter !== "Tous" || equipmentFilter !== "Tous" || query) && (
            <button
              type="button"
              className="font-medium text-slate-700"
              onClick={() => {
                setLevelFilter("Tous");
                setEquipmentFilter("Tous");
                setQuery("");
              }}
            >
              Reinitialiser
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
