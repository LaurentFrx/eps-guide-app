"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import type { ExerciseWithSession } from "@/lib/exercise-data";

const levelStyles: Record<string, string> = {
  Debutant: "bg-emerald-100 text-emerald-800",
  Intermediaire: "bg-sky-100 text-sky-800",
  Avance: "bg-rose-100 text-rose-800",
};

type ExerciseCardProps = {
  exercise: ExerciseWithSession;
  showSession?: boolean;
};

export const ExerciseCard = ({
  exercise,
  showSession = false,
}: ExerciseCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageSrc, setImageSrc] = useState(exercise.image);
  const favorite = isFavorite(exercise.code);
  const isSvg = imageSrc.toLowerCase().endsWith(".svg");

  const levelClass = useMemo(
    () => levelStyles[exercise.level] ?? "bg-slate-100 text-slate-700",
    [exercise.level]
  );

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm backdrop-blur">
      <Link href={`/exercises/detail/${exercise.code}`} className="block">
        <div className="relative h-36 overflow-hidden">
          <Image
            src={imageSrc}
            alt={exercise.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            unoptimized={isSvg}
            onError={() => setImageSrc("/images/placeholder.jpg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                {exercise.code}
              </p>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {exercise.title}
              </h3>
            </div>
            <button
              type="button"
              aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={favorite}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(exercise.code);
              }}
              className="rounded-full border border-white/70 bg-white/80 p-2 shadow-sm transition hover:scale-105"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  favorite
                    ? "fill-amber-400 text-amber-500"
                    : "text-slate-400"
                )}
              />
            </button>
          </div>
          {showSession ? (
            <p className="text-sm text-slate-600">
              Session {exercise.sessionNum} - {exercise.sessionTitle}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border-0", levelClass)}>
              {exercise.level}
            </Badge>
            <Badge className="border-0 bg-slate-100 text-slate-700">
              {exercise.equipment}
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
};
