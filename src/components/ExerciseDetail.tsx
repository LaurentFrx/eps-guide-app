"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/GlassCard";
import { EditorialCard } from "@/components/EditorialCard";
import { DetailSections } from "@/components/DetailSections";
import { GlossaryText } from "@/components/GlossaryText";
import { BackButton } from "@/components/BackButton";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import {
  isPlaceholderText,
  splitByInlineLabels,
  type LabelSpec,
} from "@/lib/editorial/uiParse";
import type { ExerciseRecord } from "@/lib/exercises/schema";

const levelStyles: Record<string, string> = {
  Débutant: "bg-emerald-400/20 text-emerald-100",
  Debutant: "bg-emerald-400/20 text-emerald-100",
  Intermédiaire: "bg-sky-400/20 text-sky-100",
  Intermediaire: "bg-sky-400/20 text-sky-100",
  Avancé: "bg-rose-400/20 text-rose-100",
  Avance: "bg-rose-400/20 text-rose-100",
};

const DETAIL_LABEL_SPECS: LabelSpec[] = [
  {
    key: "description",
    title: "Description anatomique",
    labels: ["Description anatomique", "Description"],
  },
  {
    key: "objectifs",
    title: "Objectifs fonctionnels",
    labels: ["Objectifs fonctionnels", "Objectifs"],
  },
  {
    key: "justif",
    title: "Justifications biomécaniques",
    labels: ["Justifications biomécaniques", "Justifications"],
  },
  {
    key: "benefices",
    title: "Bénéfices avérés",
    labels: ["Bénéfices avérés", "Benefices"],
  },
  {
    key: "contreind",
    title: "Contre-indications / adaptations",
    labels: [
      "Contre-indications et adaptations",
      "Contre-indications / adaptations",
      "Contre-indications",
      "Contre indications",
      "Adaptations",
    ],
  },
  {
    key: "progReg",
    title: "Progressions / régressions",
    labels: [
      "Progressions / régressions",
      "Progressions/Regressions",
      "Progression",
      "Regression",
      "Regressions",
    ],
  },
  {
    key: "consignes",
    title: "Consignes pédagogiques",
    labels: ["Consignes pédagogiques", "Consignes"],
  },
  {
    key: "dosage",
    title: "Dosage recommandé",
    labels: ["Dosage recommandé", "Dosage"],
  },
];

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
  const favorite = isFavorite(exercise.code);
  const isSvg = heroIsSvg ?? imageSrc.toLowerCase().endsWith(".svg");
  const levelClass = levelStyles[exercise.level] ?? "ui-chip";

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

  const resolveText = (...values: Array<string | undefined>) => {
    for (const value of values) {
      if (!value) continue;
      if (isPlaceholderText(value)) continue;
      if (!value.trim()) continue;
      return value;
    }
    return "";
  };

  const isMaterialEmpty = (value?: string) =>
    !value || !value.trim() || value.trim().toLowerCase() === "aucun";

  const consignesText =
    resolveText(
      exercise.consignesMd,
      keyPoints.length ? keyPoints.join("\n") : ""
    ) || "Aucune consigne.";
  const dosageText = resolveText(exercise.dosageMd, exercise.dosage) || "Aucun";
  const securiteText =
    resolveText(
      exercise.securiteMd,
      safetyItems.length ? safetyItems.join("\n") : ""
    ) || "Aucun";
  const materielText = (() => {
    const fromEditorial = resolveText(exercise.materielMd);
    if (fromEditorial && !isMaterialEmpty(fromEditorial)) return fromEditorial;
    if (!isMaterialEmpty(exercise.equipment)) return exercise.equipment;
    return "Aucun";
  })();
  const detailSource = resolveText(exercise.detailMd, exercise.fullMdRaw);
  const complementsText = resolveText(exercise.complementsMd);
  const detailSections = useMemo(
    () => splitByInlineLabels(detailSource, DETAIL_LABEL_SPECS),
    [detailSource]
  );

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-3">
      <div className="relative -mx-5 overflow-hidden rounded-b-[2.5rem]">
        <div className="absolute left-5 top-4 z-10">
          <BackButton
            fallbackHref={sessionId ? `/exercises/${sessionId}` : "/exercises"}
          />
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
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
                className="object-cover"
                onError={() => setImageSrc("/images/placeholder.jpg")}
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/30 text-white/60">
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
              className="ui-chip rounded-full p-3 backdrop-blur"
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
              <Badge className="ui-chip border-0">
                {sessionLabel}
              </Badge>
            ) : null}
            {exercise.level ? (
              <Badge className={cn("ui-chip border-0", levelClass)}>
                {exercise.level}
              </Badge>
            ) : null}
            {exercise.equipment ? (
              <Badge className="ui-chip border-0">
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
              className="ui-chip px-3 py-1 text-xs font-medium"
            >
              {muscle}
            </span>
          ))}
        </div>
      ) : null}

      <Tabs defaultValue="terrain" className="space-y-4">
        <TabsList className="ui-surface gap-2 p-1">
          <TabsTrigger className="ui-chip" value="terrain">Terrain</TabsTrigger>
          <TabsTrigger className="ui-chip" value="detail">Détail</TabsTrigger>
        </TabsList>

        <TabsContent value="terrain">
          <div className="grid gap-4">
            <EditorialCard
              title="Matériel"
              content={materielText}
              copyLabel="Copier"
            />
            <EditorialCard
              title="Consignes clés"
              content={consignesText}
              copyLabel="Copier consignes"
              displayMode="smartList"
            />
            <EditorialCard
              title="Dosage"
              content={dosageText}
              copyLabel="Copier dosage"
              displayMode="smartList"
            />
            <EditorialCard
              title="Sécurité"
              content={securiteText}
              copyLabel="Copier"
              displayMode="smartList"
            />
          </div>
        </TabsContent>

        <TabsContent value="detail">
          <div className="grid gap-4">
            {detailSections.length ? (
              <DetailSections sections={detailSections} />
            ) : (
              <GlassCard>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  Détail
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Aucun détail disponible.
                </p>
              </GlassCard>
            )}
            {complementsText ? (
              <GlassCard>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  Compléments
                </p>
                <div className="mt-3 max-w-prose">
                  <GlossaryText text={complementsText} />
                </div>
              </GlassCard>
            ) : null}
            {sourcesText ? (
              <GlassCard>
                <p className="text-xs uppercase tracking-widest text-white/60">
                  Sources de l&apos;exercice
                </p>
                <div className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {sourcesText}
                </div>
              </GlassCard>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

