import Link from "next/link";
import { ArrowUpRight, Dumbbell } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";

export default function BacLandingPage() {
  return (
    <div className="space-y-6 pb-8 animate-in fade-in-0 slide-in-from-bottom-3">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Ressources musculation
        </p>
        <h1 className="font-display text-3xl font-semibold text-white">
          Fiches musculation, lecture mobile
        </h1>
        <p className="text-sm text-white/70">
          Acces direct aux contenus essentiels, lisibles sur terrain et
          disponibles hors ligne apres ouverture.
        </p>
      </header>

      <Link href="/bac/musculation" className="block">
        <GlassCard className="space-y-3 transition hover:-translate-y-0.5 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-white/60">
                Dossier PDF
              </p>
              <h2 className="font-display text-2xl font-semibold text-white">
                Musculation (17 PDF)
              </h2>
              <p className="text-sm text-white/70">
                Epreuve, projets, methodes, performance et ressources prof.
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-white/70" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ui-chip inline-flex items-center gap-2 px-3 py-1 text-xs font-medium">
              <Dumbbell className="h-4 w-4" />
              Musculation
            </span>
            <span className="ui-chip inline-flex items-center gap-2 px-3 py-1 text-xs font-medium">
              Lecture offline
            </span>
          </div>
        </GlassCard>
      </Link>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Prochainement
        </p>
        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold text-white">
            Autres dossiers en preparation
          </h2>
          <p className="text-sm text-white/70">
            Les modules EPS arriveront ici avec le meme format terrain.
          </p>
        </div>
        <Button asChild variant="secondary" className="ui-chip">
          <Link href="/musculation">Voir le guide Musculation</Link>
        </Button>
      </GlassCard>
    </div>
  );
}
