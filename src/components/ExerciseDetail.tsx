"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/GlassCard";
import { MarkdownText } from "@/components/MarkdownText";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import type { ExerciseRecord } from "@/lib/exercises/schema";

const levelStyles: Record<string, string> = {
  Debutant: "bg-emerald-100 text-emerald-800",
  Intermediaire: "bg-sky-100 text-sky-800",
  Avance: "bg-rose-100 text-rose-800",
};

type ExerciseDetailProps = {
  exercise: ExerciseRecord;
  heroSrc?: string | null;
  heroIsSvg?: boolean;
};

export const ExerciseDetail = ({
  exercise,
  heroSrc,
  heroIsSvg,
}: ExerciseDetailProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imageSrc, setImageSrc] = useState(heroSrc ?? exercise.image ?? "");
  const [copiedKeyPoints, setCopiedKeyPoints] = useState(false);
  const [copiedDosage, setCopiedDosage] = useState(false);
  const favorite = isFavorite(exercise.code);
  const isSvg = heroIsSvg ?? imageSrc.toLowerCase().endsWith(".svg");
  const levelClass = levelStyles[exercise.level] ?? "bg-slate-100 text-slate-700";

  const sessionId = exercise.code.split("-")[0] ?? "";
  const sessionLabel = sessionId ? `Session ${sessionId.replace("S", "")}` : "";
  const muscleChips = useMemo(() => {
    return exercise.muscles
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [exercise.muscles]);
  const keyPoints = exercise.key_points.length
    ? exercise.key_points
    : exercise.cues ?? [];
  const safetyItems = exercise.safety ?? [];
  const sourcesText = exercise.sources.length
    ? exercise.sources.join("\n")
    : "";

  const consignesMd =
    exercise.consignesMd ?? (keyPoints.length ? keyPoints.join("\n") : "");
  const dosageMd = exercise.dosageMd ?? exercise.dosage ?? "";
  const securiteMd =
    exercise.securiteMd ?? (safetyItems.length ? safetyItems.join("\n") : "");
  const materielMd = exercise.materielMd ?? exercise.equipment ?? "";
  const detailMd = exercise.detailMd ?? "";

  const consignesText = consignesMd || "Aucune consigne.";
  const dosageText = dosageMd || "Aucun";
  const securiteText = securiteMd || "Aucun";
  const materielText = materielMd || "Aucun";

  const canCopyKeyPoints = Boolean(consignesText);
  const canCopyDosage = Boolean(dosageText);

  const handleCopy = async (
    value: string,
    setter: (next: boolean) => void
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      window.setTimeout(() => setter(false), 1800);
    } catch {
      setter(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute left-5 top-4 z-10">
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link href={sessionId ? `/exercises/${sessionId}` : "/exercises"}>
              <ChevronLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <div className="relative h-64 w-full">
          {imageSrc ? (
            isSvg ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageSrc}
                alt={exercise.title}
                className="h-full w-full object-cover"
                onError={() => setImageSrc("/images/placeholder.jpg")}
              />
            ) : (
              <Image
                src={imageSrc}
                alt={exercise.title}
                fill
                sizes="100vw"
                className="object-cover"
                onError={() => setImageSrc("/images/placeholder.jpg")}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-500">
              Image indisponible
            </div>
          )}
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
            {sessionLabel ? (
              <Badge className="border-0 bg-white/20 text-white">
                {sessionLabel}
              </Badge>
            ) : null}
            <Badge className={cn("border-0", levelClass)}>
              {exercise.level}
            </Badge>
            {exercise.equipment ? (
              <Badge className="border-0 bg-white/20 text-white">
                {exercise.equipment}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {muscleChips.length ? (
        <div className="flex flex-wrap gap-2">
          {muscleChips.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {muscle}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="secondary">
          <Link href="/guide">Voir le guide</Link>
        </Button>
      </div>

      <Tabs defaultValue="terrain" className="space-y-4">
        <TabsList>
          <TabsTrigger value="terrain">Terrain</TabsTrigger>
          <TabsTrigger value="detail">Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="terrain">
          <div className="grid gap-4">
            <GlassCard>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Materiel
              </p>
              <MarkdownText
                text={materielText}
                className="mt-2 text-base text-slate-900"
              />
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Consignes cles
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canCopyKeyPoints}
                  onClick={() => handleCopy(consignesText, setCopiedKeyPoints)}
                >
                  {copiedKeyPoints ? "Copie" : "Copier consignes"}
                </Button>
              </div>
              <MarkdownText text={consignesText} />
            </GlassCard>

            <GlassCard className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Dosage
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canCopyDosage}
                  onClick={() => handleCopy(dosageText, setCopiedDosage)}
                >
                  {copiedDosage ? "Copie" : "Copier dosage"}
                </Button>
              </div>
              <MarkdownText text={dosageText} className="text-base text-slate-900" />
            </GlassCard>

            <GlassCard>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Securite
              </p>
              <MarkdownText text={securiteText} className="mt-3" />
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="detail">
          <div className="grid gap-4">
            <GlassCard>
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Detail
              </p>
              {detailMd ? (
                <MarkdownText text={detailMd} className="mt-3" />
              ) : (
                <p className="mt-3 text-sm text-slate-500">Contenu indisponible.</p>
              )}
            </GlassCard>
            {sourcesText ? (
              <GlassCard>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Sources de l'exercice
                </p>
                <MarkdownText text={sourcesText} className="mt-3" />
              </GlassCard>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};



