"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { V3Header } from "@/components/v3/V3Header";
import { V3Badge } from "@/components/v3/ui/V3Badge";
import { V3Button } from "@/components/v3/ui/V3Button";
import { V3Card } from "@/components/v3/ui/V3Card";
import { V3EmptyState } from "@/components/v3/ui/V3EmptyState";
import { useV3Store } from "@/lib/v3/store";

export default function SeanceExercisePage() {
  const params = useParams<{ id: string }>();
  const { exercises, profile } = useV3Store();
  const exercise = exercises.find((item) => item.id === params.id);
  const theme = profile?.theme ?? "VOLUME";

  if (!exercise) {
    return (
      <V3EmptyState
        title="Exercice introuvable"
        description="Retourne à la bibliothèque pour choisir un autre exercice."
      />
    );
  }

  const paramsTheme = exercise.paramsByTheme[theme];

  return (
    <div className="space-y-6">
      <V3Header title="Séances" subtitle="Fiche exercice" />

      <V3Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[color:var(--v3-text)]">
              {exercise.name}
            </p>
            <p className="text-xs text-[color:var(--v3-text-muted)]">
              {exercise.muscles.join(" · ")}
            </p>
          </div>
          <span className="text-xs text-[color:var(--v3-text-muted)]">
            {"★".repeat(exercise.difficulty)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exercise.equipment.map((item) => (
            <V3Badge key={item} tone="neutral">
              {item}
            </V3Badge>
          ))}
        </div>
      </V3Card>

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Placement / Exécution</p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-[color:var(--v3-text-muted)]">
          {exercise.technique.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
      </V3Card>

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">Sécurité</p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-[color:var(--v3-text-muted)]">
          {exercise.technique.safety.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </V3Card>

      <V3Card className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[color:var(--v3-text)]">
            Erreurs fréquentes
          </p>
          <AlertTriangle className="h-4 w-4 text-[color:var(--v3-accent-power)]" />
        </div>
        <ul className="list-disc space-y-1 pl-5 text-xs text-[color:var(--v3-text-muted)]">
          {exercise.technique.commonMistakes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </V3Card>

      <V3Card className="space-y-2">
        <p className="text-sm font-semibold text-[color:var(--v3-text)]">
          Paramètres recommandés
        </p>
        <div className="grid gap-2 text-xs text-[color:var(--v3-text-muted)]">
          <span>Séries: {paramsTheme.setsRange[0]}–{paramsTheme.setsRange[1]}</span>
          <span>Reps: {paramsTheme.repsRange[0]}–{paramsTheme.repsRange[1]}</span>
          <span>Repos: {paramsTheme.restSecRange[0]}–{paramsTheme.restSecRange[1]} s</span>
          <span>Intensité: {paramsTheme.intensityHint}</span>
        </div>
      </V3Card>

      <V3Button asChild>
        <Link href={`/seances?tab=creer&add=${exercise.id}`}>Ajouter à ma séance</Link>
      </V3Button>
    </div>
  );
}
