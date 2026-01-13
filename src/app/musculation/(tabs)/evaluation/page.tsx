import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { MuscuEvaluationView } from "@/components/muscu/MuscuEvaluationView";
import { evaluationInfographicsBySection, evaluationProfiles } from "@/lib/muscu";

export default function MuscuEvaluationPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Évaluation
        </p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Se situer par niveau
        </h2>
        <p className="text-sm text-white/70">
          Repères pour suivre la progression et les attendus par niveau.
        </p>
      </header>

      <div className="grid gap-4">
        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Seconde
          </p>
          <p className="text-sm text-white/70">
            Découverte, technique et premières régulations.
          </p>
          <Link href="/musculation/evaluation/seconde" className="ui-link text-sm">
            Ouvrir Seconde
          </Link>
        </GlassCard>

        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Première
          </p>
          <p className="text-sm text-white/70">
            Consolidation, planification simple et suivi régulier.
          </p>
          <Link href="/musculation/evaluation/premiere" className="ui-link text-sm">
            Ouvrir Première
          </Link>
        </GlassCard>

        <GlassCard className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-white/60">CAP</p>
          <p className="text-sm text-white/70">
            Objectifs ciblés, progression par paliers.
          </p>
          <Link href="/musculation/evaluation/cap" className="ui-link text-sm">
            Ouvrir CAP
          </Link>
        </GlassCard>

        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Terminale
          </p>
          <p className="text-sm text-white/70">
            Préparation des attendus, projets stables, auto-évaluation.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/musculation/evaluation/terminale" className="ui-link">
              Ouvrir Terminale
            </Link>
            <Link href="/musculation/evaluation/terminale/bac-lgt" className="ui-link">
              Bac LGT
            </Link>
            <Link href="/musculation/evaluation/terminale/bac-pro" className="ui-link">
              Bac Pro
            </Link>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Référentiel commun
        </p>
        <p className="text-sm text-white/70">
          Repères utiles à tous les niveaux pour situer la progression.
        </p>
      </GlassCard>

      <MuscuEvaluationView
        sections={evaluationProfiles[0]?.sections ?? []}
        infographicsBySection={evaluationInfographicsBySection}
      />
    </div>
  );
}
