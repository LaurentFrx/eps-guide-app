import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function EvaluationCapPage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">CAP</p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Objectifs ciblés
        </h1>
        <p className="text-sm text-white/70">
          Stabiliser le projet et ajuster la progression par paliers.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Tenir la technique, suivre les consignes de sécurité.
        </p>
      </GlassCard>

      <Link href="/evaluation" className="ui-link text-sm">
        Retour à l&apos;évaluation
      </Link>
    </div>
  );
}
