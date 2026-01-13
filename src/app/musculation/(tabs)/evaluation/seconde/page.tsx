import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function MuscuEvaluationSecondePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Seconde</p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Bases techniques et sécurité
        </h2>
        <p className="text-sm text-white/70">
          Installer les repères de base, comprendre les sensations et ajuster
          progressivement.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Prioriser l exécution, la posture et la régularité.
        </p>
      </GlassCard>

      <Link href="/musculation/evaluation" className="ui-link text-sm">
        Retour à l&rsquo;évaluation
      </Link>
    </div>
  );
}
