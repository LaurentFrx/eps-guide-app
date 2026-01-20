import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

export default function EvaluationPremierePage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Première</p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Consolider et planifier
        </h1>
        <p className="text-sm text-white/70">
          Structurer les séances, suivre les charges et tenir le rythme.
        </p>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Focus</p>
        <p className="text-sm text-white/70">
          Maintenir la régularité, apprendre à s&apos;auto-réguler.
        </p>
      </GlassCard>

      <Link href="/evaluation" className="ui-link text-sm">
        Retour à l&apos;évaluation
      </Link>
    </div>
  );
}
