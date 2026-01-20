"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { normalizeExerciseCode } from "@/lib/exerciseCode";
import { normalizeLevelLabel, splitEquipment } from "@/lib/exercise-data";
import type { ExerciseWithSession } from "@/lib/exercise-data";

const levelStyles: Record<string, string> = {
  Débutant: "bg-emerald-400/20 text-emerald-100",
  Intermédiaire: "bg-sky-400/20 text-sky-100",
  Avancé: "bg-rose-400/20 text-rose-100",
};

type ExerciseCardProps = {
  exercise: ExerciseWithSession;
  showSession?: boolean;
  from?: string;
};

export const ExerciseCard = ({
  exercise,
  showSession = false,
  from,
}: ExerciseCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageSrc, setImageSrc] = useState(exercise.image);
  const favorite = isFavorite(exercise.code);
  const isSvg = imageSrc.toLowerCase().endsWith(".svg");

  const levelLabel = useMemo(
    () => normalizeLevelLabel(exercise.level),
    [exercise.level]
  );
  const levelClass = levelStyles[levelLabel] ?? "ui-chip";
  const equipmentLabel = useMemo(() => {
    const [first] = splitEquipment(exercise.equipment);
    return first ?? exercise.equipment;
  }, [exercise.equipment]);

  return (
    <div className="ui-card ui-pressable group relative overflow-hidden">
      <Link
        href={
          from
            ? `/exercises/detail/${normalizeExerciseCode(exercise.code)}?from=${encodeURIComponent(
                from
              )}`
            : `/exercises/detail/${normalizeExerciseCode(exercise.code)}`
        }
        className="block"
      >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/60">
                {exercise.code}
              </p>
              <h3 className="font-display text-lg font-semibold text-white">
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
              className="ui-chip rounded-full p-2 shadow-sm transition hover:scale-105"
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  favorite
                    ? "fill-amber-300 text-amber-200"
                    : "text-white/70"
                )}
              />
            </button>
          </div>
          {showSession ? (
            <p className="text-sm text-white/70">
              Session {exercise.sessionNum} - {exercise.sessionTitle}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("ui-chip border-0", levelClass)}>
              {levelLabel}
            </Badge>
            <Badge className="ui-chip border-0">
              {equipmentLabel}
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
};

