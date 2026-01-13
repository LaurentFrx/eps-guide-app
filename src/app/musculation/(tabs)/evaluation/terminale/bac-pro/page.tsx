import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function MuscuEvaluationBacProPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Terminale — Bac Pro
        </p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Repères Bac Pro
        </h2>
        <p className="text-sm text-white/70">
          Référentiel et attentes pour le bac professionnel.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Objectifs clairs, ajustements réguliers, autonomie progressive.
        </p>
      </GlassCard>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/musculation/evaluation/terminale" className="ui-link">
          Retour Terminale
        </Link>
        <Link href="/musculation/evaluation" className="ui-link">
          Retour à l&rsquo;évaluation
        </Link>
      </div>
    </div>
  );
}
