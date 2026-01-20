import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

const PROJECTS = [
  {
    id: "endurance",
    title: "Endurance",
    summary: "Stabiliser, tenir l'effort et enchaîner les répétitions.",
  },
  {
    id: "volume",
    title: "Volume",
    summary: "Développer la masse musculaire avec surcharge progressive.",
  },
  {
    id: "puissance",
    title: "Puissance",
    summary: "Produire vite et fort avec une exécution explosive.",
  },
];

export default function EntrainementPage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          S&apos;entraîner
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Projets et paramètres
        </h1>
        <p className="text-sm text-white/70">
          Choisir un projet, fixer les paramètres, appliquer les méthodes, puis
          réaliser des séances.
        </p>
      </header>

      <div className="grid gap-4">
        {PROJECTS.map((project) => (
          <GlassCard key={project.id} className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-white/60">
              Projet
            </p>
            <h2 className="text-lg font-semibold text-white">{project.title}</h2>
            <p className="text-sm text-white/70">{project.summary}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/connaissances#parametres" className="ui-link">
                Paramètres
              </Link>
              <Link href="/connaissances#methodes" className="ui-link">
                Méthodes
              </Link>
              <Link href="/exercises" className="ui-link">
                Séances type
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Carnet et progression
        </p>
        <p className="text-sm text-white/70">
          Consigner la séance, le ressenti et les ajustements pour progresser
          plus vite.
        </p>
        <Link href="/carnet" className="ui-link text-sm font-medium">
          Ouvrir le carnet rapide
        </Link>
      </GlassCard>
    </div>
  );
}
