import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function MuscuEvaluationCapPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">CAP</p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Progression ciblée
        </h2>
        <p className="text-sm text-white/70">
          Construire un projet simple et mesurer les progrès.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Routine claire, objectifs précis, régulation régulière.
        </p>
      </GlassCard>

      <Link href="/musculation/evaluation" className="ui-link text-sm">
        Retour à l&rsquo;évaluation
      </Link>
    </div>
  );
}
