import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function MuscuEvaluationTerminalePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Terminale
        </p>
        <h2 className="font-display text-2xl font-semibold text-white">
          Repères d evaluation
        </h2>
        <p className="text-sm text-white/70">
          Affiner le projet, stabiliser les paramètres et se situer.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Referentiels
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/musculation/evaluation/terminale/bac-lgt" className="ui-link">
            Bac LGT
          </Link>
          <Link href="/musculation/evaluation/terminale/bac-pro" className="ui-link">
            Bac Pro
          </Link>
        </div>
      </GlassCard>

      <Link href="/musculation/evaluation" className="ui-link text-sm">
        Retour à l&rsquo;évaluation
      </Link>
    </div>
  );
}
