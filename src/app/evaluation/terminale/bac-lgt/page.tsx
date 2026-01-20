import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function EvaluationBacLgtPage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Terminale - Bac LGT
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Repères Bac LGT
        </h1>
        <p className="text-sm text-white/70">
          Référentiel et attentes pour le bac général/technologique.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Stabiliser le projet, argumenter les choix et réguler les séances.
        </p>
      </GlassCard>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/evaluation/terminale" className="ui-link">
          Retour Terminale
        </Link>
        <Link href="/evaluation" className="ui-link">
          Retour à l&apos;évaluation
        </Link>
      </div>
    </div>
  );
}
