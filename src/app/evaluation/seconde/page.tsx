import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function EvaluationSecondePage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Seconde</p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Bases techniques et sécurité
        </h1>
        <p className="text-sm text-white/70">
          Installer les repères de base, comprendre les sensations et ajuster
          progressivement.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Prioriser l&apos;exécution, la posture et la régularité.
        </p>
      </GlassCard>

      <Link href="/evaluation" className="ui-link text-sm">
        Retour à l&apos;évaluation
      </Link>
    </div>
  );
}
