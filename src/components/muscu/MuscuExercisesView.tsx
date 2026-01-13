"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  MUSCU_ZONES,
  PROJETS,
  type MuscuExercise,
  type MuscuZone,
  type Projet,
} from "@/lib/muscu/types";
import type { ExerciseTags, ItemType } from "@/lib/exercises/exerciseTags";

type EpsExercise = {
  id: string;
  title: string;
  sessionId: string;
  level?: string;
  image?: string;
};

type MuscuExercisesViewProps = {
  muscuExercises: MuscuExercise[];
  epsExercises: EpsExercise[];
  exerciseTagsByCode: Record<string, ExerciseTags>;
};

const TYPE_OPTIONS: Array<ItemType | "Tous"> = [
  "Tous",
  "Exercice",
  "Étirement",
  "Technique",
  "Séance",
];

export function MuscuExercisesView({
  muscuExercises,
  epsExercises,
  exerciseTagsByCode,
}: MuscuExercisesViewProps) {
  const [mode, setMode] = useState<"fred" | "eps">("fred");
  const [zone, setZone] = useState<MuscuZone | "Tous">("Tous");
  const [type, setType] = useState<ItemType | "Tous">("Tous");
  const [projet, setProjet] = useState<Projet | "Tous">("Tous");
  const [showUntagged, setShowUntagged] = useState(false);

  const filteredEps = useMemo(() => {
    return epsExercises.filter((exercise) => {
      const tags = exerciseTagsByCode[exercise.id];
      if (showUntagged) return !tags;
      if (zone !== "Tous" && tags?.zone !== zone) return false;
      if (type !== "Tous" && tags?.type !== type) return false;
      if (projet !== "Tous" && !tags?.projets?.includes(projet)) return false;
      return true;
    });
  }, [epsExercises, exerciseTagsByCode, zone, type, projet, showUntagged]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("fred")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            mode === "fred"
              ? "bg-white/10 text-white"
              : "bg-transparent text-white/60 hover:text-white"
          )}
        >
          Musculation (Fred)
        </button>
        <button
          type="button"
          onClick={() => setMode("eps")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
            mode === "eps"
              ? "bg-white/10 text-white"
              : "bg-transparent text-white/60 hover:text-white"
          )}
        >
          EPS (bibliotheque)
        </button>
        {mode === "eps" ? (
          <button
            type="button"
            onClick={() => setShowUntagged((current) => !current)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
              showUntagged
                ? "bg-white/10 text-white"
                : "bg-transparent text-white/60 hover:text-white"
            )}
          >
            Non classes
          </button>
        ) : null}
      </div>

      {mode === "fred" ? (
        <div className="grid gap-4">
          {muscuExercises.map((exercise) => (
            <GlassCard key={exercise.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/60">
                    {exercise.zone}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    {exercise.title}
                  </h3>
                </div>
                <Badge variant="outline" className="ui-chip">
                  {exercise.status === "approved" ? "Valide" : "Draft"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {exercise.projets.map((item) => (
                  <Badge key={item} variant="outline" className="ui-chip">
                    {item}
                  </Badge>
                ))}
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
                {exercise.cues.slice(0, 3).map((cue) => (
                  <li key={cue}>{cue}</li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
              Zone
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                value={zone}
                onChange={(event) =>
                  setZone(event.target.value as MuscuZone | "Tous")
                }
              >
                {["Tous", ...MUSCU_ZONES].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
              Type
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as ItemType | "Tous")
                }
              >
                {TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-white/60">
              Projet
              <select
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80"
                value={projet}
                onChange={(event) =>
                  setProjet(event.target.value as Projet | "Tous")
                }
              >
                {["Tous", ...PROJETS].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredEps.length ? (
            <div className="grid gap-4">
              {filteredEps.map((exercise) => {
                const tags = exerciseTagsByCode[exercise.id];
                return (
                  <Link
                    key={exercise.id}
                    href={`/exercises/detail/${exercise.id}`}
                    className="block"
                  >
                    <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white/60">
                            {exercise.id}
                          </p>
                          <h3 className="text-lg font-semibold text-white">
                            {exercise.title}
                          </h3>
                        </div>
                        {exercise.level ? (
                          <Badge variant="outline" className="ui-chip">
                            {exercise.level}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags?.zone ? (
                          <Badge variant="outline" className="ui-chip">
                            {tags.zone}
                          </Badge>
                        ) : null}
                        {tags?.type ? (
                          <Badge variant="outline" className="ui-chip">
                            {tags.type}
                          </Badge>
                        ) : null}
                        {(tags?.projets ?? []).map((item) => (
                          <Badge key={item} variant="outline" className="ui-chip">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          ) : (
            <GlassCard>
              <p className="text-sm text-white/70">
                Aucun exercice ne correspond aux filtres selectionnes.
              </p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
