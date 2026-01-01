"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import type { ExerciseWithSession } from "@/lib/exercise-data";

const levelStyles: Record<string, string> = {
  Debutant: "bg-emerald-100 text-emerald-800",
  Intermediaire: "bg-sky-100 text-sky-800",
  Avance: "bg-rose-100 text-rose-800",
};

type ExerciseDetailProps = {
  exercise: ExerciseWithSession;
};

export const ExerciseDetail = ({ exercise }: ExerciseDetailProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageSrc, setImageSrc] = useState(exercise.image);
  const favorite = isFavorite(exercise.code);
  const isSvg = imageSrc.toLowerCase().endsWith(".svg");
  const levelClass = levelStyles[exercise.level] ?? "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute left-5 top-4 z-10">
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link href={`/sessions/${exercise.sessionNum}`}>
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <div className="relative h-64 w-full">
          <Image
            src={imageSrc}
            alt={exercise.title}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized={isSvg}
            onError={() => setImageSrc("/images/placeholder.jpg")}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 left-5 right-5 z-10 space-y-3 text-white">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            {exercise.code}
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl font-semibold">
              {exercise.title}
            </h1>
            <button
              type="button"
              aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={favorite}
              onClick={() => toggleFavorite(exercise.code)}
              className="rounded-full border border-white/30 bg-white/20 p-3 backdrop-blur"
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  favorite ? "fill-amber-400 text-amber-300" : "text-white"
                )}
              />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border-0", levelClass)}>
              {exercise.level}
            </Badge>
            <Badge className="border-0 bg-white/20 text-white">
              {exercise.equipment}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Objectif
          </p>
          <p className="mt-2 text-base text-slate-900">
            {exercise.objective}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Muscles & anatomie
          </p>
          <p className="mt-2 text-base text-slate-900">
            {exercise.anatomy}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Points cles
          </p>
          <ul className="mt-3 space-y-2 text-base text-slate-900">
            {exercise.key_points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-400" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Securite
          </p>
          <ul className="mt-3 space-y-2 text-base text-slate-900">
            {exercise.safety.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Regression
          </p>
          <p className="mt-2 text-base text-slate-900">
            {exercise.regress}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Progression
          </p>
          <p className="mt-2 text-base text-slate-900">
            {exercise.progress}
          </p>
        </GlassCard>

        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-slate-500">Dosage</p>
          <p className="mt-2 text-base text-slate-900">{exercise.dosage}</p>
        </GlassCard>
      </div>
    </div>
  );
};
