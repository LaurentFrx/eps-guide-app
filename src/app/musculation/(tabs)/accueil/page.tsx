import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { MuscuProjectPicker } from "@/components/muscu/MuscuProjectPicker";
import { MuscuQuickLog } from "@/components/muscu/MuscuQuickLog";
import { evaluationProfiles, knowledgeThemes, muscuExercises, stretches } from "@/lib/muscu";

export default function MuscuAccueilPage() {
  return (
    <div className="space-y-6">
      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">Topo</p>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-white/70">
          <li>Choisir un projet (Endurance, Volume, Puissance).</li>
          <li>Comprendre les parametres et les methodes.</li>
          <li>Construire et realiser une seance.</li>
          <li>Se situer et evaluer les progres.</li>
        </ol>
      </GlassCard>

      <div className="grid gap-4">
        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            S’entraîner / Projets
          </p>
          <p className="text-sm text-white/70">
            Choisir un projet et appliquer les parametres pour progresser.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="ui-chip">Endurance</span>
            <span className="ui-chip">Volume</span>
            <span className="ui-chip">Puissance</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/musculation/accueil" className="ui-link font-medium">
              Ouvrir S’entraîner
            </Link>
            <Link href="/musculation/connaissances" className="ui-link">
              Parametres
            </Link>
            <Link href="/musculation/connaissances" className="ui-link">
              Methodes
            </Link>
            <Link href="/musculation/accueil" className="ui-link">
              Seances type
            </Link>
          </div>
        </GlassCard>

        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Connaissances
          </p>
          <p className="text-sm text-white/70">
            Anatomie, contractions et methodes pour comprendre les effets.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="ui-chip">Anatomie</span>
            <span className="ui-chip">Contractions</span>
            <span className="ui-chip">Methodes</span>
          </div>
          <Link href="/musculation/connaissances" className="ui-link text-sm font-medium">
            Ouvrir Connaissances
          </Link>
        </GlassCard>

        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Évaluation
          </p>
          <p className="text-sm text-white/70">
            Se situer par niveau, avec les reperes Bac LGT/Pro.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="ui-chip">Seconde</span>
            <span className="ui-chip">Première</span>
            <span className="ui-chip">CAP</span>
            <span className="ui-chip">Terminale</span>
          </div>
          <Link href="/musculation/evaluation" className="ui-link text-sm font-medium">
            Ouvrir Évaluation
          </Link>
        </GlassCard>

        <GlassCard className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-white/60">
            Bibliothèque
          </p>
          <p className="text-sm text-white/70">
            Exercices par zones + etirements pour completer les seances.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="ui-chip">Abdos</span>
            <span className="ui-chip">Dorsaux</span>
            <span className="ui-chip">Membres sup.</span>
            <span className="ui-chip">Membres inf.</span>
            <span className="ui-chip">Cross</span>
            <span className="ui-chip">Étirements</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/musculation/exercices" className="ui-link font-medium">
              Ouvrir la Bibliothèque
            </Link>
            <Link href="/musculation/etirements" className="ui-link">
              Étirements
            </Link>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <MuscuProjectPicker />
        <MuscuQuickLog />
      </div>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Sommaire
        </p>
        <div className="grid gap-2 text-sm text-white/80">
          <div>Exercices ({muscuExercises.length})</div>
          <div>Etirements ({stretches.length})</div>
          <div>Revisions ({knowledgeThemes.length})</div>
          <div>Evaluation ({evaluationProfiles.length})</div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Ressources PDF
        </p>
        <p className="text-sm text-white/70">
          Fiches synthese et methodes en lecture mobile.
        </p>
        <Link href="/bac/musculation" className="ui-link text-sm font-medium">
          Ouvrir la bibliotheque
        </Link>
      </GlassCard>

      <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        <Link href="/search" className="ui-link">
          Recherche
        </Link>
        <Link href="/favorites" className="ui-link">
          Favoris
        </Link>
      </div>
    </div>
  );
}
