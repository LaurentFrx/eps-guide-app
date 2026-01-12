import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { evaluationProfiles, knowledgeThemes, muscuExercises, stretches } from "@/lib/muscu";

export default function MuscuAccueilPage() {
  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Guide
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
          <Link href="/musculation/exercices" className="ui-link">
            Exercices ({muscuExercises.length})
          </Link>
          <Link href="/musculation/etirements" className="ui-link">
            Etirements ({stretches.length})
          </Link>
          <Link href="/musculation/connaissances" className="ui-link">
            Connaissances ({knowledgeThemes.length})
          </Link>
          <Link href="/musculation/evaluation" className="ui-link">
            Evaluation ({evaluationProfiles.length})
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
