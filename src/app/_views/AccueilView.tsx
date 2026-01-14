import Link from "next/link";
import { Search } from "lucide-react";
import { FlyerHeader } from "@/components/FlyerHeader";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MuscuProjectPicker } from "@/components/muscu/MuscuProjectPicker";
import { MuscuQuickLog } from "@/components/muscu/MuscuQuickLog";
import { muscuExercises, stretches } from "@/lib/muscu";

export function AccueilView() {
  return (
    <div className="space-y-8">
      <FlyerHeader />

      <header className="space-y-3">
        <h1 className="font-display text-2xl font-semibold text-white">
          GUIDE MUSCULATION
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="ui-btn-primary">
            <Link href="/entrainement">Choisir un projet</Link>
          </Button>
          <Button asChild variant="secondary" className="ui-chip">
            <Link href="/bibliotheque">Bibliothèque</Link>
          </Button>
        </div>
      </header>

      <GlassCard className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">Topo</p>
        <p className="text-sm text-white/70">
          Choisir un projet, comprendre les paramètres, s&apos;entraîner, puis se
          situer pour progresser.
        </p>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/entrainement" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              S&apos;entraîner
            </p>
            <h2 className="text-lg font-semibold text-white">Projets</h2>
            <p className="text-sm text-white/70">
              Endurance / Volume / Puissance
            </p>
          </GlassCard>
        </Link>

        <Link href="/connaissances" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Connaissances
            </p>
            <h2 className="text-lg font-semibold text-white">
              Anatomie et contractions
            </h2>
            <p className="text-sm text-white/70">
              Anatomie / Contractions / Méthodes
            </p>
          </GlassCard>
        </Link>

        <Link href="/evaluation" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Évaluation
            </p>
            <h2 className="text-lg font-semibold text-white">
              Se situer par niveau
            </h2>
            <p className="text-sm text-white/70">
              Seconde / Première / CAP / Terminale
            </p>
          </GlassCard>
        </Link>

        <Link href="/bibliotheque" className="block">
          <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Bibliothèque
            </p>
            <h2 className="text-lg font-semibold text-white">
              Exercices et outils
            </h2>
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
          <Link href="/carnet">Ouvrir le carnet</Link>
        </Button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-white">
            Accès rapide
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/bibliotheque">Ouvrir Bibliothèque</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/evaluation">Aller à l&apos;Évaluation</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="ui-chip">
              <Link href="/connaissances">Ouvrir Connaissances</Link>
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
