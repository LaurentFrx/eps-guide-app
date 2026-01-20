import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function EvaluationTerminalePage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Terminale
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Repères d&apos;évaluation
        </h1>
        <p className="text-sm text-white/70">
          Affiner le projet, stabiliser les paramètres et se situer.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Référentiels
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/evaluation/terminale/bac-lgt" className="ui-link">
            Bac LGT
          </Link>
          <Link href="/evaluation/terminale/bac-pro" className="ui-link">
            Bac Pro
          </Link>
        </div>
      </GlassCard>

      <Link href="/evaluation" className="ui-link text-sm">
        Retour à l&apos;évaluation
      </Link>
    </div>
  );
}
