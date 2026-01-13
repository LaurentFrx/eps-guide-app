import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { evaluationProfiles, knowledgeThemes, muscuExercises, stretches } from "@/lib/muscu";

export default function MuscuAccueilPage() {
  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Apercu
        </p>
        <p className="text-sm text-white/70">
          Ce module centralise les contenus de musculation, des exercices aux
          criteres d evaluation.
        </p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Sommaire
        </p>
        <div className="grid gap-2 text-sm text-white/80">
          <div>Exercices ({muscuExercises.length})</div>
          <div>Etirements ({stretches.length})</div>
          <div>Revisions ({knowledgeThemes.length})</div>
          <div>Evaluation ({evaluationProfiles.length})</div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Ressources PDF
        </p>
        <p className="text-sm text-white/70">
          Fiches synthese et methodes en lecture mobile.
        </p>
        <Link href="/bac/musculation" className="ui-link text-sm font-medium">
          Ouvrir la bibliotheque
        </Link>
      </GlassCard>
    </div>
  );
}
