import Link from "next/link";
import { Search } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MuscuProjectPicker } from "@/components/muscu/MuscuProjectPicker";
import { MuscuQuickLog } from "@/components/muscu/MuscuQuickLog";
import { muscuExercises, stretches } from "@/lib/muscu";

export default function MuscuAccueilPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h2 className="font-display text-2xl font-semibold text-white">
          GUIDE MUSCULATION
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="ui-btn-primary">
            <Link href="/musculation/entrainement">Choisir un projet</Link>
          </Button>
          <Button asChild variant="secondary" className="ui-chip">
            <Link href="/musculation/bibliotheque">Bibliothèque</Link>
          </Button>
        </div>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Topo</p>
        <p className="text-sm text-white/70">
          Choisir un projet, comprendre les paramètres, s&rsquo;entraîner, puis
          se situer pour progresser.
        </p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/musculation/entrainement" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              S&rsquo;entraîner
            </p>
            <h3 className="text-lg font-semibold text-white">Projets</h3>
            <p className="text-sm text-white/70">
              Endurance / Volume / Puissance
            </p>
          </GlassCard>
        </Link>

        <Link href="/musculation/connaissances" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Connaissances
            </p>
            <h3 className="text-lg font-semibold text-white">
              Anatomie et contractions
            </h3>
            <p className="text-sm text-white/70">
              Anatomie / Contractions / Méthodes
            </p>
          </GlassCard>
        </Link>

        <Link href="/musculation/evaluation" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Évaluation
            </p>
            <h3 className="text-lg font-semibold text-white">
              Se situer par niveau
            </h3>
            <p className="text-sm text-white/70">
              Seconde / Première / CAP / Terminale
            </p>
          </GlassCard>
        </Link>

        <Link href="/musculation/bibliotheque" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Bibliothèque
            </p>
            <h3 className="text-lg font-semibold text-white">
              Exercices et outils
            </h3>
            <p className="text-sm text-white/70">
              Exercices / Étirements / Outils
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-white/70">
              <span className="ui-chip">{muscuExercises.length} exercices</span>
              <span className="ui-chip">{stretches.length} étirements</span>
            </div>
          </GlassCard>
        </Link>
      </div>

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Outils terrain
        </p>
        <MuscuProjectPicker />
        <MuscuQuickLog />
        <Button asChild size="sm" variant="secondary" className="ui-chip">
          <Link href="/musculation/carnet">Ouvrir le carnet</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-white">
            Accès rapide
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/musculation/bibliotheque">Ouvrir Bibliothèque</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/musculation/evaluation">Aller à l&rsquo;Évaluation</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/musculation/connaissances">Ouvrir Connaissances</Link>
            </Button>
          </div>
        </div>
        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Recherche rapide
          </p>
          <form action="/search" method="get" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <Input
                name="q"
                placeholder="Planche, squat, S2-03..."
                className="pl-9"
              />
            </div>
            <Button type="submit" className="ui-btn-primary shrink-0">
              Chercher
            </Button>
          </form>
        </GlassCard>
      </section>
    </div>
  );
}
