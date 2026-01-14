import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";

const CATEGORIES = [
  { id: "abdos", label: "Abdos" },
  { id: "dorsaux", label: "Dorsaux" },
  { id: "membres-sup", label: "Membres supérieurs" },
  { id: "membres-inf", label: "Membres inférieurs" },
  { id: "cross", label: "Cross / Functional" },
];

const FROM_BIB = "/bibliotheque";

export default function BibliothequePage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Bibliothèque
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Exercices et étirements
        </h1>
        <p className="text-sm text-white/70">
          Accéder aux catégories et filtrer les exercices selon les besoins.
        </p>
      </header>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Catégories exercices
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          {CATEGORIES.map((category) => (
            <span key={category.id} className="ui-chip">
              {category.label}
            </span>
          ))}
        </div>
        <Link
          href={`/exercices?from=${encodeURIComponent(FROM_BIB)}`}
          className="ui-link text-sm font-medium"
        >
          Ouvrir les exercices
        </Link>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Étirements
        </p>
        <p className="text-sm text-white/70">
          Fiches rapides pour terminer la séance et récupérer.
        </p>
        <Link
          href={`/etirements?from=${encodeURIComponent(FROM_BIB)}`}
          className="ui-link text-sm font-medium"
        >
          Ouvrir les étirements
        </Link>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Bibliothèque complète
        </p>
        <p className="text-sm text-white/70">
          Accès direct à la bibliothèque EPS complète.
        </p>
        <Link
          href={`/exercises?from=${encodeURIComponent(FROM_BIB)}`}
          className="ui-link text-sm font-medium"
        >
          Voir la bibliothèque EPS
        </Link>
      </GlassCard>
    </div>
  );
}
