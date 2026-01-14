import Link from "next/link";
import { GlassCard } from "@/components/GlassCard";
import { stretches } from "@/lib/muscu";

export default function EtirementsPage() {
  return (
    <div className="space-y-6">
      <Link href="/accueil" className="ui-link text-sm font-medium">
        ← Accueil
      </Link>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Étirements
        </p>
        <h1 className="font-display text-2xl font-semibold text-white">
          Fiches rapides
        </h1>
        <p className="text-sm text-white/70">
          Séries courtes pour relâcher et récupérer après la séance.
        </p>
      </header>

      <div className="space-y-4">
        {stretches.map((stretch) => (
          <GlassCard key={stretch.id} className="space-y-2">
            <h2 className="text-lg font-semibold text-white">{stretch.title}</h2>
            <div className="flex flex-wrap gap-2">
              {stretch.target.map((item) => (
                <span key={item} className="ui-chip rounded-full px-3 py-1 text-xs">
                  {item}
                </span>
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">
              {stretch.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
