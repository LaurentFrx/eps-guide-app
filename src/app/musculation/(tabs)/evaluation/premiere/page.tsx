import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function MuscuEvaluationPremierePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Première</p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Planifier et ajuster
        </h2>
        <p className="text-sm text-white/70">
          Stabiliser le projet, organiser les séances et suivre la progression.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Renforcer les paramètres et commencer un suivi régulier.
        </p>
      </GlassCard>

      <Link href="/musculation/evaluation" className="ui-link text-sm">
        Retour à l&rsquo;évaluation
      </Link>
    </div>
  );
}
